import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import './App.css';
import { createItem, deleteItem, endpoints, getAll, updateItem } from './api';

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

const refusalReasons = [
  'Stock insuffisant',
  'Demande non justifiee',
  'Quantite excessive',
];

function getStockStatus(row) {
  if (row.quantite === 0) return 'rupture';
  if (row.quantite <= row.seuilMinimum) return 'faible';
  return 'normal';
}

const DataContext = createContext(null);

function formatDate(value) {
  return value ? new Intl.DateTimeFormat('fr-FR').format(new Date(value)) : '-';
}

function formatEnum(value = '') {
  return value.toLowerCase().replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function ask(label, initialValue = '') {
  return window.prompt(label, initialValue ?? '');
}

function useData() {
  return useContext(DataContext);
}

function useApiData() {
  const [data, setData] = useState(() => Object.fromEntries(Object.keys(endpoints).map((key) => [key, []])));
  const [error, setError] = useState('');

  async function refresh(signal) {
    try {
      const entries = await Promise.all(
        Object.entries(endpoints).map(async ([key, endpoint]) => [key, await getAll(endpoint, signal)]),
      );
      setData(Object.fromEntries(entries));
      setError('');
    } catch (requestError) {
      if (requestError.name !== 'AbortError') setError(requestError.message);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => refresh(controller.signal), 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  async function mutate(resource, method, id, payload) {
    try {
      if (method === 'POST') await createItem(endpoints[resource], payload);
      if (method === 'PUT') await updateItem(endpoints[resource], id, payload);
      if (method === 'DELETE') await deleteItem(endpoints[resource], id);
      await refresh();
      return true;
    } catch (requestError) {
      setError(requestError.message);
      return false;
    }
  }

  return { ...data, error, mutate, refresh };
}

function CrudButtons({ onEdit, onDelete }) {
  return (
    <div className="action-row">
      <button className="ghost-button" onClick={onEdit} type="button">Modifier</button>
      <button className="danger-button" onClick={onDelete} type="button">Supprimer</button>
    </div>
  );
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
  const { materials, regions, stocks, requests, movements, maintenances } = useData();
  const stats = [
    { label: 'Total Materiels', value: materials.length, tone: 'blue' },
    { label: 'Total Regions', value: regions.length, tone: 'green' },
    { label: 'Stock Faible', value: stocks.filter((stock) => stock.quantite <= stock.seuilMinimum).length, tone: 'orange' },
    { label: 'Materiels Defectueux', value: maintenances.filter((item) => item.etat === 'DEFECTUEUX').length, tone: 'red' },
  ];
  const movementTotals = movements.reduce((totals, movement) => {
    const month = new Date(movement.dateMouvement).getMonth();
    if (month >= 0 && month < 12) {
      if (movement.typeMouvement === 'ENTREE') totals[month].in += movement.quantite;
      if (movement.typeMouvement === 'SORTIE') totals[month].out += movement.quantite;
    }
    return totals;
  }, Array.from({ length: 12 }, () => ({ in: 0, out: 0 })));
  const maxFlow = Math.max(1, ...movementTotals.flatMap((item) => [item.in, item.out]));
  const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aout', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyFlow = movementTotals.map((item, index) => ({
    month: monthNames[index],
    in: (item.in / maxFlow) * 100,
    out: (item.out / maxFlow) * 100,
  }));
  const usage = movements.reduce((result, movement) => {
    const name = movement.materiel?.nom || 'Inconnu';
    result[name] = (result[name] || 0) + movement.quantite;
    return result;
  }, {});
  const maxUsage = Math.max(1, ...Object.values(usage));
  const topMaterials = Object.entries(usage)
    .sort(([, first], [, second]) => second - first)
    .slice(0, 4)
    .map(([name, quantity]) => ({ name, value: Math.round((quantity / maxUsage) * 100) }));
  const alerts = [
    `${stocks.filter((stock) => stock.quantite === 0).length} materiels en rupture`,
    `${maintenances.filter((item) => item.etat === 'DEFECTUEUX').length} materiels defectueux`,
    `${requests.filter((request) => request.statut === 'EN_ATTENTE').length} demandes en attente`,
  ];

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
  const { regions, requests, stocks, mutate } = useData();
  const [refusingRequestId, setRefusingRequestId] = useState(null);
  const [selectedReasons, setSelectedReasons] = useState({});
  const connectedRegion = regions[0];
  const visibleRequests = role === 'region'
    ? requests.filter((request) => request.region?.id === connectedRegion?.id)
    : requests;

  function updateRequest(request, changes) {
    return mutate('requests', 'PUT', request.id, { ...request, ...changes });
  }

  async function editDetail(request, detail) {
    const quantity = ask('Quantite demandee', detail.quantite);
    if (quantity === null) return;
    await mutate('requestDetails', 'PUT', detail.id, {
      ...detail,
      demande: { id: request.id },
      materiel: { id: detail.materiel.id },
      quantite: Number(quantity),
    });
  }

  async function addDetail(request) {
    const materialId = ask('Identifiant materiel');
    if (materialId === null) return;
    const quantity = ask('Quantite demandee', 1);
    if (quantity === null) return;
    await mutate('requestDetails', 'POST', null, {
      demande: { id: request.id }, materiel: { id: Number(materialId) }, quantite: Number(quantity),
    });
  }

  return (
    <>
      <PageHeader
        title={role === 'region' ? 'Mes Demandes' : 'Demandes'}
        description={
          role === 'region'
            ? 'Suivi des demandes creees par la region Sfax.'
            : 'Module central pour traiter les demandes de materiel des regions.'
        }
      />
      <div className="workflow-grid">
        {visibleRequests.map((request) => {
          const detail = request.details?.[0];
          const stock = stocks.find(
            (item) => item.region?.id === request.region?.id && item.materiel?.id === detail?.materiel?.id,
          );
          return (
          <article className="request-card" key={request.id}>
            <div className="request-card-header">
              <div>
                <p className="eyebrow">Demande #{request.id}</p>
                <h2>{request.region?.nomRegion} - {detail?.materiel?.nom || 'Sans detail'}</h2>
              </div>
              <span className={`status-badge ${formatEnum(request.statut).toLowerCase().replace(' ', '-')}`}>
                {formatEnum(request.statut)}
              </span>
            </div>
            <dl className="details-list">
              <div><dt>Stock actuel</dt><dd>{stock?.quantite ?? 0}</dd></div>
              <div><dt>Quantite demandee</dt><dd>{detail?.quantite ?? 0}</dd></div>
              <div><dt>Date</dt><dd>{formatDate(request.dateDemande)}</dd></div>
              <div><dt>Motif</dt><dd>{request.motif || '-'}</dd></div>
            </dl>
            {role === 'admin' && (
              <div className="action-row">
                <button className="primary-button" onClick={() => updateRequest(request, { statut: 'ACCEPTEE', motifRefus: null })} type="button">Accepter</button>
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
                      onClick={() => {
                        setSelectedReasons({ ...selectedReasons, [request.id]: reason });
                        updateRequest(request, { statut: 'REFUSEE', motifRefus: reason });
                        setRefusingRequestId(null);
                      }}
                      type="button"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="action-row three">
              {detail && <button className="ghost-button" onClick={() => editDetail(request, detail)} type="button">Modifier detail</button>}
              {detail
                ? <button className="ghost-button" onClick={() => window.confirm('Supprimer ce detail ?') && mutate('requestDetails', 'DELETE', detail.id)} type="button">Supprimer detail</button>
                : <button className="ghost-button" onClick={() => addDetail(request)} type="button">Ajouter detail</button>}
              <button className="danger-button" onClick={() => window.confirm('Supprimer cette demande ?') && mutate('requests', 'DELETE', request.id)} type="button">Supprimer</button>
            </div>
          </article>
          );
        })}
      </div>
    </>
  );
}

function MaintenancePage() {
  const { maintenances, mutate } = useData();

  function decide(ticket, decisionAdmin) {
    const etatByDecision = { REPARER: 'EN_REPARATION', REMPLACER: 'REMPLACE', REFORMER: 'REFORME' };
    return mutate('maintenances', 'PUT', ticket.id, {
      ...ticket,
      materiel: { id: ticket.materiel.id },
      region: { id: ticket.region.id },
      decisionAdmin,
      etat: etatByDecision[decisionAdmin],
    });
  }
  return (
    <>
      <PageHeader
        title="Maintenance"
        description="Traitement des pannes declarees par les regions: reparer, remplacer ou reformer."
      />
      <div className="workflow-grid">
        {maintenances.map((ticket) => (
          <article className="request-card maintenance-card" key={ticket.id}>
            <div className="request-card-header">
              <div>
                <p className="eyebrow">Panne #{ticket.id}</p>
                <h2>{ticket.materiel?.nom}</h2>
              </div>
              <span className="status-badge panne">{formatEnum(ticket.etat)}</span>
            </div>
            <dl className="details-list">
              <div><dt>Region</dt><dd>{ticket.region?.nomRegion}</dd></div>
              <div><dt>Quantite</dt><dd>{ticket.quantite}</dd></div>
              <div><dt>Date</dt><dd>{formatDate(ticket.dateDeclaration)}</dd></div>
              <div><dt>Statut</dt><dd>{formatEnum(ticket.decisionAdmin)}</dd></div>
            </dl>
            <div className="action-row three">
              <button className="primary-button" onClick={() => decide(ticket, 'REPARER')} type="button">Reparer</button>
              <button className="secondary-button" onClick={() => decide(ticket, 'REMPLACER')} type="button">Remplacer</button>
              <button className="danger-button" onClick={() => decide(ticket, 'REFORMER')} type="button">Reformer</button>
            </div>
            <button className="ghost-button" onClick={() => window.confirm('Supprimer cette maintenance ?') && mutate('maintenances', 'DELETE', ticket.id)} type="button">Supprimer</button>
          </article>
        ))}
      </div>
    </>
  );
}

function RegionRequestPage() {
  const { regions, materials, mutate } = useData();
  const [form, setForm] = useState({ regionId: '', materialId: '', quantity: 1, reason: '' });

  async function submit(event) {
    event.preventDefault();
    await mutate('requests', 'POST', null, {
      region: { id: Number(form.regionId || regions[0]?.id) },
      statut: 'EN_ATTENTE',
      motif: form.reason,
      details: [{ materiel: { id: Number(form.materialId || materials[0]?.id) }, quantite: Number(form.quantity) }],
    });
    setForm({ regionId: '', materialId: '', quantity: 1, reason: '' });
  }
  return (
    <>
      <PageHeader
        title="Nouvelle Demande"
        description="Le responsable region cree une demande visible par l'admin."
      />
      <form className="form-card" onSubmit={submit}>
        <label>
          Region
          <select value={form.regionId} onChange={(event) => setForm({ ...form, regionId: event.target.value })} required>
            <option value="">Choisir</option>
            {regions.map((region) => <option key={region.id} value={region.id}>{region.nomRegion}</option>)}
          </select>
        </label>
        <label>
          Materiel
          <select value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} required>
            <option value="">Choisir</option>
            {materials.map((material) => <option key={material.id} value={material.id}>{material.nom}</option>)}
          </select>
        </label>
        <label>
          Quantite
          <input min="1" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
        </label>
        <label className="full-field">
          Motif
          <textarea value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} />
        </label>
        <button className="primary-button" type="submit">Envoyer la demande</button>
      </form>
    </>
  );
}

