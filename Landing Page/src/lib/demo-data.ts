export interface DemoDoctor {
  id: string;
  fullName: string;
  initials: string;
  specialties: string[];
  bio: string;
  clinicName: string;
  clinicAddress: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  prcLicenseNumber: string;
  prcLicenseExpiry: string;
  prcLicenseVerified: boolean;
  medicalDegree: string;
  boardCertifications: string[];
  yearsOfExperience: number;
  languages: string[];
  acceptedPaymentMethods: string[];
  acceptedHmos: string[];
  consultationFeeCents: number;
  rating: number;
  reviewCount: number;
  isAcceptingPatients: boolean;
}

export interface DemoPatient {
  id: string;
  fullName: string;
  initials: string;
  patientNumber: string;
  lastVisit: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  phone: string;
  email: string;
  allergies: string[];
  conditions: string[];
  insuranceProvider: string;
}

export interface DemoAppointment {
  id: string;
  patientName: string;
  doctorName: string;
  service: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
}

export interface DemoInvoice {
  id: string;
  invoiceNumber: string;
  patientName: string;
  service: string;
  date: string;
  amountCents: number;
  status: string;
}

export const demoDoctors: DemoDoctor[] = [
  {
    id: 'd1',
    fullName: 'Dr. Maria Santos',
    initials: 'MS',
    specialties: ['General Dentistry', 'Cosmetic Dentistry'],
    bio: 'Dr. Santos has been providing comprehensive dental care in Metro Manila for over 12 years, with a focus on preventive and cosmetic procedures.',
    clinicName: 'Santos Dental Clinic',
    clinicAddress: '123 Rizal Ave, Makati City',
    city: 'Makati City',
    province: 'Metro Manila',
    latitude: 14.5547,
    longitude: 121.0244,
    prcLicenseNumber: 'DEN-0045678',
    prcLicenseExpiry: '2027-03-15',
    prcLicenseVerified: true,
    medicalDegree: 'DMD, University of the Philippines Manila',
    boardCertifications: ['Philippine Dental Association Board Certified'],
    yearsOfExperience: 12,
    languages: ['Filipino', 'English'],
    acceptedPaymentMethods: ['cash', 'card', 'gcash', 'maya', 'bank_transfer', 'insurance'],
    acceptedHmos: ['Maxicare', 'Intellicare', 'PhilHealth', 'Medicard'],
    consultationFeeCents: 50000,
    rating: 4.9,
    reviewCount: 127,
    isAcceptingPatients: true,
  },
  {
    id: 'd2',
    fullName: 'Dr. Jose Reyes',
    initials: 'JR',
    specialties: ['Family Medicine', 'Internal Medicine'],
    bio: 'A dedicated family physician serving communities in Quezon City. Dr. Reyes believes in holistic, patient-centered care.',
    clinicName: 'Reyes Medical Group',
    clinicAddress: '456 Commonwealth Ave, Quezon City',
    city: 'Quezon City',
    province: 'Metro Manila',
    latitude: 14.6760,
    longitude: 121.0437,
    prcLicenseNumber: 'MED-0098234',
    prcLicenseExpiry: '2026-11-30',
    prcLicenseVerified: true,
    medicalDegree: 'MD, University of Santo Tomas',
    boardCertifications: ['Philippine College of Physicians Fellow', 'Philippine Academy of Family Physicians Diplomate'],
    yearsOfExperience: 15,
    languages: ['Filipino', 'English', 'Hokkien'],
    acceptedPaymentMethods: ['cash', 'card', 'gcash', 'insurance'],
    acceptedHmos: ['Maxicare', 'PhilHealth', 'Pacific Cross', 'Cocolife'],
    consultationFeeCents: 80000,
    rating: 4.8,
    reviewCount: 203,
    isAcceptingPatients: true,
  },
  {
    id: 'd3',
    fullName: 'Dr. Angela Cruz',
    initials: 'AC',
    specialties: ['Orthodontics'],
    bio: 'Dr. Cruz specializes in braces and aligners for patients of all ages, with advanced training from Tokyo Medical and Dental University.',
    clinicName: 'BrightSmile Orthodontics',
    clinicAddress: '789 Ayala Ave, Makati City',
    city: 'Makati City',
    province: 'Metro Manila',
    latitude: 14.5580,
    longitude: 121.0195,
    prcLicenseNumber: 'DEN-0067890',
    prcLicenseExpiry: '2028-06-20',
    prcLicenseVerified: true,
    medicalDegree: 'DMD, Centro Escolar University',
    boardCertifications: ['Philippine Association of Orthodontists Fellow', 'Tokyo Medical and Dental University Certificate'],
    yearsOfExperience: 8,
    languages: ['Filipino', 'English', 'Japanese'],
    acceptedPaymentMethods: ['cash', 'card', 'gcash', 'maya', 'bank_transfer'],
    acceptedHmos: ['Maxicare', 'Intellicare', 'Medicard'],
    consultationFeeCents: 100000,
    rating: 5.0,
    reviewCount: 89,
    isAcceptingPatients: true,
  },
  {
    id: 'd4',
    fullName: 'Dr. Ricardo Tan',
    initials: 'RT',
    specialties: ['Pediatric Dentistry'],
    bio: 'Gentle dental care for children and teens. Dr. Tan creates a fun, anxiety-free environment for young patients.',
    clinicName: 'KidSmiles Dental',
    clinicAddress: '321 Tomas Morato Ave, Quezon City',
    city: 'Quezon City',
    province: 'Metro Manila',
    latitude: 14.6348,
    longitude: 121.0346,
    prcLicenseNumber: 'DEN-0034567',
    prcLicenseExpiry: '2027-09-10',
    prcLicenseVerified: true,
    medicalDegree: 'DMD, Manila Central University',
    boardCertifications: ['Philippine Pediatric Dental Society Board Certified'],
    yearsOfExperience: 10,
    languages: ['Filipino', 'English'],
    acceptedPaymentMethods: ['cash', 'card', 'gcash', 'maya', 'insurance'],
    acceptedHmos: ['PhilHealth', 'Maxicare', 'Intellicare', 'Medicard', 'Valucare'],
    consultationFeeCents: 60000,
    rating: 4.7,
    reviewCount: 156,
    isAcceptingPatients: true,
  },
  {
    id: 'd5',
    fullName: 'Dr. Fatima Dela Rosa',
    initials: 'FR',
    specialties: ['Dermatology'],
    bio: 'Board-certified dermatologist specializing in acne, skin rejuvenation, and cosmetic dermatology for all skin types.',
    clinicName: 'Glow Derma Clinic',
    clinicAddress: '555 Jupiter St, Mandaluyong City',
    city: 'Mandaluyong City',
    province: 'Metro Manila',
    latitude: 14.5794,
    longitude: 121.0359,
    prcLicenseNumber: 'MED-0076543',
    prcLicenseExpiry: '2026-12-01',
    prcLicenseVerified: true,
    medicalDegree: 'MD, Ateneo School of Medicine and Public Health',
    boardCertifications: ['Philippine Dermatological Society Fellow'],
    yearsOfExperience: 7,
    languages: ['Filipino', 'English'],
    acceptedPaymentMethods: ['cash', 'card', 'gcash', 'maya', 'bank_transfer', 'insurance'],
    acceptedHmos: ['Maxicare', 'Pacific Cross', 'Generali', 'AXA Philippines'],
    consultationFeeCents: 120000,
    rating: 4.9,
    reviewCount: 178,
    isAcceptingPatients: true,
  },
  {
    id: 'd6',
    fullName: 'Dr. Carlo Villanueva',
    initials: 'CV',
    specialties: ['General Medicine', 'Occupational Health'],
    bio: 'Providing primary care and corporate health services in Pasig City. Annual physical exams, health certificates, and preventive medicine.',
    clinicName: 'HealthFirst Medical Center',
    clinicAddress: '88 Ortigas Ave, Pasig City',
    city: 'Pasig City',
    province: 'Metro Manila',
    latitude: 14.5870,
    longitude: 121.0615,
    prcLicenseNumber: 'MED-0054321',
    prcLicenseExpiry: '2027-05-25',
    prcLicenseVerified: true,
    medicalDegree: 'MD, Far Eastern University',
    boardCertifications: ['Philippine College of Occupational Medicine Fellow'],
    yearsOfExperience: 9,
    languages: ['Filipino', 'English'],
    acceptedPaymentMethods: ['cash', 'card', 'gcash', 'insurance'],
    acceptedHmos: ['PhilHealth', 'Maxicare', 'Intellicare', 'EastWest Healthcare', 'Caritas Health Shield'],
    consultationFeeCents: 70000,
    rating: 4.6,
    reviewCount: 94,
    isAcceptingPatients: true,
  },
];

