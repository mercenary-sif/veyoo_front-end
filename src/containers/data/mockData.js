// src/data/mockData.js
export const mockUsers = [
  {
    id: 1,
    name: 'Jean Dupont',
    email: 'jean.dupont@entreprise.com',
    role: 'Inspector',
    joinDate: '2024-01-15',
    status: 'Active',
    lastLogin: '2025-01-15T10:30:00Z',
    whatsapp_number: '+33 6 12 34 56 78',
    profile_picture: '',
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2025-01-15T10:30:00Z'
  },
  {
    id: 2,
    name: 'Marie Martin',
    email: 'marie.martin@entreprise.com',
    role: 'Manager',
    joinDate: '2024-03-20',
    status: 'Active',
    lastLogin: '2025-01-15T09:15:00Z',
    whatsapp_number: '+33 6 23 45 67 89',
    profile_picture: '',
    created_at: '2024-03-20T09:00:00Z',
    updated_at: '2025-01-15T09:15:00Z'
  },
  {
    id: 3,
    name: 'Pierre Durand',
    email: 'pierre.durand@entreprise.com',
    role: 'Inspector',
    joinDate: '2024-06-10',
    status: 'Active',
    lastLogin: '2025-01-14T16:45:00Z',
    whatsapp_number: '+33 6 34 56 78 90',
    profile_picture: '',
    created_at: '2024-06-10T10:00:00Z',
    updated_at: '2025-01-14T16:45:00Z'
  },
  {
    id: 4,
    name: 'Sophie Leblanc',
    email: 'sophie.leblanc@entreprise.com',
    role: 'Inspector',
    joinDate: '2024-08-05',
    status: 'Inactive',
    lastLogin: '2025-01-10T14:20:00Z',
    whatsapp_number: '+33 6 45 67 89 01',
    profile_picture: '',
    created_at: '2024-08-05T11:00:00Z',
    updated_at: '2025-01-10T14:20:00Z'
  },
  {
    id: 5,
    name: 'Thomas Bernard',
    email: 'thomas.bernard@entreprise.com',
    role: 'Manager',
    joinDate: '2024-02-12',
    status: 'Active',
    lastLogin: '2025-01-15T08:45:00Z',
    whatsapp_number: '+33 6 56 78 90 12',
    profile_picture: '',
    created_at: '2024-02-12T08:30:00Z',
    updated_at: '2025-01-15T08:45:00Z'
  }
];

export const mockVehicles = [
  {
    id: 1,
    material_id: 1,
    photo: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'good',
    type: 'vehicle',
    is_active: true,
    name: 'Ford Ranger XLT',
    license_plate: 'AB-123-CD',
    model: 'Ranger XLT',
    year_of_manufacture: 2023,
    color: 'Blanc',
    current_mileage: 15420,
    fuel_level: 75,
    oil_level: 80,
    tire_status: 'new',
    body_condition: 'good',
    engine_status: 'good',
    last_maintenance_date: '2024-12-20',
    inspection_due_date: '2025-06-20',
    created_at: '2023-01-15T08:00:00Z',
    updated_at: '2025-01-15T10:30:00Z',
    brand: 'Ford',
    fuelType: 'Diesel',
    location: 'Garage Principal'
  },
  {
    id: 2,
    material_id: 2,
    photo: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'good',
    type: 'vehicle',
    is_active: true,
    name: 'Toyota Hilux SR5',
    license_plate: 'EF-456-GH',
    model: 'Hilux SR5',
    year_of_manufacture: 2022,
    color: 'Gris',
    current_mileage: 28750,
    fuel_level: 60,
    oil_level: 70,
    tire_status: 'worn',
    body_condition: 'good',
    engine_status: 'good',
    last_maintenance_date: '2024-11-15',
    inspection_due_date: '2025-05-15',
    created_at: '2022-03-10T09:00:00Z',
    updated_at: '2025-01-14T16:45:00Z',
    brand: 'Toyota',
    fuelType: 'Diesel',
    location: 'Site Nord',
    assignedTo: 'Pierre Durand'
  },
  {
    id: 3,
    material_id: 3,
    photo: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'under_maintenance',
    type: 'vehicle',
    is_active: true,
    name: 'Renault Master',
    license_plate: 'IJ-789-KL',
    model: 'Master L2H2',
    year_of_manufacture: 2021,
    color: 'Blanc',
    current_mileage: 45200,
    fuel_level: 30,
    oil_level: 40,
    tire_status: 'worn',
    body_condition: 'damaged',
    engine_status: 'faulty',
    last_maintenance_date: '2024-10-30',
    inspection_due_date: '2025-04-30',
    created_at: '2021-05-20T10:00:00Z',
    updated_at: '2025-01-10T14:20:00Z',
    brand: 'Renault',
    fuelType: 'Diesel',
    location: 'Atelier'
  }
];