function BreakdownDeclarationPage() {
  const { regions, materials, mutate } = useData();
  const [form, setForm] = useState({ regionId: '', materialId: '', quantity: 1, comment: '' });

  async function submit(event) {
    event.preventDefault();
    await mutate('maintenances', 'POST', null, {
      region: { id: Number(form.regionId) },
      materiel: { id: Number(form.materialId) },
      quantite: Number(form.quantity),
      etat: 'DEFECTUEUX',
      decisionAdmin: 'EN_ATTENTE',
      commentaire: form.comment,
    });
    setForm({ regionId: '', materialId: '', quantity: 1, comment: '' });
  }
  return (
    <>
      <PageHeader
        title="Declaration de Panne"
        description="La region declare les equipements defectueux pour decision administrative."
      />
      <form className="form-card" onSubmit={submit}>
        <label>
          Region
          <select value={form.regionId} onChange={(event) => setForm({ ...form, regionId: event.target.value })} required>
            <option value="">Choisir</option>
            {regions.map((region) => <option key={region.id} value={region.id}>{region.nomRegion}</option>)}
          </select>
        </label>
        <label>
          Materiel
          <select value={form.materialId} onChange={(event) => setForm({ ...form, materialId: event.target.value })} required>
            <option value="">Choisir</option>
            {materials.map((material) => <option key={material.id} value={material.id}>{material.nom}</option>)}
          </select>
        </label>
        <label>
          Quantite
          <input min="1" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} />
        </label>
        <label>
          Commentaire
          <input value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} />
        </label>
        <button className="primary-button" type="submit">Declarer la panne</button>
      </form>
    </>
  );
}

