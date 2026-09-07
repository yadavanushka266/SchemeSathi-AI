/* All 28 states + 8 union territories, each with its real districts.
   The district field in the form is rendered as a text input with these
   as suggestions (see FormComboBox in PersonalInfoPage.jsx) -- so every
   state shows its own full district list, but a beneficiary can still
   type any town/city/village that isn't in this list. A fixed dropdown
   can never contain literally every place name in India, so "suggest +
   allow free text" is the only approach that doesn't block anyone. */

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
];

export const STATE_DISTRICTS = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Changlang", "Tirap", "Lohit", "Namsai"],
  "Assam": ["Kamrup", "Kamrup Metropolitan", "Dibrugarh", "Jorhat", "Sivasagar", "Tinsukia", "Nagaon", "Barpeta", "Cachar", "Karimganj", "Golaghat", "Darrang"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Nalanda", "Rohtas", "Saran", "Vaishali", "Begusarai", "Munger", "Samastipur", "Siwan"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Korba", "Raigarh", "Rajnandgaon", "Jagdalpur (Bastar)", "Surguja", "Dhamtari", "Kanker"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Mehsana", "Kutch", "Navsari", "Valsad", "Patan"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat", "Yamunanagar", "Panchkula", "Sirsa", "Bhiwani"],
  "Himachal Pradesh": ["Shimla", "Kangra", "Mandi", "Solan", "Una", "Bilaspur", "Hamirpur", "Chamba", "Kullu", "Sirmaur", "Kinnaur", "Lahaul and Spiti"],
  "Jharkhand": ["Ranchi", "Jamshedpur (East Singhbhum)", "Dhanbad", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Palamu", "Ramgarh", "Dumka"],
  "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Belagavi", "Hubballi-Dharwad", "Mangaluru (Dakshina Kannada)", "Kalaburagi", "Ballari", "Shivamogga", "Tumakuru", "Davanagere", "Vijayapura", "Udupi"],
  "Kerala": ["Thiruvananthapuram", "Kollam", "Alappuzha", "Kottayam", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Kannur", "Kasaragod", "Idukki", "Wayanad", "Pathanamthitta"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Rewa", "Satna", "Ratlam", "Dewas", "Vidisha", "Chhindwara"],
  "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Sangli", "Satara", "Ahmednagar", "Latur", "Jalgaon", "Raigad"],
  "Manipur": ["Imphal East", "Imphal West", "Thoubal", "Bishnupur", "Churachandpur", "Senapati", "Ukhrul", "Tamenglong"],
  "Meghalaya": ["East Khasi Hills", "West Khasi Hills", "Ri Bhoi", "East Garo Hills", "West Garo Hills", "Jaintia Hills"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Kolasib", "Serchhip", "Mamit"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Khordha", "Cuttack", "Puri", "Ganjam", "Sambalpur", "Sundargarh", "Balasore", "Mayurbhanj", "Rourkela", "Bhadrak"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Ferozepur", "Moga", "Sangrur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Alwar", "Bharatpur", "Sikar", "Bhilwara", "Pali", "Nagaur"],
  "Sikkim": ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Kanchipuram"],
  "Telangana": ["Hyderabad", "Rangareddy", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nalgonda", "Adilabad", "Medchal-Malkajgiri"],
  "Tripura": ["West Tripura", "South Tripura", "North Tripura", "Dhalai", "Khowai", "Sepahijala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur Nagar", "Agra", "Varanasi", "Meerut", "Ghaziabad", "Gautam Buddha Nagar (Noida)", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Jhansi", "Saharanpur", "Muzaffarnagar"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Nainital", "Udham Singh Nagar", "Almora", "Pauri Garhwal", "Tehri Garhwal", "Chamoli"],
  "West Bengal": ["Kolkata", "Howrah", "North 24 Parganas", "South 24 Parganas", "Hooghly", "Nadia", "Darjeeling", "Purba Bardhaman", "Malda", "Murshidabad", "Paschim Medinipur"],
  "Andaman and Nicobar Islands": ["South Andaman", "North and Middle Andaman", "Nicobar"],
  "Chandigarh": ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Baramulla", "Anantnag", "Pulwama", "Budgam", "Kupwara", "Udhampur", "Kathua", "Rajouri"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Lakshadweep"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
};

export function getDistrictsForState(state) {
  return STATE_DISTRICTS[state] || [];
}
