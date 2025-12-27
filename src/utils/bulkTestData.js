import { createDocument, TABLES } from '../services/supabaseService';

const SRI_LANKA_DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
];

const FIRST_NAMES = [
    'Nimal', 'Kamal', 'Sunil', 'Anil', 'Ravi', 'Saman', 'Kumara', 'Prasad',
    'Chaminda', 'Nuwan', 'Samanthi', 'Dilrukshi', 'Madhavi', 'Sachini',
    'Sanduni', 'Thisuri', 'Kaveesha', 'Nimali', 'Chathurika', 'Anusha'
];

const LAST_NAMES = [
    'Fernando', 'Silva', 'Perera', 'de Silva', 'Gunasekara', 'Jayawardena',
    'Wickramasinghe', 'Dissanayake', 'Rajapaksa', 'Mendis', 'Amarasinghe',
    'Weerasinghe', 'Gamage', 'Bandara', 'Kumara', 'Samarasinghe'
];

const DISASTER_TYPES = ['flood', 'landslide', 'fire', 'cyclone', 'drought', 'earthquake'];
const SEVERITIES = ['low', 'moderate', 'high', 'critical'];
const ANIMAL_TYPES = ['dog', 'cat', 'cattle', 'buffalo', 'goat', 'wild-animal'];
const CONDITIONS = ['injured', 'trapped', 'lost', 'healthy'];

// Generate random location within Sri Lanka
const generateLocation = (district) => {
    const districtCoords = {
        'Colombo': { lat: 6.9271, lng: 79.8612 },
        'Gampaha': { lat: 7.0873, lng: 80.0142 },
        'Kalutara': { lat: 6.5854, lng: 79.9607 },
        'Kandy': { lat: 7.2906, lng: 80.6337 },
        'Matale': { lat: 7.4675, lng: 80.6234 },
        'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 },
        'Galle': { lat: 6.0535, lng: 80.2210 },
        'Matara': { lat: 5.9549, lng: 80.5550 },
        'Hambantota': { lat: 6.1429, lng: 81.1212 },
        'Jaffna': { lat: 9.6615, lng: 80.0255 },
        'Kilinochchi': { lat: 9.3961, lng: 80.3981 },
        'Mannar': { lat: 8.9810, lng: 79.9044 },
        'Vavuniya': { lat: 8.7542, lng: 80.4982 },
        'Mullaitivu': { lat: 9.2671, lng: 80.8142 },
        'Batticaloa': { lat: 7.7310, lng: 81.6747 },
        'Ampara': { lat: 7.2914, lng: 81.6747 },
        'Trincomalee': { lat: 8.5874, lng: 81.2152 },
        'Kurunegala': { lat: 7.4818, lng: 80.3609 },
        'Puttalam': { lat: 8.0409, lng: 79.8283 },
        'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
        'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
        'Badulla': { lat: 6.9934, lng: 81.0550 },
        'Monaragala': { lat: 6.8728, lng: 81.3507 },
        'Ratnapura': { lat: 6.7056, lng: 80.3847 },
        'Kegalle': { lat: 7.2513, lng: 80.3464 }
    };

    const baseCoords = districtCoords[district] || { lat: 7.8731, lng: 80.7718 };
    
    return {
        lat: baseCoords.lat + (Math.random() - 0.5) * 0.1,
        lng: baseCoords.lng + (Math.random() - 0.5) * 0.1,
        address: `${district}, Area ${Math.floor(Math.random() * 100)}, Sri Lanka`
    };
};

const generatePhone = () => {
    const prefixes = ['070', '071', '072', '075', '076', '077', '078'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
    return `${prefix}${number}`;
};

const generateRecentDate = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return date.toISOString();
};