function RegionDashboard() {
  const { regions, stocks, requests, movements, maintenances } = useData();
  const region = regions[0];
  const belongsToRegion = (item) => item?.region?.id === region?.id;
  const regionStocks = stocks.filter(belongsToRegion);
  const regionMovements = movements.filter(
    (item) => item.regionSource?.id === region?.id || item.regionDestination?.id === region?.id,
  );
  return (
    <>
      <PageHeader
        title="Dashboard Region"
        description={`Vue limitee aux donnees de la region connectee: ${region?.nomRegion || '-'}.`}
      />
      <div className="stats-grid">
        <StatCard label={`Stock ${region?.nomRegion || ''}`} value={regionStocks.reduce((sum, item) => sum + item.quantite, 0)} tone="blue" />
        <StatCard label="Demandes en attente" value={requests.filter((item) => belongsToRegion(item) && item.statut === 'EN_ATTENTE').length} tone="orange" />
        <StatCard label="Pannes declarees" value={maintenances.filter(belongsToRegion).length} tone="red" />
        <StatCard label="Mouvements mois" value={regionMovements.length} tone="green" />
      </div>
    </>
  );
}

function TransferPanel() {
  const { stocks, mutate } = useData();
  const source = stocks[0];
  const destination = stocks.find((item) => item.region?.id !== source?.region?.id && item.materiel?.id === source?.materiel?.id);

  async function createTransfer() {
    if (!source || !destination) return;
    const quantity = ask('Quantite a transferer', 1);
    if (quantity === null) return;
    await mutate('movements', 'POST', null, {
      materiel: { id: source.materiel.id },
      quantite: Number(quantity),
      typeMouvement: 'TRANSFERT_SORTANT',
      regionSource: { id: source.region.id },
      regionDestination: { id: destination.region.id },
      commentaire: 'Transfert entre regions',
    });
  }

  if (!source || !destination) return null;
  return (
    <section className="panel transfer-panel">
      <div className="panel-title">
        <h2>Transfert entre regions</h2>
        <span>Admin</span>
      </div>
      <div className="transfer-route">
        <div>
          <span>{source.region.nomRegion}</span>
          <strong>{source.quantite} {source.materiel.nom}</strong>
        </div>
        <span className="transfer-arrow">→</span>
        <div>
          <span>{destination.region.nomRegion}</span>
          <strong>{destination.quantite} {destination.materiel.nom}</strong>
        </div>
      </div>
      <p>Creation d'un transfert de {source.materiel.nom}: {source.region.nomRegion} vers {destination.region.nomRegion}. Le mouvement est enregistre automatiquement.</p>
      <button className="primary-button" onClick={createTransfer} type="button">Creer transfert</button>
    </section>
  );
}

