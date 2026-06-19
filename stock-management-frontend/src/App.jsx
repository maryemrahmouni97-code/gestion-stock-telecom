import { useMemo, useState } from 'react';
import './App.css';

const adminMenuItems = [
  'Dashboard',
  'Materiels',
  'Stock Central',
  'Demandes',
  'Mouvements',
  'Regions',
  'Utilisateurs',
  'Maintenance',
  'Rapports',
];

const regionMenuItems = [
  'Dashboard',
  'Mon Stock',
  'Nouvelle Demande',
  'Mes Demandes',
  'Declaration de Panne',
  'Historique',
];

const stats = [
  { label: 'Total Materiels', value: '2500', tone: 'blue' },
  { label: 'Total Regions', value: '24', tone: 'green' },
  { label: 'Stock Faible', value: '15', tone: 'orange' },
  { label: 'Materiels Defectueux', value: '8', tone: 'red' },
];

const materials = [
  { reference: 'MOD001', name: 'Modems', category: 'Reseau', quantity: 420, status: 'Disponible' },
  { reference: 'ROU001', name: 'Routeurs', category: 'Reseau', quantity: 210, status: 'Disponible' },
  { reference: 'TEL001', name: 'Telephones IP', category: 'Telephonie', quantity: 180, status: 'Disponible' },
  { reference: 'SWT001', name: 'Switchs', category: 'Reseau', quantity: 75, status: 'Disponible' },
  { reference: 'CAB001', name: 'Cables', category: 'Accessoires', quantity: 1200, status: 'Disponible' },
  { reference: 'TAB001', name: 'Tables', category: 'Mobilier', quantity: 64, status: 'Disponible' },
  { reference: 'CHA001', name: 'Chaises', category: 'Mobilier', quantity: 130, status: 'Disponible' },
  { reference: 'ECR001', name: 'Ecrans', category: 'Informatique', quantity: 28, status: 'Stock faible' },
  { reference: 'IMP001', name: 'Imprimantes', category: 'Informatique', quantity: 11, status: 'Stock faible' },
  { reference: 'CLA001', name: 'Claviers', category: 'Informatique', quantity: 95, status: 'Disponible' },
  { reference: 'SOU001', name: 'Souris', category: 'Informatique', quantity: 0, status: 'Rupture' },
  { reference: 'ONT014', name: 'ONT Fibre Nokia', category: 'Fibre optique', quantity: 92, status: 'Stock faible' },
];

const stockRows = [
  { material: 'Modems', region: 'Tunis', available: 160, reserved: 24, min: 80 },
  { material: 'Routeurs', region: 'Sfax', available: 55, reserved: 9, min: 40 },
  { material: 'Telephones IP', region: 'Sousse', available: 45, reserved: 12, min: 50 },
  { material: 'Switchs', region: 'Nabeul', available: 16, reserved: 4, min: 20 },
  { material: 'Cables', region: 'Gabes', available: 310, reserved: 40, min: 120 },
  { material: 'Tables', region: 'Bizerte', available: 22, reserved: 3, min: 15 },
  { material: 'Chaises', region: 'Ariana', available: 68, reserved: 10, min: 40 },
  { material: 'Ecrans', region: 'Monastir', available: 8, reserved: 5, min: 15 },
  { material: 'Imprimantes', region: 'Kairouan', available: 3, reserved: 2, min: 8 },
  { material: 'Claviers', region: 'Gafsa', available: 38, reserved: 7, min: 25 },
  { material: 'Souris', region: 'Medenine', available: 0, reserved: 6, min: 20 },
];