export const demoPatients: DemoPatient[] = [
  { id: 'p1', fullName: 'Marcus Reyes', initials: 'MR', patientNumber: '#P-00421', lastVisit: 'Aug 12, 2026', dateOfBirth: '1992-03-15', gender: 'Male', bloodType: 'O+', phone: '+63 917 555 0421', email: 'marcus.reyes@email.com', allergies: ['Penicillin', 'Pollen'], conditions: ['Mild Gingivitis', 'Seasonal Allergies'], insuranceProvider: 'Maxicare' },
  { id: 'p2', fullName: 'Priya Sharma', initials: 'PS', patientNumber: '#P-00398', lastVisit: 'Aug 9, 2026', dateOfBirth: '1988-07-22', gender: 'Female', bloodType: 'A+', phone: '+63 918 555 0398', email: 'priya.sharma@email.com', allergies: [], conditions: ['Hypertension (controlled)'], insuranceProvider: 'Intellicare' },
  { id: 'p3', fullName: 'James Kowalski', initials: 'JK', patientNumber: '#P-00375', lastVisit: 'Jul 28, 2026', dateOfBirth: '1995-11-03', gender: 'Male', bloodType: 'B+', phone: '+63 919 555 0375', email: 'james.k@email.com', allergies: ['Aspirin'], conditions: [], insuranceProvider: 'PhilHealth' },
  { id: 'p4', fullName: 'Aisha Mendoza', initials: 'AM', patientNumber: '#P-00362', lastVisit: 'Jul 21, 2026', dateOfBirth: '1990-01-18', gender: 'Female', bloodType: 'AB+', phone: '+63 920 555 0362', email: 'aisha.m@email.com', allergies: [], conditions: ['Diabetes Type 2'], insuranceProvider: 'Medicard' },
  { id: 'p5', fullName: 'Thomas Nguyen', initials: 'TN', patientNumber: '#P-00349', lastVisit: 'Jul 14, 2026', dateOfBirth: '1985-09-27', gender: 'Male', bloodType: 'O-', phone: '+63 921 555 0349', email: 'tom.nguyen@email.com', allergies: ['Latex'], conditions: [], insuranceProvider: 'Pacific Cross' },
  { id: 'p6', fullName: 'Linda Park', initials: 'LP', patientNumber: '#P-00331', lastVisit: 'Jun 30, 2026', dateOfBirth: '1993-04-12', gender: 'Female', bloodType: 'A-', phone: '+63 922 555 0331', email: 'linda.park@email.com', allergies: [], conditions: ['Asthma'], insuranceProvider: 'Maxicare' },
  { id: 'p7', fullName: 'David Chen', initials: 'DC', patientNumber: '#P-00318', lastVisit: 'Jun 22, 2026', dateOfBirth: '1987-12-05', gender: 'Male', bloodType: 'B-', phone: '+63 923 555 0318', email: 'david.chen@email.com', allergies: ['Sulfa drugs'], conditions: [], insuranceProvider: 'Cocolife' },
  { id: 'p8', fullName: 'Sofia Rosales', initials: 'SR', patientNumber: '#P-00305', lastVisit: 'Jun 10, 2026', dateOfBirth: '1991-06-30', gender: 'Female', bloodType: 'O+', phone: '+63 924 555 0305', email: 'sofia.r@email.com', allergies: [], conditions: [], insuranceProvider: 'PhilHealth' },
];