function MaterialsPage() {
  const { materials, stocks, mutate } = useData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [availability, setAvailability] = useState('Toutes');

  const materialRows = materials.map((item) => {
    const relatedStocks = stocks.filter((stock) => stock.materiel?.id === item.id);
    const quantity = relatedStocks.reduce((sum, stock) => sum + stock.quantite, 0);
    const status = quantity === 0 ? 'Rupture' : relatedStocks.some((stock) => stock.quantite <= stock.seuilMinimum) ? 'Stock faible' : 'Disponible';
    return { ...item, name: item.nom, category: item.categorie || '-', quantity, status };
  });
  const categories = ['Toutes', ...new Set(materialRows.map((item) => item.category))];
  const filtered = useMemo(
    () =>
      materialRows.filter((item) => {
        const matchesQuery = `${item.reference} ${item.name}`.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = category === 'Toutes' || item.category === category;
        const matchesAvailability = availability === 'Toutes' || item.status === availability;
        return matchesQuery && matchesCategory && matchesAvailability;
      }),
    [availability, category, query, materialRows],
  );

  async function saveMaterial(material) {
    const reference = ask('Reference', material?.reference);
    if (reference === null) return;
    const nom = ask('Nom', material?.nom);
    if (nom === null) return;
    const categorie = ask('Categorie', material?.categorie);
    if (categorie === null) return;
    const description = ask('Description', material?.description);
    if (description === null) return;
    await mutate('materials', material ? 'PUT' : 'POST', material?.id, { reference, nom, categorie, description });
  }

  return (
    <>
      <PageHeader
        title="Materiels"
        description="Catalogue des equipements: references, categories, quantites et disponibilite."
        action={<button className="primary-button" onClick={() => saveMaterial(null)} type="button">+ Ajouter Materiel</button>}
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
          <CrudButtons
            key={item.reference}
            onEdit={() => saveMaterial(item)}
            onDelete={() => window.confirm('Supprimer ce materiel ?') && mutate('materials', 'DELETE', item.id)}
          />,
        ])}
      />
    </>
  );
}

