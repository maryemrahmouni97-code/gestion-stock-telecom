import { useMemo, useState } from 'react';
import './App.css';

const menuItems = [
  'Dashboard',
  'Materiels',
  'Stock',
  'Mouvements',
  'Regions',
  'Utilisateurs',
  'Rapports',
  'Parametres',
];

const stats = [
  { label: 'Total Materiels', value: '2500', tone: 'blue' },
  { label: 'Total Regions', value: '24', tone: 'green' },
  { label: 'Stock Faible', value: '15', tone: 'orange' },
  { label: 'Materiels Defectueux', value: '8', tone: 'red' },
];

const materials = [
  { reference: 'MOD001', name: 'Modem Huawei HG8245', category: 'Reseau', quantity: 420, status: 'Disponible' },
  { reference: 'TEL001', name: 'Telephone IP Cisco', category: 'Telephonie', quantity: 180, status: 'Disponible' },
  { reference: 'ONT014', name: 'ONT Fibre Nokia', category: 'Fibre optique', quantity: 92, status: 'Stock faible' },
  { reference: 'CAB302', name: 'Cable RJ45 Cat 6', category: 'Accessoires', quantity: 1200, status: 'Disponible' },
  { reference: 'SWT088', name: 'Switch 24 ports', category: 'Reseau', quantity: 0, status: 'Rupture' },
];

const stockRows = [
  { material: 'Modem Huawei HG8245', region: 'Tunis', available: 160, reserved: 24, min: 80 },
  { material: 'Telephone IP Cisco', region: 'Sfax', available: 45, reserved: 12, min: 50 },
  { material: 'ONT Fibre Nokia', region: 'Sousse', available: 18, reserved: 8, min: 30 },
  { material: 'Switch 24 ports', region: 'Nabeul', available: 0, reserved: 4, min: 10 },
  { material: 'Cable RJ45 Cat 6', region: 'Gabes', available: 310, reserved: 40, min: 120 },
];

const movements = [
  { date: '2026-06-17', region: 'Tunis', material: 'Modem Huawei HG8245', quantity: 30, type: 'ENTREE' },
  { date: '2026-06-16', region: 'Sfax', material: 'Telephone IP Cisco', quantity: 12, type: 'SORTIE' },
  { date: '2026-06-15', region: 'Nabeul', material: 'Switch 24 ports', quantity: 4, type: 'PANNE' },
  { date: '2026-06-14', region: 'Sousse', material: 'ONT Fibre Nokia', quantity: 10, type: 'TRANSFERT' },
  { date: '2026-06-13', region: 'Gabes', material: 'Cable RJ45 Cat 6', quantity: 50, type: 'RETOUR' },
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
  { name: 'ONT Fibre', value: 74 },
  { name: 'Telephones IP', value: 58 },
  { name: 'Switchs', value: 42 },
];

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
        <section className="panel wide">
          <div className="panel-title">
            <h2>Stock par region</h2>
            <span>Disponible</span>
          </div>
          <div className="region-stock">
            {stockRows.map((row) => (
              <div key={`${row.material}-${row.region}`}>
                <span>{row.region}</span>
                <strong>{row.available}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function MaterialsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Toutes');

  const categories = ['Toutes', ...new Set(materials.map((item) => item.category))];
  const filtered = useMemo(
    () =>
      materials.filter((item) => {
        const matchesQuery = `${item.reference} ${item.name}`.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'Toutes' || item.category === category;
        return matchesQuery && matchesCategory;
      }),
    [category, query],
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
          <select defaultValue="Toutes">
            <option>Toutes</option>
            <option>Disponible</option>
            <option>Stock faible</option>
            <option>Rupture</option>
          </select>
        </label>
      </div>
      <DataTable
        columns={['Reference', 'Nom', 'Categorie', 'Quantite', 'Action']}
        rows={filtered.map((item) => [
          item.reference,
          item.name,
          item.category,
          item.quantity,
          <button className="ghost-button" key={item.reference}>Voir</button>,
        ])}
      />
    </>
  );
}

function StockPage() {
  return (
    <>
      <PageHeader
        title="Stock"
        description="Suivi prioritaire des disponibilites par region avec seuils minimums."
      />
      <div className="status-strip">
        <span><i className="status-dot normal" /> Stock normal</span>
        <span><i className="status-dot faible" /> Stock faible</span>
        <span><i className="status-dot rupture" /> Rupture</span>
      </div>
      <div className="stock-table">
        <DataTable
          columns={['Materiel', 'Region', 'Disponible', 'Reserve', 'Seuil Mini']}
          rows={stockRows.map((row) => [
            row.material,
            row.region,
            <span className={`stock-pill ${getStockStatus(row)}`} key={`${row.material}-stock`}>{row.available}</span>,
            row.reserved,
            row.min,
          ])}
        />
      </div>
    </>
  );
}

function MovementsPage() {
  return (
    <>
      <PageHeader
        title="Mouvements"
        description="Historique complet des entrees, sorties, transferts, retours et pannes."
      />
      <DataTable
        columns={['Date', 'Region', 'Materiel', 'Quantite', 'Type']}
        rows={movements.map((item) => [
          item.date,
          item.region,
          item.material,
          item.quantity,
          <span className={`type-badge ${item.type.toLowerCase()}`} key={`${item.date}-${item.type}`}>{item.type}</span>,
        ])}
      />
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

function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Parametres"
        description="Configuration de l'application, seuils de stock et connexion PostgreSQL."
      />
      <section className="settings-panel">
        <label>
          Seuil faible par defaut
          <input type="number" defaultValue="30" />
        </label>
        <label>
          Port API Spring Boot
          <input defaultValue="8081" />
        </label>
        <label>
          Base PostgreSQL
          <input defaultValue="data" />
        </label>
      </section>
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

function renderPage(activePage) {
  switch (activePage) {
    case 'Materiels':
      return <MaterialsPage />;
    case 'Stock':
      return <StockPage />;
    case 'Mouvements':
      return <MovementsPage />;
    case 'Regions':
      return <RegionsPage />;
    case 'Utilisateurs':
      return <UsersPage />;
    case 'Rapports':
      return <ReportsPage />;
    case 'Parametres':
      return <SettingsPage />;
    default:
      return <Dashboard />;
  }
}

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

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
        {renderPage(activePage)}
      </main>
    </div>
  );
}

export default App;