const movements = [
  {
    date: '19/06/2026',
    region: 'Sfax',
    material: 'Modem Huawei',
    quantity: 50,
    type: 'Entree',
    provenanceDestination: 'Stock Central',
    comment: 'Demande #12 validee',
  },
  {
    date: '18/06/2026',
    region: 'Sfax',
    material: 'Telephone IP',
    quantity: 12,
    type: 'Sortie',
    provenanceDestination: 'Techniciens Sfax',
    comment: 'Installation client',
  },
  {
    date: '17/06/2026',
    region: 'Sfax',
    material: 'Switch Cisco',
    quantity: 3,
    type: 'Panne',
    provenanceDestination: '-',
    comment: 'Declaration panne',
  },
  {
    date: '16/06/2026',
    region: 'Sfax',
    material: 'Modems',
    quantity: 8,
    type: 'Transfert sortant',
    provenanceDestination: 'Gabes',
    comment: 'Support agence Gabes',
  },
  {
    date: '15/06/2026',
    region: 'Sfax',
    material: 'Routeurs',
    quantity: 6,
    type: 'Transfert entrant',
    provenanceDestination: 'Tunis',
    comment: 'Renforcement stock Sfax',
  },
  {
    date: '14/06/2026',
    region: 'Sfax',
    material: 'Imprimantes',
    quantity: 2,
    type: 'Retour',
    provenanceDestination: 'Maintenance',
    comment: 'Retour materiel repare',
  },
  {
    date: '17/06/2026',
    region: 'Tunis',
    material: 'Modems',
    quantity: 30,
    type: 'Entree',
    provenanceDestination: 'Stock Central',
    comment: 'Approvisionnement mensuel',
  },
  {
    date: '15/06/2026',
    region: 'Nabeul',
    material: 'Switchs',
    quantity: 4,
    type: 'Panne',
    provenanceDestination: '-',
    comment: 'Declaration panne',
  },
  {
    date: '13/06/2026',
    region: 'Gabes',
    material: 'Cables',
    quantity: 50,
    type: 'Retour',
    provenanceDestination: 'Techniciens Gabes',
    comment: 'Retour chantier',
  },
];

const regions = [
  'Tunis',
  'Sfax',
  'Sousse',
  'Nabeul',
  'Gabes',
  'Bizerte',
  'Ariana',
  'Monastir',
  'Kairouan',
  'Gafsa',
  'Medenine',
  'Tozeur',
];

const users = [
  { name: 'Amine Trabelsi', email: 'amine.trabelsi@telecom.tn', region: 'Tunis', role: 'Admin' },
  { name: 'Sarra Ben Ali', email: 'sarra.benali@telecom.tn', region: 'Sfax', role: 'Responsable Region' },
  { name: 'Youssef Mansouri', email: 'youssef.mansouri@telecom.tn', region: 'Sousse', role: 'Responsable Region' },
  { name: 'Nour Hammami', email: 'nour.hammami@telecom.tn', region: 'Nabeul', role: 'Responsable Stock' },
];

const monthlyFlow = [
  { month: 'Jan', in: 65, out: 42 },
  { month: 'Fev', in: 78, out: 55 },
  { month: 'Mar', in: 52, out: 61 },
  { month: 'Avr', in: 88, out: 70 },
  { month: 'Mai', in: 94, out: 73 },
  { month: 'Juin', in: 72, out: 58 },
];

const topMaterials = [
  { name: 'Modems', value: 88 },
  { name: 'Routeurs', value: 76 },
  { name: 'Telephones IP', value: 58 },
  { name: 'Switchs', value: 42 },
];

const alerts = [
  '5 materiels en rupture',
  '3 materiels defectueux',
  '12 demandes en attente',
];

const refusalReasons = [
  'Stock insuffisant',
  'Demande non justifiee',
  'Quantite excessive',
];

const requests = [
  {
    id: 12,
    region: 'Sfax',
    material: 'Modem Huawei',
    quantity: 50,
    date: '19/06/2026',
    reason: 'Installation nouveaux clients',
    status: 'En attente',
    currentStock: 10,
  },
  {
    id: 13,
    region: 'Gabes',
    material: 'Modems',
    quantity: 50,
    date: '19/06/2026',
    reason: 'Rupture stock agence Gabes',
    status: 'En attente',
    currentStock: 20,
  },
  {
    id: 14,
    region: 'Sousse',
    material: 'Telephones IP',
    quantity: 12,
    date: '18/06/2026',
    reason: 'Extension centre appel',
    status: 'Acceptee',
    currentStock: 45,
  },
];