function StockPage({ role = 'admin' }) {
  const { regions, materials, stocks, mutate } = useData();
  const connectedRegion = regions[0];
  const visibleStocks = role === 'region' ? stocks.filter((row) => row.region?.id === connectedRegion?.id) : stocks;

  async function saveStock(stock) {
    const regionId = ask('Identifiant region', stock?.region?.id || regions[0]?.id);
    if (regionId === null) return;
    const materialId = ask('Identifiant materiel', stock?.materiel?.id || materials[0]?.id);
    if (materialId === null) return;
    const quantite = ask('Quantite', stock?.quantite || 0);
    if (quantite === null) return;
    const seuilMinimum = ask('Seuil minimum', stock?.seuilMinimum || 0);
    if (seuilMinimum === null) return;
    await mutate('stocks', stock ? 'PUT' : 'POST', stock?.id, {
      region: { id: Number(regionId) }, materiel: { id: Number(materialId) },
      quantite: Number(quantite), seuilMinimum: Number(seuilMinimum),
    });
  }

  return (
    <>
      <PageHeader
        title={role === 'region' ? 'Mon Stock' : 'Stock Central'}
        description={
          role === 'region'
            ? `Stock disponible uniquement pour la region ${connectedRegion?.nomRegion || '-'}.`
            : 'Suivi prioritaire des disponibilites par region avec seuils minimums.'
        }
        action={role === 'admin' ? <button className="primary-button" onClick={() => saveStock(null)} type="button">+ Ajouter Stock</button> : null}
      />
      <div className="status-strip">
        <span><i className="status-dot normal" /> Stock normal</span>
        <span><i className="status-dot faible" /> Stock faible</span>
        <span><i className="status-dot rupture" /> Rupture</span>
      </div>
      <div className="stock-table">
        <DataTable
          columns={['Materiel', 'Region', 'Disponible', 'Etat', 'Seuil Mini', 'Action']}
          rows={visibleStocks.map((row) => [
            row.materiel?.nom,
            row.region?.nomRegion,
            <span className={`stock-pill ${getStockStatus(row)}`} key={`${row.id}-stock`}>{row.quantite}</span>,
            formatEnum(getStockStatus(row)),
            row.seuilMinimum,
            role === 'admin' ? <CrudButtons key={row.id} onEdit={() => saveStock(row)} onDelete={() => window.confirm('Supprimer ce stock ?') && mutate('stocks', 'DELETE', row.id)} /> : '-',
          ])}
        />
      </div>
      {role === 'admin' && <TransferPanel />}
    </>
  );
}