export const mockTools = [
  {
    id: 21,
    photo: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'good',
    type: 'tool',
    is_active: false,
    name: 'Extincteur SRI',
    last_maintenance_date: '2025-03-15',
    inspection_due_date: '2025-09-15',
    created_at: '2023-01-10T09:00:00Z',
    updated_at: '2025-06-26T16:10:00Z',
    description: 'Extincteur à poudre ABC 6kg',
    category: 'Sécurité incendie',
    serial_number: 'EXT-2023-001',
    manufacturer: 'SRI Safety',
    purchase_date: '2023-01-10',
    warranty_expiry: '2026-01-10'
  },
  {
    id: 22,
    photo: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'good',
    type: 'tool',
    is_active: true,
    name: 'Générateur Diesel',
    last_maintenance_date: '2024-10-30',
    inspection_due_date: '2025-04-30',
    created_at: '2023-02-15T10:00:00Z',
    updated_at: '2025-01-12T11:20:00Z',
    description: 'Générateur diesel 10kVA',
    category: 'Équipement électrique',
    serial_number: 'GEN-2023-002',
    manufacturer: 'CAT',
    purchase_date: '2023-02-15',
    warranty_expiry: '2025-02-15'
  },
  {
    id: 23,
    photo: 'https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg?auto=compress&cs=tinysrgb&w=400',
    status: 'pending_maintenance',
    type: 'tool',
    is_active: true,
    name: 'Compresseur d\'air',
    last_maintenance_date: '2024-08-20',
    inspection_due_date: '2025-02-20',
    created_at: '2023-03-20T11:00:00Z',
    updated_at: '2025-01-08T09:30:00Z',
    description: 'Compresseur d\'air portable 50L',
    category: 'Équipement pneumatique',
    serial_number: 'COMP-2023-003',
    manufacturer: 'Atlas Copco',
    purchase_date: '2023-03-20',
    warranty_expiry: '2025-03-20'
  }
];


export const mockMalfunctions = [
  {
    id: 'MAL-001',
    materialId: 3,
    materialName: 'Renault Master',
    materialType: 'vehicle',
    precheckId: 'PC-003',
    description: 'Fuite d\'huile moteur importante détectée lors du contrôle',
    severity: 'Critical',
    status: 'In Progress',
    reportedBy: 'Marie Martin',
    reportedAt: '2025-01-13T11:30:00Z',
    notes: 'Véhicule immobilisé en attente de réparation',
    declared_by: 'Marie Martin',
    declared_date: '2025-01-13',
    declared_time: '11:30',
    type: 'vehicle',
    name: 'Renault Master',
    is_active: false,
    last_maintenance_date: '2024-10-30',
    inspection_due_date: '2025-04-30',
    photos: [
      'https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&cs=tinysrgb&w=400',
      'https://images.pexels.com/photos/3807278/pexels-photo-3807278.jpeg?auto=compress&cs=tinysrgb&w=400'
    ]
  },
  {
    id: 'MAL-002',
    materialId: 21,
    materialName: 'Extincteur SRI',
    materialType: 'tool',
    precheckId: 'PC-002',
    description: 'Pression insuffisante de l\'extincteur',
    severity: 'High',
    status: 'Reported',
    reportedBy: 'Pierre Durand',
    reportedAt: '2025-01-14T08:20:00Z',
    notes: 'Nécessite recharge immédiate',
    declared_by: 'Pierre Durand',
    declared_date: '2025-01-14',
    declared_time: '08:20',
    type: 'tool',
    name: 'Extincteur SRI',
    is_active: false,
    last_maintenance_date: '2025-03-15',
    inspection_due_date: '2025-09-15',
    photos: []
  }
];
// ... other mock data (prechecks, assets, reservations, etc.)

export const mockReservations = [
  {
    id: 'RES-001',
    assetId: 'VH-001',
    assetName: 'Ford Ranger',
    userId: 3,
    userName: 'Pierre Durand',
    startDate: '2025-01-20',
    endDate: '2025-01-25',
    status: 'Pending',
    purpose: 'Inspection site industriel',
    notes: 'Besoin du véhicule pour une semaine complète',
    createdAt: '2025-01-15T10:30:00Z'
  },
  {
    id: 'RES-002',
    assetId: 'EQ-002',
    assetName: 'Compresseur d\'air',
    userId: 1,
    userName: 'Jean Dupont',
    startDate: '2025-01-18',
    endDate: '2025-01-19',
    status: 'Approved',
    purpose: 'Maintenance équipements pneumatiques',
    notes: '',
    createdAt: '2025-01-14T14:15:00Z'
  },
  {
    id: 'RES-003',
    assetId: 'VH-002',
    assetName: 'Toyota Hilux',
    userId: 4,
    userName: 'Sophie Leblanc',
    startDate: '2025-01-16',
    endDate: '2025-01-22',
    status: 'Active',
    purpose: 'Tournée d\'inspection hebdomadaire',
    notes: 'Véhicule équipé du matériel de mesure',
    createdAt: '2025-01-12T09:20:00Z'
  },
  {
    id: 'RES-004',
    assetId: 'EQ-001',
    assetName: 'Générateur Diesel',
    userId: 3,
    userName: 'Pierre Durand',
    startDate: '2025-01-10',
    endDate: '2025-01-12',
    status: 'Rejected',
    purpose: 'Alimentation temporaire chantier',
    notes: 'Équipement en panne, réservation refusée',
    createdAt: '2025-01-08T16:45:00Z'
  }
];

