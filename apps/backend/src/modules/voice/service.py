from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.middlewares.error_handler import BusinessRuleException, NotFoundException
from src.modules.beneficiaries.models import Beneficiary
from src.modules.beneficiaries.repository import get_by_phone
from src.modules.voice.conversation_state import is_profile_complete, record_answer
from src.modules.voice.models import CallDirection, CallSession, CallStatus, Speaker, Transcript
from src.modules.voice.schemas import MissedCallWebhook, TranscriptTurnCreate
from src.utils.formatters import normalize_phone_number


async def handle_missed_call(db: AsyncSession, payload: MissedCallWebhook) -> CallSession:
    normalized_phone = normalize_phone_number(payload.phone_number)
    beneficiary = await get_by_phone(db, normalized_phone)
    if not beneficiary:
        beneficiary = Beneficiary(phone_number=normalized_phone)
        db.add(beneficiary)
        await db.flush()

    call_session = CallSession(
        beneficiary_id=beneficiary.id,
        phone_number=normalized_phone,
        direction=CallDirection.INBOUND_MISSED_CALL,
        status=CallStatus.RINGING,
        provider_call_sid=payload.provider_call_sid,
    )
    db.add(call_session)
    await db.commit()
    await db.refresh(call_session)
    return call_session


async def start_callback(db: AsyncSession, call_session_id: str) -> CallSession:
    call_session = await _get_call_session(db, call_session_id)
    call_session.direction = CallDirection.OUTBOUND_CALLBACK
    call_session.status = CallStatus.IN_PROGRESS
    call_session.started_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(call_session)
    return call_session


async def record_transcript_turn(db: AsyncSession, call_session_id: str, payload: TranscriptTurnCreate) -> Transcript:
    call_session = await _get_call_session(db, call_session_id)
    transcript = Transcript(call_session_id=call_session.id, speaker=payload.speaker, text=payload.text, confidence=payload.confidence)
    db.add(transcript)

    if payload.speaker == Speaker.BENEFICIARY:
        from src.modules.voice.conversation_state import get_next_question_field

        pending_field = get_next_question_field(call_session.conversation_state)
        if pending_field:
            try:
                call_session.conversation_state = record_answer(call_session.conversation_state, pending_field, payload.text)
            except ValueError as exc:
                raise BusinessRuleException(str(exc)) from exc

    await db.commit()
    await db.refresh(transcript)
    return transcript


async def complete_call(db: AsyncSession, call_session_id: str) -> CallSession:
    call_session = await _get_call_session(db, call_session_id)
    call_session.status = CallStatus.COMPLETED
    call_session.ended_at = datetime.now(timezone.utc)

    if is_profile_complete(call_session.conversation_state) and call_session.beneficiary_id:
        beneficiary_result = await db.execute(select(Beneficiary).where(Beneficiary.id == call_session.beneficiary_id))
        beneficiary = beneficiary_result.scalar_one_or_none()
        if beneficiary:
            collected = call_session.conversation_state.get("collected_fields", {})
            for field, value in collected.items():
                if hasattr(beneficiary, field):
                    setattr(beneficiary, field, value)
            from src.modules.beneficiaries.models import JourneyState

            beneficiary.journey_state = JourneyState.PROFILED

    await db.commit()
    await db.refresh(call_session)
    return call_session


async def get_call_session(db: AsyncSession, call_session_id: str) -> CallSession:
    return await _get_call_session(db, call_session_id)


async def _get_call_session(db: AsyncSession, call_session_id: str) -> CallSession:
    result = await db.execute(select(CallSession).where(CallSession.id == call_session_id))
    call_session = result.scalar_one_or_none()
    if not call_session:
        raise NotFoundException("Call session not found")
    return call_session