const maintenanceTickets = [
  {
    id: 7,
    region: 'Sfax',
    material: 'Switch Cisco',
    quantity: 3,
    state: 'Defectueux',
    status: 'Notification panne',
    date: '19/06/2026',
  },
  {
    id: 8,
    region: 'Nabeul',
    material: 'Imprimantes',
    quantity: 2,
    state: 'Defectueux',
    status: 'A reparer',
    date: '18/06/2026',
  },
];

const transferExample = {
  material: 'Modems',
  quantity: 50,
  from: 'Tunis',
  fromStock: 500,
  to: 'Gabes',
  toStock: 20,
};

function getStockStatus(row) {
  if (row.available === 0) return 'rupture';
  if (row.available <= row.min) return 'faible';
  return 'normal';
}

function PageHeader({ title, description, action }) {
  return (
    <div className="page-header">
      <div>
        <p className="eyebrow">Telecom Stock</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <article className={`stat-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function MiniBarChart({ title, data }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <h2>{title}</h2>
        <span>2026</span>
      </div>
      <div className="flow-chart">
        {data.map((item) => (
          <div className="flow-column" key={item.month}>
            <div className="bars">
              <span className="bar in" style={{ height: `${item.in}%` }} />
              <span className="bar out" style={{ height: `${item.out}%` }} />
            </div>
            <small>{item.month}</small>
          </div>
        ))}
      </div>
      <div className="legend">
        <span><i className="dot in" /> Entrees</span>
        <span><i className="dot out" /> Sorties</span>
      </div>
    </section>
  );
}

function RankedBars({ title, data }) {
  return (
    <section className="panel">
      <div className="panel-title">
        <h2>{title}</h2>
        <span>Top 4</span>
      </div>
      <div className="ranked-list">
        {data.map((item) => (
          <div className="rank-row" key={item.name}>
            <div>
              <span>{item.name}</span>
              <strong>{item.value}%</strong>
            </div>
            <progress value={item.value} max="100" />
          </div>
        ))}
      </div>
    </section>
  );
}

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vue globale du stock Telecom, des regions et des mouvements recents."
      />
      <div className="stats-grid">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>
      <div className="dashboard-grid">
        <MiniBarChart title="Entrees / Sorties mensuelles" data={monthlyFlow} />
        <RankedBars title="Top materiels utilises" data={topMaterials} />
        <section className="panel wide alerts-panel">
          <div className="panel-title">
            <h2>Alertes</h2>
            <span>Prioritaire</span>
          </div>
          <div className="alerts-list">
            {alerts.map((alert) => (
              <div className="alert-row" key={alert}>
                <span aria-hidden="true">!</span>
                <strong>{alert}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function RequestsPage({ role = 'admin' }) {
  const [refusingRequestId, setRefusingRequestId] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState({});
  const visibleRequests = role === 'region' ? requests.filter((request) => request.region === 'Sfax') : requests;

  return (
    <>
      <PageHeader
        title={role === 'region' ? 'Mes Demandes' : 'Demandes'}
        description={
          role === 'region'
            ? 'Suivi des demandes creees par la region Sfax.'
            : 'Module central pour traiter les demandes de materiel des regions.'
        }
        action={role === 'admin' ? <button className="primary-button">+ Nouvelle Demande</button> : null}
      />
      <div className="workflow-grid">
        {visibleRequests.map((request) => (
          <article className="request-card" key={request.id}>
            <div className="request-card-header">
              <div>
                <p className="eyebrow">Demande #{request.id}</p>
                <h2>{request.region} - {request.material}</h2>
              </div>
              <span className={`status-badge ${request.status.toLowerCase().replace(' ', '-')}`}>
                {request.status}
              </span>
            </div>
            <dl className="details-list">
              <div><dt>Stock actuel</dt><dd>{request.currentStock}</dd></div>
              <div><dt>Quantite demandee</dt><dd>{request.quantity}</dd></div>
              <div><dt>Date</dt><dd>{request.date}</dd></div>
              <div><dt>Motif</dt><dd>{request.reason}</dd></div>
            </dl>
            {role === 'admin' && (
              <div className="action-row">
                <button className="primary-button">Accepter</button>
                <button
                  className="danger-button"
                  onClick={() => setRefusingRequestId(refusingRequestId === request.id ? null : request.id)}
                  type="button"
                >
                  Refuser
                </button>
              </div>
            )}
            {role === 'admin' && refusingRequestId === request.id && (
              <div className="refusal-panel">
                <strong>Choisir le motif de refus</strong>
                <div className="refusal-options">
                  {refusalReasons.map((reason) => (
                    <button
                      className={selectedReasons[request.id] === reason ? 'selected' : ''}
                      key={reason}
                      onClick={() => setSelectedReasons({ ...selectedReasons, [request.id]: reason })}
                      type="button"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

function MaintenancePage() {
  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Traitement des pannes declarees par les regions: reparer, remplacer ou reformer."
      />
      <div className="workflow-grid">
        {maintenanceTickets.map((ticket) => (
          <article className="request-card maintenance-card" key={ticket.id}>
            <div className="request-card-header">
              <div>
                <p className="eyebrow">Panne #{ticket.id}</p>
                <h2>{ticket.material}</h2>
              </div>
              <span className="status-badge panne">{ticket.state}</span>
            </div>
            <dl className="details-list">
              <div><dt>Region</dt><dd>{ticket.region}</dd></div>
              <div><dt>Quantite</dt><dd>{ticket.quantity}</dd></div>
              <div><dt>Date</dt><dd>{ticket.date}</dd></div>
              <div><dt>Statut</dt><dd>{ticket.status}</dd></div>
            </dl>
            <div className="action-row three">
              <button className="primary-button">Reparer</button>
              <button className="secondary-button">Remplacer</button>
              <button className="danger-button">Reformer</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function RegionRequestPage() {
  return (
    <>
      <PageHeader
        title="Nouvelle Demande"
        description="Le responsable region cree une demande visible par l'admin."
      />
      <section className="form-card">
        <label>
          Region
          <input defaultValue="Sfax" />
        </label>
        <label>
          Materiel
          <select defaultValue="Modem Huawei">
            <option>Modem Huawei</option>
            <option>Routeurs</option>
            <option>Switchs</option>
            <option>Telephones IP</option>
          </select>
        </label>
        <label>
          Quantite
          <input type="number" defaultValue="50" />
        </label>
        <label className="full-field">
          Motif
          <textarea defaultValue="Installation nouveaux clients" />
        </label>
        <button className="primary-button">Envoyer la demande</button>
      </section>
    </>
  );
}

function BreakdownDeclarationPage() {
  return (
    <>
      <PageHeader
        title="Declaration de Panne"
        description="La region declare les equipements defectueux pour decision administrative."
      />
      <section className="form-card">
        <label>
          Region
          <input defaultValue="Sfax" />
        </label>
        <label>
          Materiel
          <select defaultValue="Switch Cisco">
            <option>Switch Cisco</option>
            <option>Modem Huawei</option>
            <option>Imprimantes</option>
          </select>
        </label>
        <label>
          Quantite
          <input type="number" defaultValue="3" />
        </label>
        <label>
          Etat
          <input defaultValue="Defectueux" />
        </label>
        <button className="primary-button">Declarer la panne</button>
      </section>
    </>
  );
}

function RegionDashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard Region"
        description="Vue limitee aux donnees de la region connectee: Sfax."
      />
      <div className="stats-grid">
        <StatCard label="Stock Sfax" value="10" tone="blue" />
        <StatCard label="Demandes en attente" value="2" tone="orange" />
        <StatCard label="Pannes declarees" value="3" tone="red" />
        <StatCard label="Mouvements mois" value="18" tone="green" />
      </div>
    </>
  );
}

function TransferPanel() {
  return (
    <section className="panel transfer-panel">
      <div className="panel-title">
        <h2>Transfert entre regions</h2>
        <span>Exemple admin</span>
      </div>
      <div className="transfer-route">
        <div>
          <span>{transferExample.from}</span>
          <strong>{transferExample.fromStock} modems</strong>
        </div>
        <span className="transfer-arrow">50</span>
        <div>
          <span>{transferExample.to}</span>
          <strong>{transferExample.toStock} modems</strong>
        </div>
      </div>
      <p>Creation d'un transfert de {transferExample.quantity} {transferExample.material}: {transferExample.from} vers {transferExample.to}. Le mouvement est enregistre automatiquement.</p>
      <button className="primary-button">Creer transfert</button>
    </section>
  );
}

function MaterialsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [availability, setAvailability] = useState('Toutes');

  const categories = ['Toutes', ...new Set(materials.map((item) => item.category))];
  const filtered = useMemo(
    () =>
      materials.filter((item) => {
        const matchesQuery = `${item.reference} ${item.name}`.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'Toutes' || item.category === category;
        const matchesAvailability = availability === 'Toutes' || item.status === availability;
        return matchesQuery && matchesCategory && matchesAvailability;
      }),
    [availability, category, query],
  );

  return (
    <>
      <PageHeader
        title="Materiels"
        description="Catalogue des equipements: references, categories, quantites et disponibilite."
        action={<button className="primary-button">+ Ajouter Materiel</button>}
      />
      <div className="toolbar">
        <label>
          Rechercher
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Reference ou nom" />
        </label>
        <label>
          Categorie
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            {categories.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Disponibilite
          <select value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option>Toutes</option>
            <option>Disponible</option>
            <option>Stock faible</option>
            <option>Rupture</option>
          </select>
        </label>
      </div>
      <DataTable
        columns={['Reference', 'Nom', 'Categorie', 'Quantite', 'Disponibilite', 'Action']}
        rows={filtered.map((item) => [
          item.reference,
          item.name,
          item.category,
          item.quantity,
          <span className={`availability-badge ${item.status.toLowerCase().replace(' ', '-')}`} key={`${item.reference}-status`}>
            {item.status}
          </span>,
          <button className="ghost-button" key={item.reference}>Voir</button>,
        ])}
      />
    </>
  );
}

function StockPage({ role = 'admin' }) {
  const visibleStocks = role === 'region' ? stockRows.filter((row) => row.region === 'Sfax') : stockRows;

  return (
    <>
      <PageHeader
        title={role === 'region' ? 'Mon Stock' : 'Stock Central'}
        description={
          role === 'region'
            ? 'Stock disponible uniquement pour la region Sfax.'
            : 'Suivi prioritaire des disponibilites par region avec seuils minimums.'
        }
      />
      <div className="status-strip">
        <span><i className="status-dot normal" /> Stock normal</span>
        <span><i className="status-dot faible" /> Stock faible</span>
        <span><i className="status-dot rupture" /> Rupture</span>
      </div>
      <div className="stock-table">
        <DataTable
          columns={['Materiel', 'Region', 'Disponible', 'Reserve', 'Seuil Mini']}
          rows={visibleStocks.map((row) => [
            row.material,
            row.region,
            <span className={`stock-pill ${getStockStatus(row)}`} key={`${row.material}-stock`}>{row.available}</span>,
            row.reserved,
            row.min,
          ])}
        />
      </div>
      {role === 'admin' && <TransferPanel />}
    </>
  );
}

function MovementsPage({ role = 'admin' }) {
  const visibleMovements = role === 'region' ? movements.filter((item) => item.region === 'Sfax') : movements;
  const columns =
    role === 'region'
      ? ['Date', 'Materiel', 'Quantite', 'Type', 'Provenance / Destination', 'Commentaire']
      : ['Date', 'Region', 'Materiel', 'Quantite', 'Type', 'Provenance / Destination', 'Commentaire'];
  const rows = visibleMovements.map((item) => {
    const commonCells = [
      item.date,
      item.material,
      item.quantity,
      <span className={`type-badge ${item.type.toLowerCase().replaceAll(' ', '-')}`} key={`${item.date}-${item.type}`}>
        {item.type}
      </span>,
      item.provenanceDestination,
      item.comment,
    ];

    return role === 'region' ? commonCells : [item.date, item.region, ...commonCells.slice(1)];
  });

  return (
    <>
      <PageHeader
        title={role === 'region' ? 'Mon Historique' : 'Mouvements'}
        description={
          role === 'region'
            ? 'Historique des mouvements de stock de la region Sfax uniquement.'
            : 'Historique complet des entrees, sorties, transferts, retours et pannes.'
        }
      />
      <DataTable columns={columns} rows={rows} />
    </>
  );
}

function RegionsPage() {
  return (
    <>
      <PageHeader
        title="Regions"
        description="Pilotage des stocks, historiques et demandes par region Telecom."
      />
      <div className="regions-grid">
        {regions.map((region, index) => (
          <article className="region-card" key={region}>
            <div>
              <h2>{region}</h2>
              <span>{index + 6} demandes</span>
            </div>
            <strong>{120 + index * 17}</strong>
            <p>Stock actuel</p>
          </article>
        ))}
      </div>
    </>
  );
}

function UsersPage() {
  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Gestion des admins, responsables region et responsables stock."
        action={<button className="primary-button">+ Ajouter Utilisateur</button>}
      />
      <DataTable
        columns={['Nom', 'Email', 'Region', 'Role']}
        rows={users.map((item) => [item.name, item.email, item.region, item.role])}
      />
    </>
  );
}

function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Rapports"
        description="Exports et analyses pour le suivi de la consommation et du stock restant."
      />
      <div className="report-actions">
        <button className="primary-button">Exporter PDF</button>
        <button className="secondary-button">Exporter Excel</button>
      </div>
      <div className="report-grid">
        {['Consommation par region', 'Stock restant', 'Historique mensuel'].map((item) => (
          <section className="panel" key={item}>
            <div className="panel-title">
              <h2>{item}</h2>
              <span>Pret</span>
            </div>
            <p>Rapport consolide avec filtres par date, region et categorie de materiel.</p>
          </section>
        ))}
      </div>
    </>
  );
}

function DataTable({ columns, rows }) {
  return (
    <div className="table-shell">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderPage(activePage, role) {
  if (role === 'region') {
    switch (activePage) {
      case 'Mon Stock':
        return <StockPage role={role} />;
      case 'Nouvelle Demande':
        return <RegionRequestPage />;
      case 'Mes Demandes':
        return <RequestsPage role={role} />;
      case 'Declaration de Panne':
        return <BreakdownDeclarationPage />;
      case 'Historique':
        return <MovementsPage role={role} />;
      default:
        return <RegionDashboard />;
    }
  }

  switch (activePage) {
    case 'Materiels':
      return <MaterialsPage />;
    case 'Stock Central':
      return <StockPage role={role} />;
    case 'Demandes':
      return <RequestsPage role={role} />;
    case 'Mouvements':
      return <MovementsPage role={role} />;
    case 'Regions':
      return <RegionsPage />;
    case 'Utilisateurs':
      return <UsersPage />;
    case 'Maintenance':
      return <MaintenancePage />;
    case 'Rapports':
      return <ReportsPage />;
    default:
      return <Dashboard />;
  }
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [role, setRole] = useState('admin');
  const menuItems = role === 'admin' ? adminMenuItems : regionMenuItems;

  function changeRole(nextRole) {
    setRole(nextRole);
    setActivePage('Dashboard');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <strong>TT</strong>
          </span>
          <div>
            <strong>Tunisie Telecom</strong>
            <small>Stock Management</small>
          </div>
        </div>
        <div className="role-switch">
          <button className={role === 'admin' ? 'active' : ''} onClick={() => changeRole('admin')} type="button">
            Admin
          </button>
          <button className={role === 'region' ? 'active' : ''} onClick={() => changeRole('region')} type="button">
            Region
          </button>
        </div>
        <nav>
          {menuItems.map((item) => (
            <button
              className={activePage === item ? 'active' : ''}
              key={item}
              onClick={() => setActivePage(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
        <button className="logout-button" type="button">Deconnexion</button>
      </aside>
      <main className="content">
        {renderPage(activePage, role)}
      </main>
    </div>
  );
}

export default App;