export const mockAnnouncements = [
  {
    id: 'ANN-001',
    title: 'Mise à jour des procédures de sécurité',
    content: 'Nouvelles directives concernant l\'utilisation des équipements de protection individuelle. Tous les inspecteurs doivent prendre connaissance du nouveau manuel avant le 31 janvier.',
    priority: 'High',
    startDate: '2025-01-15',
    endDate: '2025-01-31',
    createdBy: 'Marie Martin',
    createdAt: '2025-01-15T08:00:00Z',
    status: 'Active',
    targetRoles: ['Inspector', 'Manager'],
    cover: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=400',
    pdfUrl: '/documents/procedures-securite.pdf'
  },
  {
    id: 'ANN-002',
    title: 'Maintenance programmée du système',
    content: 'Le système sera indisponible ce weekend du samedi 20h au dimanche 6h pour maintenance. Planifiez vos activités en conséquence.',
    priority: 'Medium',
    startDate: '2025-01-18',
    endDate: '2025-01-19',
    createdBy: 'Admin Système',
    createdAt: '2025-01-14T12:30:00Z',
    status: 'Scheduled',
    targetRoles: ['Admin', 'Manager', 'Inspector'],
    cover: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];
export const mockAssets = [
  {
    id: 'VH-001',
    name: 'Ford Ranger',
    type: 'vehicle',
    status: 'Available',
    model: 'Ranger XLT 2023',
    serialNumber: 'FR2023001',
    lastInspection: '2024-12-20',
    nextInspection: '2025-06-20',
    location: 'Garage Principal',
    assignedTo: ''
  },
  {
    id: 'VH-002',
    name: 'Toyota Hilux',
    type: 'vehicle',
    status: 'Reserved',
    model: 'Hilux SR5 2022',
    serialNumber: 'TH2022002',
    lastInspection: '2024-11-15',
    nextInspection: '2025-05-15',
    location: 'Site Nord',
    assignedTo: 'Pierre Durand'
  },
  {
    id: 'EQ-001',
    name: 'Générateur Diesel',
    type: 'equipment',
    status: 'Out of Service',
    model: 'CAT DE110E0',
    serialNumber: 'GEN2023001',
    lastInspection: '2024-10-30',
    nextInspection: '2025-04-30',
    location: 'Entrepôt B',
    assignedTo: ''
  },
  {
    id: 'EQ-002',
    name: 'Compresseur d\'air',
    type: 'equipment',
    status: 'Available',
    model: 'Atlas Copco XAS 185',
    serialNumber: 'COMP2023002',
    lastInspection: '2024-12-10',
    nextInspection: '2025-06-10',
    location: 'Atelier',
    assignedTo: ''
  },
  {
    id: 'EQ-003',
    name: 'Pompe à eau',
    type: 'equipment',
    status: 'Available',
    model: 'Grundfos CR 32-4',
    serialNumber: 'PUMP2023003',
    lastInspection: '2024-11-25',
    nextInspection: '2025-05-25',
    location: 'Station de pompage',
    assignedTo: ''
  }
];

export const mockNotifications = [
  {
    id: '1',
    title: 'Nouvelle réservation',
    message: 'Pierre Durand a demandé une réservation pour le Ford Ranger',
    type: 'Reservation',
    isRead: false,
    createdAt: '2025-01-15T10:30:00Z',
    userId: 1,
    priority: 'Medium'
  },
  {
    id: '2',
    title: 'Équipement défaillant',
    message: 'Le générateur GEN-003 nécessite une maintenance urgente',
    type: 'Alert',
    isRead: false,
    createdAt: '2025-01-15T09:15:00Z',
    userId: 1,
    priority: 'High'
  },
  {
    id: '3',
    title: 'Nouvelle annonce',
    message: 'Mise à jour des procédures de sécurité',
    type: 'Announcement',
    isRead: true,
    createdAt: '2025-01-14T16:45:00Z',
    userId: 1,
    priority: 'Low'
  },
  {
    id: '4',
    title: 'Maintenance système',
    message: 'Maintenance programmée ce weekend de 20h à 6h',
    type: 'System',
    isRead: true,
    createdAt: '2025-01-14T14:20:00Z',
    userId: 1,
    priority: 'Medium'
  }
];
export const mockPrechecks = [
  {
    id: 'PC-001',
    materialId: 1,
    materialName: 'Ford Ranger XLT',
    materialType: 'vehicle',
    inspectorId: 1,
    inspectorName: 'Jean Dupont',
    date: '2025-01-15',
    status: 'Completed',
    type: 'Daily',
    submitted_by_user: true,
    items: [
      {
        id: 'item-1',
        category: 'Extérieur',
        item: 'État de la carrosserie',
        status: 'OK',
        notes: 'Aucun dommage visible'
      },
      {
        id: 'item-2',
        category: 'Extérieur',
        item: 'Éclairage (phares, feux)',
        status: 'OK'
      },
      {
        id: 'item-3',
        category: 'Pneumatiques',
        item: 'Pression des pneus',
        status: 'Warning',
        notes: 'Pneu avant droit légèrement sous-gonflé'
      }
    ],
    notes: 'Contrôle général satisfaisant. Attention à la pression du pneu avant droit.',
    created_at: '2025-01-15T08:30:00Z',
    updated_at: '2025-01-15T09:15:00Z'
  },
  {
    id: 'PC-002',
    materialId: 21,
    materialName: 'Extincteur SRI',
    materialType: 'tool',
    inspectorId: 3,
    inspectorName: 'Pierre Durand',
    date: '2025-01-14',
    status: 'Failed',
    type: 'Monthly',
    submitted_by_user: true,
    items: [
      {
        id: 'item-4',
        category: 'Sécurité',
        item: 'Pression de l\'extincteur',
        status: 'Critical',
        notes: 'Pression insuffisante, nécessite recharge'
      },
      {
        id: 'item-5',
        category: 'Extérieur',
        item: 'État du boîtier',
        status: 'OK'
      }
    ],
    notes: 'Extincteur hors service - pression insuffisante.',
    created_at: '2025-01-14T07:45:00Z',
    updated_at: '2025-01-14T08:20:00Z'
  }
];

export const mockSupportTickets = [
  {
    id: 'TICK-001',
    title: 'Plainte concernant l\'état du véhicule',
    description: 'Le véhicule Ford Ranger (AB-123-CD) était dans un état sale lors de ma dernière réservation. Les sièges étaient tachés et le réservoir était presque vide.',
    status: 'Open',
    priority: 'High',
    category: 'Complaint',
    type: 'complaint',
    createdBy: 'Pierre Durand',
    userId: 3,
    createdAt: '2025-01-15T09:30:00Z',
    updatedAt: '2025-01-15T09:30:00Z',
    assignedTo: 'Support Technique',
    replies: [],
    attachments: ['https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400']
  },
  {
    id: 'TICK-002',
    title: 'Problème avec l\'extincteur SRI',
    description: 'L\'extincteur SRI ne fonctionne pas correctement. La pression semble insuffisante et il y a une fuite au niveau de la valve.',
    status: 'In Progress',
    priority: 'High',
    category: 'Issue',
    type: 'issue',
    createdBy: 'Sophie Leblanc',
    userId: 4,
    createdAt: '2025-01-14T14:20:00Z',
    updatedAt: '2025-01-15T08:45:00Z',
    assignedTo: 'Maintenance',
    replies: [
      {
        id: 'REP-001',
        ticketId: 'TICK-002',
        message: 'Nous avons pris note de votre signalement. L\'extincteur sera inspecté aujourd\'hui.',
        createdBy: 'Support Technique',
        createdAt: '2025-01-14T15:30:00Z',
        isAdminReply: true
      }
    ],
    attachments: []
  },
  {
    id: 'TICK-003',
    title: 'Retard dans l\'approbation de réservation',
    description: 'Ma demande de réservation pour le générateur diesel est en attente depuis 3 jours. J\'ai besoin de cet équipement pour une mission urgente.',
    status: 'Resolved',
    priority: 'Medium',
    category: 'Complaint',
    type: 'complaint',
    createdBy: 'Jean Dupont',
    userId: 1,
    createdAt: '2025-01-12T10:15:00Z',
    updatedAt: '2025-01-13T16:20:00Z',
    assignedTo: 'Gestion Réservations',
    replies: [
      {
        id: 'REP-002',
        ticketId: 'TICK-003',
        message: 'Votre réservation a été approuvée. Vous pouvez récupérer l\'équipement dès maintenant.',
        createdBy: 'Marie Martin',
        createdAt: '2025-01-13T16:20:00Z',
        isAdminReply: true
      }
    ],
    attachments: []
  }
];