export const generateMissingPersons = async (count = 50) => {
    const persons = [];
    
    for (let i = 0; i < count; i++) {
        const district = SRI_LANKA_DISTRICTS[Math.floor(Math.random() * SRI_LANKA_DISTRICTS.length)];
        const location = generateLocation(district);
        const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        
        const person = {
            name: `${firstName} ${lastName}`,
            age: Math.floor(Math.random() * 70) + 10,
            gender: Math.random() > 0.5 ? 'male' : 'female',
            description: `Last seen wearing ${Math.random() > 0.5 ? 'blue shirt' : 'red dress'}. ${Math.random() > 0.5 ? 'Wearing glasses.' : 'Has a scar on left arm.'}`,
            last_seen_location: location,
            last_seen_date: generateRecentDate(),
            reporter_name: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
            contact_number: generatePhone(),
            additional_info: Math.random() > 0.5 ? 'Has medical condition requiring medication' : null,
            status: Math.random() > 0.8 ? 'Resolved' : 'Active',
            photo: null
        };
        
        try {
            const result = await createDocument(TABLES.MISSING_PERSONS, person);
            persons.push(result);
            console.log(`✓ Created missing person ${i + 1}/${count}: ${person.name}`);
        } catch (error) {
            console.error(`✗ Failed to create person ${i + 1}:`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return persons;
};

export const generateDisasters = async (count = 30) => {
    const disasters = [];
    
    for (let i = 0; i < count; i++) {
        const district = SRI_LANKA_DISTRICTS[Math.floor(Math.random() * SRI_LANKA_DISTRICTS.length)];
        const location = generateLocation(district);
        const type = DISASTER_TYPES[Math.floor(Math.random() * DISASTER_TYPES.length)];
        const severity = SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)];
        
        const disaster = {
            disaster_type: type,
            severity: severity,
            description: `${type.charAt(0).toUpperCase() + type.slice(1)} occurred in ${location.address}. ${severity === 'critical' ? 'Immediate assistance required.' : 'Situation being monitored.'}`,
            people_affected: `${Math.floor(Math.random() * 500) + 10}`,
            casualties: Math.random() > 0.7 ? 'major' : 'minor',
            needs: {
                rescue: Math.random() > 0.5,
                medical: Math.random() > 0.6,
                shelter: Math.random() > 0.4,
                food: Math.random() > 0.3,
                water: Math.random() > 0.3
            },
            location: location,
            occurred_date: generateRecentDate(),
            area_size: `${Math.floor(Math.random() * 10) + 1} km²`,
            reporter_name: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
            contact_number: generatePhone(),
            status: Math.random() > 0.7 ? 'Resolved' : 'Active',
            photo: null
        };
        
        try {
            const result = await createDocument(TABLES.DISASTERS, disaster);
            disasters.push(result);
            console.log(`✓ Created disaster ${i + 1}/${count}: ${type} in ${district}`);
        } catch (error) {
            console.error(`✗ Failed to create disaster ${i + 1}:`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return disasters;
};

export const generateAnimalRescues = async (count = 40) => {
    const rescues = [];
    
    for (let i = 0; i < count; i++) {
        const district = SRI_LANKA_DISTRICTS[Math.floor(Math.random() * SRI_LANKA_DISTRICTS.length)];
        const location = generateLocation(district);
        const animalType = ANIMAL_TYPES[Math.floor(Math.random() * ANIMAL_TYPES.length)];
        const condition = CONDITIONS[Math.floor(Math.random() * CONDITIONS.length)];
        
        const rescue = {
            animal_type: animalType,
            breed: animalType === 'dog' ? ['Labrador', 'German Shepherd', 'Mixed', null][Math.floor(Math.random() * 4)] : null,
            description: `${animalType.charAt(0).toUpperCase() + animalType.slice(1)} found in ${location.address}. Appears to be ${condition}.`,
            condition: condition,
            is_dangerous: Math.random() > 0.8,
            location: location,
            reporter_name: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
            contact_number: generatePhone(),
            status: Math.random() > 0.7 ? 'Rescued' : 'Pending',
            photo: null
        };
        
        try {
            const result = await createDocument(TABLES.ANIMAL_RESCUES, rescue);
            rescues.push(result);
            console.log(`✓ Created animal rescue ${i + 1}/${count}: ${animalType} in ${district}`);
        } catch (error) {
            console.error(`✗ Failed to create rescue ${i + 1}:`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return rescues;
};

export const generateCamps = async (count = 20) => {
    const camps = [];
    
    for (let i = 0; i < count; i++) {
        const district = SRI_LANKA_DISTRICTS[Math.floor(Math.random() * SRI_LANKA_DISTRICTS.length)];
        const location = generateLocation(district);
        const capacity = [50, 100, 150, 200, 300, 500][Math.floor(Math.random() * 6)];
        
        const camp = {
            name: `${district} Relief Camp ${i + 1}`,
            type: ['Emergency', 'Temporary', 'Permanent'][Math.floor(Math.random() * 3)],
            capacity: capacity,
            current_occupancy: Math.floor(Math.random() * capacity),
            location: location,
            contact_person: `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`,
            contact_number: generatePhone(),
            facilities: ['Water', 'Electricity', 'Medical', 'Food', 'Shelter'],
            status: Math.random() > 0.8 ? 'Closed' : 'Active'
        };
        
        try {
            const result = await createDocument(TABLES.CAMPS, camp);
            camps.push(result);
            console.log(`✓ Created camp ${i + 1}/${count}: ${camp.name}`);
        } catch (error) {
            console.error(`✗ Failed to create camp ${i + 1}:`, error.message);
        }
        
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return camps;
};

export const generateAllTestData = async () => {
    console.log('🧪 Starting bulk test data generation...');
    console.log('═══════════════════════════════════════════════');
    
    try {
        console.log('\n📋 Generating 50 Missing Persons...');
        await generateMissingPersons(50);
        
        console.log('\n⚠️  Generating 30 Disasters...');
        await generateDisasters(30);
        
        console.log('\n🐕 Generating 40 Animal Rescues...');
        await generateAnimalRescues(40);
        
        console.log('\n⛺ Generating 20 Camps...');
        await generateCamps(20);
        
        console.log('\n═══════════════════════════════════════════════');
        console.log('✅ Bulk test data generation complete!');
        console.log('📊 Total: 50 missing persons, 30 disasters, 40 animal rescues, 20 camps');
        
        return {
            success: true,
            counts: {
                missingPersons: 50,
                disasters: 30,
                animalRescues: 40,
                camps: 20,
                total: 140
            }
        };
    } catch (error) {
        console.error('❌ Error generating test data:', error);
        throw error;
    }
};
