// Mock data for Disaster Relief Camps - Database-ready structure
// For post-disaster management: shelter, food, medical services

const mockCamps = [
  {
    id: 1,
    campName: 'Colombo Flood Relief Center',
    campType: 'temporary-shelter',
    status: 'Active',
    capacity: 500,
    currentOccupancy: 387,
    location: {
      address: 'Community Center, Borella, Colombo',
      lat: 6.9147,
      lng: 79.8804,
    },
    district: 'Colombo',
    openedDate: '2024-01-17T09:00:00Z',
    closedDate: null,
    disasterType: 'flood',
    facilities: {
      shelter: true,
      food: true,
      water: true,
      medical: true,
      sanitation: true,
      security: true,
      electricity: true,
      communication: true
    },
    supplies: {
      food: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T12:00:00Z' },
      water: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T12:00:00Z' },
      medicine: { available: true, stock: 'low', lastUpdated: '2024-01-17T10:00:00Z' },
      blankets: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T09:00:00Z' },
      clothing: { available: true, stock: 'low', lastUpdated: '2024-01-17T09:00:00Z' }
    },
    contactPerson: {
      name: 'Mr. Kamal Perera',
      role: 'Camp Coordinator',
      phone: '0771234567'
    },
    needs: ['Medicine', 'Clothing', 'Volunteers'],
    notes: 'Urgent need for medical supplies and volunteers. Camp running at 77% capacity.',
  },
  {
    id: 2,
    campName: 'Nuwara Eliya Landslide Evacuation Camp',
    campType: 'emergency-evacuation',
    status: 'Active',
    capacity: 300,
    currentOccupancy: 275,
    location: {
      address: 'Sports Ground, Nuwara Eliya Town',
      lat: 6.9497,
      lng: 80.7891,
    },
    district: 'Nuwara Eliya',
    openedDate: '2024-01-16T15:00:00Z',
    closedDate: null,
    disasterType: 'landslide',
    facilities: {
      shelter: true,
      food: true,
      water: true,
      medical: true,
      sanitation: true,
      security: true,
      electricity: false,
      communication: true
    },
    supplies: {
      food: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T08:00:00Z' },
      water: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T08:00:00Z' },
      medicine: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T07:00:00Z' },
      blankets: { available: true, stock: 'critical', lastUpdated: '2024-01-17T06:00:00Z' },
      clothing: { available: true, stock: 'low', lastUpdated: '2024-01-16T15:00:00Z' }
    },
    contactPerson: {
      name: 'Mrs. Kumari Silva',
      role: 'Camp Manager',
      phone: '0712345678'
    },
    needs: ['Blankets', 'Warm Clothing', 'Electricity Generator'],
    notes: 'Cold weather - urgent need for blankets and warm clothing. No electricity currently.',
  },
  {
    id: 3,
    campName: 'Galle Cyclone Relief Camp',
    campType: 'temporary-shelter',
    status: 'Active',
    capacity: 400,
    currentOccupancy: 310,
    location: {
      address: 'School Premises, Galle Fort area',
      lat: 6.0270,
      lng: 80.2168,
    },
    district: 'Galle',
    openedDate: '2024-01-17T07:00:00Z',
    closedDate: null,
    disasterType: 'cyclone',
    facilities: {
      shelter: true,
      food: true,
      water: true,
      medical: true,
      sanitation: true,
      security: true,
      electricity: true,
      communication: true
    },
    supplies: {
      food: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T11:00:00Z' },
      water: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T11:00:00Z' },
      medicine: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T09:00:00Z' },
      blankets: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T07:00:00Z' },
      clothing: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T07:00:00Z' }
    },
    contactPerson: {
      name: 'Mr. Chaminda Fernando',
      role: 'Camp Coordinator',
      phone: '0775234567'
    },
    needs: ['Hygiene Items', 'Children\'s Supplies'],
    notes: 'Well-stocked camp. Need hygiene items and supplies for children.',
  },
  {
    id: 4,
    campName: 'Badulla Emergency Shelter',
    campType: 'emergency-evacuation',
    status: 'Active',
    capacity: 600,
    currentOccupancy: 520,
    location: {
      address: 'Community Hall, Badulla Town',
      lat: 6.9934,
      lng: 81.0550,
    },
    district: 'Badulla',
    openedDate: '2024-01-17T06:00:00Z',
    closedDate: null,
    disasterType: 'landslide',
    facilities: {
      shelter: true,
      food: true,
      water: true,
      medical: true,
      sanitation: true,
      security: true,
      electricity: true,
      communication: true
    },
    supplies: {
      food: { available: true, stock: 'low', lastUpdated: '2024-01-17T10:00:00Z' },
      water: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T10:00:00Z' },
      medicine: { available: true, stock: 'critical', lastUpdated: '2024-01-17T08:00:00Z' },
      blankets: { available: true, stock: 'low', lastUpdated: '2024-01-17T06:00:00Z' },
      clothing: { available: true, stock: 'critical', lastUpdated: '2024-01-17T06:00:00Z' }
    },
    contactPerson: {
      name: 'Dr. Nimal Pathirana',
      role: 'Camp Medical Officer',
      phone: '0773334567'
    },
    needs: ['Food', 'Medicine', 'Clothing', 'Blankets'],
    notes: 'Critical shortage of medicine and clothing. Large number of evacuees. Urgent assistance needed.',
  },
  {
    id: 5,
    campName: 'Anuradhapura Flood Relief Center',
    campType: 'temporary-shelter',
    status: 'Closed',
    capacity: 200,
    currentOccupancy: 0,
    location: {
      address: 'Temple Premises, Anuradhapura',
      lat: 8.3114,
      lng: 80.4037,
    },
    district: 'Anuradhapura',
    openedDate: '2024-01-16T13:00:00Z',
    closedDate: '2024-01-17T09:00:00Z',
    disasterType: 'flood',
    facilities: {
      shelter: true,
      food: true,
      water: true,
      medical: false,
      sanitation: true,
      security: false,
      electricity: false,
      communication: true
    },
    supplies: {
      food: { available: false, stock: 'none', lastUpdated: '2024-01-17T09:00:00Z' },
      water: { available: false, stock: 'none', lastUpdated: '2024-01-17T09:00:00Z' },
      medicine: { available: false, stock: 'none', lastUpdated: '2024-01-17T09:00:00Z' },
      blankets: { available: false, stock: 'none', lastUpdated: '2024-01-17T09:00:00Z' },
      clothing: { available: false, stock: 'none', lastUpdated: '2024-01-17T09:00:00Z' }
    },
    contactPerson: {
      name: 'Mr. Sampath Bandara',
      role: 'Former Coordinator',
      phone: '0712434567'
    },
    needs: [],
    notes: 'Camp closed. All evacuees returned home. Situation normalized.',
  },
  {
    id: 6,
    campName: 'Hambantota Drought Relief Center',
    campType: 'long-term-relief',
    status: 'Active',
    capacity: 150,
    currentOccupancy: 95,
    location: {
      address: 'Community Center, Hambantota',
      lat: 6.1429,
      lng: 81.1212,
    },
    district: 'Hambantota',
    openedDate: '2024-01-15T10:00:00Z',
    closedDate: null,
    disasterType: 'drought',
    facilities: {
      shelter: false,
      food: true,
      water: true,
      medical: true,
      sanitation: false,
      security: false,
      electricity: true,
      communication: true
    },
    supplies: {
      food: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T09:00:00Z' },
      water: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T09:00:00Z' },
      medicine: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T08:00:00Z' },
      blankets: { available: false, stock: 'none', lastUpdated: '2024-01-15T10:00:00Z' },
      clothing: { available: true, stock: 'adequate', lastUpdated: '2024-01-15T10:00:00Z' }
    },
    contactPerson: {
      name: 'Mrs. Dilini Jayawardena',
      role: 'Relief Coordinator',
      phone: '0775534567'
    },
    needs: ['Water Purification', 'Agricultural Support'],
    notes: 'Distribution center for water and food. Not a residential camp.',
  },
  {
    id: 7,
    campName: 'Matale Fire Victims Shelter',
    campType: 'temporary-shelter',
    status: 'Active',
    capacity: 100,
    currentOccupancy: 78,
    location: {
      address: 'Government Building, Matale Town',
      lat: 7.4675,
      lng: 80.6234,
    },
    district: 'Matale',
    openedDate: '2024-01-16T20:00:00Z',
    closedDate: null,
    disasterType: 'fire',
    facilities: {
      shelter: true,
      food: true,
      water: true,
      medical: true,
      sanitation: true,
      security: true,
      electricity: true,
      communication: true
    },
    supplies: {
      food: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T11:00:00Z' },
      water: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T11:00:00Z' },
      medicine: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T10:00:00Z' },
      blankets: { available: true, stock: 'adequate', lastUpdated: '2024-01-16T20:00:00Z' },
      clothing: { available: true, stock: 'low', lastUpdated: '2024-01-16T20:00:00Z' }
    },
    contactPerson: {
      name: 'Mr. Ruwan Senanayake',
      role: 'Camp Manager',
      phone: '0773734567'
    },
    needs: ['Clothing', 'Rehabilitation Support'],
    notes: 'Families displaced by forest fire. Need clothing and support for rebuilding.',
  },
  {
    id: 8,
    campName: 'Gampaha Emergency Medical Camp',
    campType: 'medical-facility',
    status: 'Active',
    capacity: 80,
    currentOccupancy: 42,
    location: {
      address: 'Hospital Grounds, Gampaha',
      lat: 7.0873,
      lng: 79.9990,
    },
    district: 'Gampaha',
    openedDate: '2024-01-17T11:00:00Z',
    closedDate: null,
    disasterType: 'building-collapse',
    facilities: {
      shelter: true,
      food: true,
      water: true,
      medical: true,
      sanitation: true,
      security: true,
      electricity: true,
      communication: true
    },
    supplies: {
      food: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T12:00:00Z' },
      water: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T12:00:00Z' },
      medicine: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T12:00:00Z' },
      blankets: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T11:00:00Z' },
      clothing: { available: true, stock: 'adequate', lastUpdated: '2024-01-17T11:00:00Z' }
    },
    contactPerson: {
      name: 'Dr. Pradeep Kumar',
      role: 'Medical Officer in Charge',
      phone: '0712634567'
    },
    needs: ['Blood Donations', 'Medical Equipment'],
    notes: 'Medical treatment center for building collapse victims. Need blood donations.',
  },
];

export default mockCamps;