export const demoAppointments: DemoAppointment[] = [
  { id: 'a1', patientName: 'Marcus Reyes', doctorName: 'Dr. Maria Santos', service: 'Routine Cleaning', scheduledAt: '2026-09-15T09:30:00', durationMinutes: 30, status: 'confirmed' },
  { id: 'a2', patientName: 'Priya Sharma', doctorName: 'Dr. Maria Santos', service: 'Cavity Filling', scheduledAt: '2026-09-15T10:30:00', durationMinutes: 45, status: 'confirmed' },
  { id: 'a3', patientName: 'James Kowalski', doctorName: 'Dr. Jose Reyes', service: 'General Checkup', scheduledAt: '2026-09-16T14:00:00', durationMinutes: 30, status: 'pending' },
  { id: 'a4', patientName: 'Aisha Mendoza', doctorName: 'Dr. Fatima Dela Rosa', service: 'Derma Consultation', scheduledAt: '2026-09-16T15:00:00', durationMinutes: 30, status: 'confirmed' },
  { id: 'a5', patientName: 'Thomas Nguyen', doctorName: 'Dr. Angela Cruz', service: 'Orthodontic Review', scheduledAt: '2026-09-17T11:00:00', durationMinutes: 60, status: 'pending' },
  { id: 'a6', patientName: 'Linda Park', doctorName: 'Dr. Carlo Villanueva', service: 'Annual Physical Exam', scheduledAt: '2026-09-18T09:00:00', durationMinutes: 60, status: 'confirmed' },
];