function MovementsPage({ role = 'admin' }) {
  const { regions, materials, movements, mutate } = useData();
  const connectedRegion = regions[0];
  const visibleMovements = role === 'region'
    ? movements.filter((item) => item.regionSource?.id === connectedRegion?.id || item.regionDestination?.id === connectedRegion?.id)
    : movements;
  const columns =
    role === 'region'
      ? ['Date', 'Materiel', 'Quantite', 'Type', 'Provenance / Destination', 'Commentaire']
      : ['Date', 'Region', 'Materiel', 'Quantite', 'Type', 'Provenance / Destination', 'Commentaire', 'Action'];

  async function saveMovement(item) {
    const materialId = ask('Identifiant materiel', item?.materiel?.id || materials[0]?.id);
    if (materialId === null) return;
    const quantite = ask('Quantite', item?.quantite || 1);
    if (quantite === null) return;
    const typeMouvement = ask('Type (ENTREE, SORTIE, TRANSFERT_ENTRANT, TRANSFERT_SORTANT, RETOUR, PANNE)', item?.typeMouvement || 'ENTREE');
    if (typeMouvement === null) return;
    const sourceId = ask('Identifiant region source (vide si aucune)', item?.regionSource?.id || '');
    if (sourceId === null) return;
    const destinationId = ask('Identifiant region destination (vide si aucune)', item?.regionDestination?.id || '');
    if (destinationId === null) return;
    const commentaire = ask('Commentaire', item?.commentaire);
    if (commentaire === null) return;
    await mutate('movements', item ? 'PUT' : 'POST', item?.id, {
      materiel: { id: Number(materialId) }, quantite: Number(quantite), typeMouvement,
      regionSource: sourceId ? { id: Number(sourceId) } : null,
      regionDestination: destinationId ? { id: Number(destinationId) } : null,
      dateMouvement: item?.dateMouvement,
      commentaire,
    });
  }

  const rows = visibleMovements.map((item) => {
    const region = item.regionSource?.nomRegion || item.regionDestination?.nomRegion || '-';
    const commonCells = [
      formatDate(item.dateMouvement),
      item.materiel?.nom,
      item.quantite,
      <span className={`type-badge ${item.typeMouvement.toLowerCase().replaceAll('_', '-')}`} key={`${item.id}-${item.typeMouvement}`}>
        {formatEnum(item.typeMouvement)}
      </span>,
      `${item.regionSource?.nomRegion || '-'} / ${item.regionDestination?.nomRegion || '-'}`,
      item.commentaire || '-',
    ];

    return role === 'region' ? commonCells : [commonCells[0], region, ...commonCells.slice(1), <CrudButtons key={item.id} onEdit={() => saveMovement(item)} onDelete={() => window.confirm('Supprimer ce mouvement ?') && mutate('movements', 'DELETE', item.id)} />];
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
        action={role === 'admin' ? <button className="primary-button" onClick={() => saveMovement(null)} type="button">+ Ajouter Mouvement</button> : null}
      />
      <DataTable columns={columns} rows={rows} />
    </>
  );
}

function RegionsPage() {
  const { regions, stocks, requests, mutate } = useData();

  async function saveRegion(region) {
    const nomRegion = ask('Nom de la region', region?.nomRegion);
    if (nomRegion === null) return;
    const adresse = ask('Adresse', region?.adresse);
    if (adresse === null) return;
    await mutate('regions', region ? 'PUT' : 'POST', region?.id, { nomRegion, adresse });
  }

  return (
    <>
      <PageHeader
        title="Regions"
        description="Pilotage des stocks, historiques et demandes par region Telecom."
        action={<button className="primary-button" onClick={() => saveRegion(null)} type="button">+ Ajouter Region</button>}
      />
      <div className="regions-grid">
        {regions.map((region) => (
          <article className="region-card" key={region.id}>
            <div>
              <h2>{region.nomRegion}</h2>
              <span>{requests.filter((request) => request.region?.id === region.id).length} demandes</span>
            </div>
            <strong>{stocks.filter((stock) => stock.region?.id === region.id).reduce((sum, stock) => sum + stock.quantite, 0)}</strong>
            <p>Stock actuel · {region.adresse}</p>
            <CrudButtons onEdit={() => saveRegion(region)} onDelete={() => window.confirm('Supprimer cette region ?') && mutate('regions', 'DELETE', region.id)} />
          </article>
        ))}
      </div>
    </>
  );
}

function UsersPage() {
  const { users, regions, mutate } = useData();

  async function saveUser(user) {
    const nom = ask('Nom', user?.nom);
    if (nom === null) return;
    const email = ask('Email', user?.email);
    if (email === null) return;
    const motDePasse = ask('Mot de passe', user?.motDePasse);
    if (motDePasse === null) return;
    const role = ask('Role (ADMIN ou RESPONSABLE_REGION)', user?.role || 'RESPONSABLE_REGION');
    if (role === null) return;
    const regionId = ask('Identifiant region (vide pour aucune)', user?.region?.id || regions[0]?.id || '');
    if (regionId === null) return;
    await mutate('users', user ? 'PUT' : 'POST', user?.id, {
      nom, email, motDePasse, role, region: regionId ? { id: Number(regionId) } : null,
    });
  }

  return (
    <>
      <PageHeader
        title="Utilisateurs"
        description="Gestion des admins, responsables region et responsables stock."
        action={<button className="primary-button" onClick={() => saveUser(null)} type="button">+ Ajouter Utilisateur</button>}
      />
      <DataTable
        columns={['Nom', 'Email', 'Region', 'Role', 'Action']}
        rows={users.map((item) => [
          item.nom, item.email, item.region?.nomRegion || '-', formatEnum(item.role),
          <CrudButtons key={item.id} onEdit={() => saveUser(item)} onDelete={() => window.confirm('Supprimer cet utilisateur ?') && mutate('users', 'DELETE', item.id)} />,
        ])}
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
  const apiData = useApiData();
  const [activePage, setActivePage] = useState('Dashboard');
  const [role, setRole] = useState('admin');
  const menuItems = role === 'admin' ? adminMenuItems : regionMenuItems;

  function changeRole(nextRole) {
    setRole(nextRole);
    setActivePage('Dashboard');
  }

  return (
    <DataContext.Provider value={apiData}>
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
        {apiData.error && <div className="api-error">Impossible de synchroniser les donnees : {apiData.error}</div>}
        {renderPage(activePage, role)}
      </main>
    </div>
    </DataContext.Provider>
  );
}

export default App;