export const demoInvoices: DemoInvoice[] = [
  { id: 'i1', invoiceNumber: 'INV-1042', patientName: 'Marcus Reyes', service: 'Cavity Filling', date: 'Aug 12, 2026', amountCents: 1600000, status: 'Paid' },
  { id: 'i2', invoiceNumber: 'INV-1041', patientName: 'Priya Sharma', service: 'Routine Cleaning', date: 'Aug 10, 2026', amountCents: 475000, status: 'Paid' },
  { id: 'i3', invoiceNumber: 'INV-1040', patientName: 'James Kowalski', service: 'Specialist Consult', date: 'Aug 9, 2026', amountCents: 1050000, status: 'Pending' },
  { id: 'i4', invoiceNumber: 'INV-1039', patientName: 'Aisha Mendoza', service: 'X-Ray + Filling', date: 'Aug 7, 2026', amountCents: 2250000, status: 'Overdue' },
  { id: 'i5', invoiceNumber: 'INV-1038', patientName: 'Thomas Nguyen', service: 'General Checkup', date: 'Aug 5, 2026', amountCents: 375000, status: 'Paid' },
  { id: 'i6', invoiceNumber: 'INV-1037', patientName: 'Linda Park', service: 'Root Canal', date: 'Aug 3, 2026', amountCents: 4450000, status: 'Pending' },
  { id: 'i7', invoiceNumber: 'INV-1036', patientName: 'David Chen', service: 'Teeth Whitening', date: 'Aug 1, 2026', amountCents: 1900000, status: 'Insurance' },
  { id: 'i8', invoiceNumber: 'INV-1035', patientName: 'Sofia Rosales', service: 'Orthodontic Review', date: 'Jul 30, 2026', amountCents: 775000, status: 'Paid' },
];

export const demoSubscriptionTiers = [
  { id: 't1', name: 'Starter', priceCents: 249900, description: 'The essentials for a growing practice.', features: ['Up to 2 practitioners', 'Core scheduling', 'Digital patient records', 'Email support'], maxPractitioners: 2, isHighlighted: false },
  { id: 't2', name: 'Growth', priceCents: 599900, description: 'Everything you need to run smarter.', features: ['Up to 10 practitioners', 'Full feature suite', 'Billing & prescriptions', 'Priority support', 'Advanced reporting'], maxPractitioners: 10, isHighlighted: true },
  { id: 't3', name: 'Enterprise', priceCents: 0, description: 'A tailored platform for your network.', features: ['Unlimited practitioners', 'Custom integrations', 'Dedicated support', 'Advanced security controls'], maxPractitioners: null, isHighlighted: false },
];

export const demoSiteContent = {
  hero: {
    headline: 'The All-in-One Platform for Modern Clinics',
    subheadline: 'Streamline appointments, patient records, billing, prescriptions, and follow-up reminders — all in one place.',
    cta_text: 'Start Free Trial',
  },
  contact: {
    phone: '+63 2 8888 1234',
    email: 'hello@medismile.ph',
    address: 'Unit 1205, One Corporate Centre, Meralco Ave, Pasig City, Metro Manila',
    facebook: 'https://facebook.com/medismile',
    instagram: 'https://instagram.com/medismile',
    linkedin: 'https://linkedin.com/company/medismile',
  },
  stats: [
    { number: '500+', label: 'Clinics' },
    { number: '1M+', label: 'Appointments Managed' },
    { number: '98%', label: 'Patient Satisfaction' },
    { number: '24/7', label: 'Support' },
  ],
};
