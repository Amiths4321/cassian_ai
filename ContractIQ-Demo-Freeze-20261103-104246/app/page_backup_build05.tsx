"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight,
  Bell, Bot, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, CloudUpload, FileCheck2,
  FileSearch, FileText, Filter, FolderOpen, Gauge, LayoutDashboard, Menu,
  MessageSquareText, MoreHorizontal, Plus, Search, Settings, ShieldAlert,
  Sparkles, TrendingDown, Upload, Wallet, X
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, BarChart, Bar
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type IndexedDocument = {
  document_id: string;
  filename: string;
  original_filename?: string;
  pages_indexed: number;
  chunks_created: number;
  status: string;
};

type Section = "Overview" | "Contracts" | "AI Analysis" | "Risk Intelligence" | "Obligations" | "Contract Comparison" | "Commercial Intelligence" | "AI Assistant" | "Drafting" | "Settings";

const initialContracts = [
  { id: "CTR-2026-001", name: "Enterprise Cloud Services Agreement", vendor: "Nimbus Technologies", type: "Technology", value: "₹48,00,000", start: "12 Jan 2026", expiry: "11 Jan 2027", status: "Active", risk: "Medium", initials: "NT", color: "blue" },
  { id: "CTR-2026-002", name: "Logistics & Distribution MSA", vendor: "Apex Logistics Pvt Ltd", type: "Logistics", value: "₹32,50,000", start: "01 Mar 2026", expiry: "28 Feb 2027", status: "Active", risk: "High", initials: "AL", color: "orange" },
  { id: "CTR-2026-003", name: "Managed Security Services", vendor: "Sentinel Cyber", type: "Technology", value: "₹18,00,000", start: "15 Feb 2026", expiry: "14 Feb 2027", status: "Under Review", risk: "High", initials: "SC", color: "purple" },
  { id: "CTR-2026-004", name: "Office Facilities Agreement", vendor: "UrbanWorks Services", type: "Facilities", value: "₹12,00,000", start: "01 Apr 2026", expiry: "31 Mar 2027", status: "Active", risk: "Low", initials: "UW", color: "green" },
  { id: "CTR-2026-005", name: "Raw Materials Supply Contract", vendor: "Vertex Industrial", type: "Procurement", value: "₹76,00,000", start: "20 May 2026", expiry: "19 May 2027", status: "Active", risk: "Medium", initials: "VI", color: "teal" },
  { id: "CTR-2026-006", name: "Marketing Services SOW", vendor: "Brightline Media", type: "Marketing", value: "₹9,60,000", start: "01 Jun 2026", expiry: "30 Nov 2026", status: "Expiring Soon", risk: "Low", initials: "BM", color: "pink" },
];

const spendData = [
  { month: "May", committed: 22, actual: 18 }, { month: "Jun", committed: 26, actual: 23 },
  { month: "Jul", committed: 24, actual: 21 }, { month: "Aug", committed: 31, actual: 28 },
  { month: "Sep", committed: 29, actual: 26 }, { month: "Oct", committed: 36, actual: 30 },
  { month: "Nov", committed: 33, actual: 27 }, { month: "Dec", committed: 39, actual: 32 },
];
const obligations = [
  { title: "Renewal notice — Brightline Media", contract: "CTR-2026-006", date: "05 Nov 2026", days: "6 days", level: "Urgent" },
  { title: "Quarterly SLA performance review", contract: "CTR-2026-002", date: "09 Nov 2026", days: "10 days", level: "Upcoming" },
  { title: "Insurance certificate submission", contract: "CTR-2026-003", date: "15 Nov 2026", days: "16 days", level: "Upcoming" },
  { title: "Annual pricing review", contract: "CTR-2026-005", date: "20 Nov 2026", days: "21 days", level: "Normal" },
];

const navGroups = [
  { label: "WORKSPACE", items: [{ name: "Overview" as Section, icon: LayoutDashboard }, { name: "Contracts" as Section, icon: FolderOpen }, { name: "AI Analysis" as Section, icon: FileSearch }] },
  { label: "INTELLIGENCE", items: [{ name: "Risk Intelligence" as Section, icon: ShieldAlert }, { name: "Obligations" as Section, icon: CalendarDays }, { name: "Contract Comparison" as Section, icon: FileCheck2 }, { name: "Commercial Intelligence" as Section, icon: Wallet }] },
  { label: "AI WORKSPACE", items: [{ name: "AI Assistant" as Section, icon: Bot }, { name: "Drafting" as Section, icon: FileText }] },
];

type MetricCardProps = {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  tone: string;
  trend?: "up" | "down";
};

function MetricCard({ label, value, note, icon: Icon, tone, trend }: MetricCardProps) {
  const firstSpace = note.indexOf(" ");
  const trendText = firstSpace === -1 ? note : note.slice(0, firstSpace);
  const restText = firstSpace === -1 ? "" : note.slice(firstSpace + 1);
  return <div className="metric-card">
    <div className="metric-top"><span>{label}</span><div className={`metric-icon ${tone}`}><Icon size={18}/></div></div>
    <div className="metric-value">{value}</div>
    <div className="metric-note">{trend && <span className={trend === "up" ? "trend-up" : "trend-down"}>{trend === "up" ? <ArrowUpRight size={13}/> : <ArrowDownRight size={13}/>} {trendText}</span>}<span>{trend ? restText : note}</span></div>
  </div>;
}

export default function Home() {
  const [active, setActive] = useState<Section>("Overview");
  const [query, setQuery] = useState("");
  const [globalQuery, setGlobalQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [contracts] = useState(initialContracts);
const [documents, setDocuments] = useState<IndexedDocument[]>([]);
const [selectedDocumentId, setSelectedDocumentId] = useState("");
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState("");
const [showUpload, setShowUpload] = useState(false);
const [documentsLoading, setDocumentsLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load documents already persisted by the FastAPI/PostgreSQL backend.
  useEffect(() => {
    const loadDocuments = async () => {
      setDocumentsLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/documents`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.detail || "Could not load stored contracts.");
        }
        const loaded: IndexedDocument[] = (data.documents || []).map((doc: any) => ({
          document_id: doc.document_id,
          filename: doc.original_filename || doc.filename,
          original_filename: doc.original_filename || doc.filename,
          pages_indexed: doc.pages_indexed ?? doc.pages ?? 0,
          chunks_created: doc.chunks_created ?? doc.chunks ?? 0,
          status: doc.status || "indexed",
        }));
        setDocuments(loaded);
        setSelectedDocumentId(current =>
          current && loaded.some(doc => doc.document_id === current)
            ? current
            : (loaded[0]?.document_id || "")
        );
      } catch (error) {
        console.error("Unable to load backend documents:", error);
        setUploadError(error instanceof Error ? error.message : "Could not connect to the document backend.");
      } finally {
        setDocumentsLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const filteredContracts = useMemo(() => contracts.filter(c =>
    (c.name.toLowerCase().includes(query.toLowerCase()) || c.vendor.toLowerCase().includes(query.toLowerCase()) || c.id.toLowerCase().includes(query.toLowerCase())) &&
    (filter === "All" || c.status === filter || c.risk === filter)
  ), [contracts, query, filter]);

  
const handleFiles = async (files: FileList | null) => {
  if (!files || files.length === 0) return;

  setUploading(true);
  setUploadError("");

  const selectedFiles = Array.from(files);

  try {
    for (const file of selectedFiles) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        throw new Error(`${file.name}: Only PDF files are currently supported.`);
      }

      if (file.size > 20 * 1024 * 1024) {
        throw new Error(`${file.name}: Maximum upload size is 20 MB.`);
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/api/documents/upload`,
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Document upload failed.");
      }

      const newDocument: IndexedDocument = {
        document_id: data.document_id,
        filename: data.original_filename || data.filename,
        original_filename: data.original_filename || data.filename,
        pages_indexed: data.pages_indexed,
        chunks_created: data.chunks_created,
        status: "indexed"
      };

      setDocuments(previous => [
        newDocument,
        ...previous.filter(
          doc => doc.document_id !== newDocument.document_id
        )
      ]);

      // Automatically select the newly uploaded contract.
      setSelectedDocumentId(data.document_id);
    }

    setShowUpload(false);
    setActive("Contracts");

  } catch (error) {
    setUploadError(
      error instanceof Error
        ? error.message
        : "Unable to upload document."
    );
  } finally {
    setUploading(false);
  }
};


  const runGlobalSearch = () => {
    setQuery(globalQuery.trim());
    setActive("Contracts");
  };

  const titleMap: Record<Section, string> = {
    "Overview": "Executive Overview", "Contracts": "Contract Repository", "AI Analysis": "AI Contract Analysis",
    "Risk Intelligence": "Risk Intelligence", "Obligations": "Obligation Management", "Contract Comparison": "Contract Comparison",
    "Commercial Intelligence": "Commercial Intelligence", "AI Assistant": "AI Contract Assistant", "Drafting": "Contract Drafting", "Settings": "Workspace Settings"
  };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="brand">
        <div className="brand-mark"><span>c</span><Sparkles size={13}/></div>
        <div><div className="brand-name">contractiq<span> AI</span></div><div className="brand-caption">CONTRACT INTELLIGENCE</div></div>
        <button className="mobile-close icon-button" onClick={() => setMobileOpen(false)}><X size={18}/></button>
      </div>
      <div className="workspace-switch"><div className="workspace-avatar">A</div><div className="workspace-copy"><b>Acme Corporation</b><small>Business workspace</small></div><ChevronDown size={15}/></div>
      <nav className="navigation">
        {navGroups.map(group => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.items.map(item => {
          const Icon = item.icon;
          return <button key={item.name} onClick={() => {setActive(item.name); setMobileOpen(false);}} className={`nav-item ${active === item.name ? "active" : ""}`}><Icon size={17}/><span>{item.name}</span>{item.name === "Risk Intelligence" && <i className="nav-count">8</i>}</button>;
        })}</div>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><b>Need a hand?</b><p>Explore the product guide and learn how to get started.</p><button onClick={() => setActive("AI Assistant")}>Visit help centre <ArrowRight size={13}/></button></div>
        <button className={`nav-item ${active === "Settings" ? "active" : ""}`} onClick={() => setActive("Settings")}><Settings size={17}/><span>Settings</span></button>
        <div className="profile-row"><div className="profile-avatar">JD</div><div className="profile-copy"><b>Jordan Davis</b><small>Workspace admin</small></div><MoreHorizontal size={18}/></div>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMobileOpen(true)}><Menu size={20}/></button>
        <div className="breadcrumb">Workspace <ChevronRight size={14}/> <b>{titleMap[active]}</b></div>
        <div className="top-actions">
          <div className="global-search"><Search size={15}/><input placeholder="Search contracts... (press Enter)" value={globalQuery} onChange={e => setGlobalQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter") runGlobalSearch(); }}/><kbd>⌘ K</kbd></div>
          <button className="icon-button notification"><Bell size={18}/><i/></button>
          <div className="top-avatar">JD</div>
        </div>
      </header>

      <div className="content">
        {active === "Overview" && <Overview onUpload={() => setShowUpload(true)} setActive={setActive} />}
        {active === "Contracts" && <ContractsView contracts={filteredContracts} query={query} setQuery={setQuery} filter={filter} setFilter={setFilter} onUpload={() => setShowUpload(true)} documents={documents} documentsLoading={documentsLoading}/>}
        {active === "Risk Intelligence" && <RiskView />}
        {active === "Obligations" && <ObligationsView />}
        {active === "Commercial Intelligence" && <CommercialView />}
        {active === "AI Assistant" && (
        <AssistantView
          chatInput={chatInput}
          setChatInput={setChatInput}
          documents={documents}
          selectedDocumentId={selectedDocumentId}
          setSelectedDocumentId={setSelectedDocumentId}
        />
      )}
        {active === "AI Analysis" && <AnalysisView onUpload={() => setShowUpload(true)} uploaded={documents.map(doc => doc.filename)}/>}
        {active === "Contract Comparison" && <ComparisonView />}
        {active === "Drafting" && <DraftingView />}
        {active === "Settings" && <SettingsView />}
      </div>
      <footer className="footer"><span>© 2026 ContractIQ AI</span><span><i className="status-dot"/> All systems operational <span className="footer-divider">·</span> v0.1.0</span></footer>
    </main>

    {showUpload && <div className="modal-backdrop" onClick={() => setShowUpload(false)}><div className="upload-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-heading"><div><h2>Upload contracts</h2><p>Add documents to your contract workspace.</p></div><button className="icon-button" onClick={() => setShowUpload(false)}><X size={18}/></button></div>
      <div className="dropzone" onClick={() => fileRef.current?.click()}><div className="upload-symbol"><CloudUpload size={25}/></div><b>Click to browse or drag files here</b><span>PDF documents · Automatically indexed · 20 MB maximum</span><button className="button button-primary" disabled={uploading}>
      <Upload size={15}/>
      {uploading ? "Uploading and indexing..." : "Choose files"}
    </button><input
      ref={fileRef}
      type="file"
      multiple
      accept=".pdf,application/pdf"
      hidden
      onChange={e => {
        handleFiles(e.target.files);
        e.target.value = "";
      }}
/></div>
      {uploadError && <div className="modal-footnote" role="alert"><ShieldAlert size={14}/> {uploadError}</div>}
      <div className="modal-footnote"><CheckCircle2 size={14}/> PDFs are uploaded to your local backend and indexed in PostgreSQL.</div>
    </div></div>}
  </div>;
}

function PageHeading({eyebrow, title, description, action}: {eyebrow: string; title: string; description: string; action?: React.ReactNode}) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Overview({onUpload, setActive}: {onUpload: () => void; setActive: (s: Section) => void}) {
  // Computed after mount to avoid server/client hydration mismatches.
  const [dateLabel, setDateLabel] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");
  useEffect(() => {
    const now = new Date();
    setDateLabel(now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase());
    const h = now.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  return <>
    <PageHeading eyebrow={dateLabel} title={`${greeting}, Jordan`} description="Here's what's happening across your contract portfolio today." action={<button className="button button-primary" onClick={onUpload}><Plus size={16}/> Upload contract</button>}/>
    <div className="insight-banner"><div className="insight-spark"><Sparkles size={19}/></div><div><b>Your portfolio has 3 items that need attention</b><p>Two high-risk clauses need review and one renewal notice is due in the next 7 days.</p></div><button onClick={() => setActive("Risk Intelligence")}>Review insights <ArrowRight size={15}/></button></div>
    <div className="metrics-grid">
      <MetricCard label="Total contracts" value="248" note="+12 this month" icon={FileText} tone="violet" trend="up"/>
      <MetricCard label="Active contract value" value="₹8.42 Cr" note="+8.4% vs last quarter" icon={Wallet} tone="blue" trend="up"/>
      <MetricCard label="High-risk contracts" value="08" note="3 need immediate review" icon={ShieldAlert} tone="red" trend="down"/>
      <MetricCard label="Upcoming obligations" value="14" note="Next 30 days" icon={CalendarDays} tone="amber"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel spend-panel">
        <div className="panel-heading"><div><h3>Contract spend overview</h3><p>Committed vs. actual spend · ₹ Lakhs</p></div><button className="select-button">Last 8 months <ChevronDown size={14}/></button></div>
        <div className="chart-legend"><span><i className="legend-dot committed"/> Committed</span><span><i className="legend-dot actual"/> Actual spend</span></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={spendData} margin={{top:10,right:8,left:-18,bottom:0}}><defs><linearGradient id="committedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8B7CF6" stopOpacity={0.18}/><stop offset="95%" stopColor="#8B7CF6" stopOpacity={0}/></linearGradient><linearGradient id="actualFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#36B69A" stopOpacity={0.16}/><stop offset="95%" stopColor="#36B69A" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F5"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:11,fill:"#8992A5"}} dy={9}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:11,fill:"#8992A5"}}/><Tooltip contentStyle={{border:"1px solid #E9ECF2",borderRadius:10,fontSize:12}}/><Area type="monotone" dataKey="committed" stroke="#897AF1" strokeWidth={2.2} fill="url(#committedFill)"/><Area type="monotone" dataKey="actual" stroke="#32B59A" strokeWidth={2.2} fill="url(#actualFill)"/></AreaChart></ResponsiveContainer></div>
        <div className="chart-foot"><span>Portfolio spend is illustrative demo data.</span><button onClick={() => setActive("Commercial Intelligence")}>View commercial insights <ArrowRight size={13}/></button></div>
      </section>
      <section className="panel risk-panel">
        <div className="panel-heading"><div><h3>Risk distribution</h3><p>Contract portfolio by risk level</p></div><button className="more-button"><MoreHorizontal size={19}/></button></div>
        <div className="risk-chart"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={[{name:"Low",value:146},{name:"Medium",value:94},{name:"High",value:8}]} innerRadius={61} outerRadius={83} paddingAngle={4} dataKey="value" stroke="none"><Cell fill="#36B58E"/><Cell fill="#E9AD4C"/><Cell fill="#E46D72"/></Pie><Tooltip/></PieChart></ResponsiveContainer><div className="donut-label"><b>248</b><span>Contracts</span></div></div>
        <div className="risk-legend"><div><i className="risk-dot low"/>Low risk <b>146</b><span>59%</span></div><div><i className="risk-dot medium"/>Medium risk <b>94</b><span>38%</span></div><div><i className="risk-dot high"/>High risk <b>8</b><span>3%</span></div></div>
      </section>
    </div>
    <div className="dashboard-grid lower-grid">
      <section className="panel">
        <div className="panel-heading"><div><h3>Contracts requiring attention</h3><p>AI-identified items for your review</p></div><button className="text-button" onClick={() => setActive("Risk Intelligence")}>View all <ArrowRight size={13}/></button></div>
        <div className="attention-list">
          <div className="attention-item"><div className="attention-icon red-soft"><AlertTriangle size={17}/></div><div className="attention-copy"><b>Unlimited liability clause detected</b><span>Managed Security Services · Sentinel Cyber</span></div><span className="risk-pill high">High risk</span></div>
          <div className="attention-item"><div className="attention-icon amber-soft"><Clock3 size={17}/></div><div className="attention-copy"><b>Auto-renewal notice window approaching</b><span>Marketing Services SOW · Brightline Media</span></div><span className="risk-pill medium">Action due</span></div>
          <div className="attention-item"><div className="attention-icon blue-soft"><FileSearch size={17}/></div><div className="attention-copy"><b>Missing data processing addendum</b><span>Enterprise Cloud Services · Nimbus Technologies</span></div><span className="risk-pill medium">Review</span></div>
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading"><div><h3>Upcoming obligations</h3><p>Next 30 days</p></div><button className="text-button" onClick={() => setActive("Obligations")}>View calendar <ArrowRight size={13}/></button></div>
        <div className="obligation-list">{obligations.slice(0,3).map((o,i)=><div className="obligation-item" key={o.title}><div className={`date-tile date-${i}`}><b>{o.date.split(" ")[0]}</b><span>{o.date.split(" ")[1].slice(0,3).toUpperCase()}</span></div><div className="obligation-copy"><b>{o.title}</b><span>{o.contract}</span></div><span className={`due-label ${o.level.toLowerCase()}`}>{o.days}</span></div>)}</div>
      </section>
    </div>
    <div className="demo-disclaimer"><Activity size={14}/> Demo workspace · All figures, contracts, vendors and findings are fictional sample data.</div>
  </>;
}

function ContractsView({contracts, query, setQuery, filter, setFilter, onUpload, documents, documentsLoading}: any) {
  const [selected, setSelected] = useState<any>(null);
  const statuses = ["All","Active","Under Review","Expiring Soon","High","Medium","Low"];
  return <>
    <PageHeading eyebrow="WORKSPACE / DOCUMENTS" title="Contract repository" description="Manage, search and explore your organisation's agreements." action={<button className="button button-primary" onClick={onUpload}><Plus size={16}/> Upload contract</button>}/>
    <div className="metrics-grid compact-metrics"><MetricCard label="Total contracts" value={248 + documents.length} note="Across all categories" icon={FileText} tone="violet"/><MetricCard label="Active" value="221" note="Currently in force" icon={CheckCircle2} tone="green"/><MetricCard label="Under review" value="13" note="Awaiting approval" icon={FileSearch} tone="blue"/><MetricCard label="Expiring soon" value="14" note="Next 90 days" icon={Clock3} tone="amber"/></div>
    <section className="panel table-panel">
      <div className="table-toolbar"><div className="table-search"><Search size={15}/><input placeholder="Search contracts or vendors..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="toolbar-right"><select value={filter} onChange={e=>setFilter(e.target.value)}>{statuses.map(s=><option key={s}>{s}</option>)}</select><button className="button button-outline"><Filter size={14}/> Filters</button></div></div>
      <div className="table-scroll"><table><thead><tr><th>CONTRACT / VENDOR</th><th>TYPE</th><th>CONTRACT VALUE</th><th>EXPIRY DATE</th><th>STATUS</th><th>RISK</th><th></th></tr></thead><tbody>
        {contracts.map((c:any)=><tr key={c.id} onClick={()=>setSelected(c)} className="clickable-row"><td><div className="contract-cell"><div className={`vendor-avatar ${c.color}`}>{c.initials}</div><div><b>{c.name}</b><span>{c.vendor} · {c.id}</span></div></div></td><td>{c.type}</td><td className="value-cell">{c.value}</td><td>{c.expiry}</td><td><span className={`status-pill ${c.status.toLowerCase().replaceAll(" ","-")}`}>{c.status}</span></td><td><span className={`risk-pill ${c.risk.toLowerCase()}`}>{c.risk}</span></td><td><MoreHorizontal size={17} color="#9AA2B1"/></td></tr>)}
        {documents.map((doc: IndexedDocument)=><tr key={doc.document_id}><td><div className="contract-cell"><div className="vendor-avatar gray"><FileText size={17}/></div><div><b>{doc.filename}</b><span>Stored contract · ID {doc.document_id}</span></div></div></td><td>PDF document</td><td>—</td><td>—</td><td><span className="status-pill active">{doc.status}</span></td><td>—</td><td><MoreHorizontal size={17}/></td></tr>)}
        {documentsLoading && <tr><td colSpan={7} className="empty-state">Loading contracts from backend…</td></tr>}
        {contracts.length===0 && documents.length===0 && !documentsLoading && <tr><td colSpan={7} className="empty-state">No contracts found. Upload a PDF to get started.</td></tr>}
      </tbody></table></div>
      <div className="table-footer"><span>Showing {contracts.length + documents.length} sample and uploaded records</span><div><button disabled><ChevronLeft size={15}/></button><button className="page-current">1</button><button disabled><ChevronRight size={15}/></button></div></div>
    </section>
    {selected && <div className="detail-drawer-backdrop" onClick={()=>setSelected(null)}><aside className="detail-drawer" onClick={e=>e.stopPropagation()}><div className="drawer-top"><span className="eyebrow">CONTRACT DETAILS</span><button className="icon-button" onClick={()=>setSelected(null)}><X size={18}/></button></div><div className="drawer-vendor"><div className={`vendor-avatar large ${selected.color}`}>{selected.initials}</div><div><h2>{selected.name}</h2><p>{selected.vendor}</p></div></div><div className="drawer-tags"><span className={`status-pill ${selected.status.toLowerCase().replaceAll(" ","-")}`}>{selected.status}</span><span className={`risk-pill ${selected.risk.toLowerCase()}`}>{selected.risk} risk</span></div><div className="drawer-fields"><div><small>Contract ID</small><b>{selected.id}</b></div><div><small>Contract value</small><b>{selected.value}</b></div><div><small>Start date</small><b>{selected.start}</b></div><div><small>Expiry date</small><b>{selected.expiry}</b></div><div><small>Category</small><b>{selected.type}</b></div></div><div className="drawer-note"><Sparkles size={16}/><div><b>AI analysis not yet available</b><p>Connect the document processing backend in the next build to analyse clauses, obligations and risks for this contract.</p></div></div></aside></div>}
  </>;
}

function RiskView() {
  return <><PageHeading eyebrow="INTELLIGENCE / RISK" title="Risk intelligence" description="Identify contractual exposure and prioritise actions across your portfolio." action={<button className="button button-outline"><Filter size={15}/> Risk policies</button>}/><div className="metrics-grid"><MetricCard label="High-risk contracts" value="08" note="3 critical findings" icon={ShieldAlert} tone="red"/><MetricCard label="Open findings" value="27" note="Across 18 contracts" icon={AlertTriangle} tone="amber"/><MetricCard label="Reviewed findings" value="142" note="This quarter" icon={CheckCircle2} tone="green"/><MetricCard label="Risk exposure" value="₹1.24 Cr" note="Illustrative assessed value" icon={Gauge} tone="blue"/></div><section className="panel table-panel"><div className="panel-heading"><div><h3>Priority risk findings</h3><p>Sample findings for product demonstration</p></div><button className="button button-outline"><Filter size={14}/> Filter</button></div><div className="risk-finding-list">{[{title:"Unlimited liability exposure",desc:"No aggregate liability cap identified in the supplier agreement.",contract:"Managed Security Services · Sentinel Cyber",severity:"High",clause:"Clause 12.4"},{title:"Broad unilateral price adjustment",desc:"Supplier may revise charges without a defined annual cap.",contract:"Logistics & Distribution MSA · Apex Logistics",severity:"High",clause:"Clause 7.2"},{title:"Missing data deletion commitment",desc:"No explicit post-termination deletion timeline identified.",contract:"Enterprise Cloud Services · Nimbus Technologies",severity:"Medium",clause:"Data protection"},{title:"Automatic renewal notice period",desc:"Notice window may be missed if renewal is not reviewed in time.",contract:"Marketing Services SOW · Brightline Media",severity:"Medium",clause:"Clause 15.1"}].map(r=><div className="risk-finding" key={r.title}><div className={`finding-symbol ${r.severity==="High"?"red-soft":"amber-soft"}`}><AlertTriangle size={18}/></div><div className="finding-main"><b>{r.title}</b><p>{r.desc}</p><span>{r.contract}</span></div><div className="finding-meta"><span className={`risk-pill ${r.severity.toLowerCase()}`}>{r.severity}</span><small>{r.clause}</small></div></div>)}</div></section><div className="demo-disclaimer"><ShieldAlert size={14}/> Illustrative risk examples only. Production findings require clause-level evidence and human review.</div></>;
}

function ObligationsView() {
  return <><PageHeading eyebrow="INTELLIGENCE / OBLIGATIONS" title="Obligation management" description="Track commitments, critical dates and upcoming contractual actions." action={<button className="button button-primary"><Plus size={16}/> Add obligation</button>}/><div className="metrics-grid"><MetricCard label="Total obligations" value="384" note="Across active contracts" icon={FileCheck2} tone="violet"/><MetricCard label="Due in 30 days" value="14" note="Requires monitoring" icon={CalendarDays} tone="amber"/><MetricCard label="Overdue" value="03" note="Needs action" icon={AlertTriangle} tone="red"/><MetricCard label="Completed this month" value="42" note="Successfully closed" icon={CheckCircle2} tone="green"/></div><section className="panel"><div className="panel-heading"><div><h3>Upcoming contractual commitments</h3><p>Prioritised by due date</p></div><button className="select-button">Next 30 days <ChevronDown size={14}/></button></div><div className="obligation-list full-obligations">{obligations.map((o,i)=><div className="obligation-item" key={o.title}><div className={`date-tile date-${i%3}`}><b>{o.date.split(" ")[0]}</b><span>{o.date.split(" ")[1].slice(0,3).toUpperCase()}</span></div><div className="obligation-copy"><b>{o.title}</b><span>{o.contract} · Responsible party to be confirmed</span></div><span className={`due-label ${o.level.toLowerCase()}`}>{o.days}</span><button className="more-button"><MoreHorizontal size={18}/></button></div>)}</div></section><div className="demo-disclaimer"><CalendarDays size={14}/> Demo dates are illustrative. Event triggers and recurring schedules will be implemented with the backend.</div></>;
}

function CommercialView() {
  return <><PageHeading eyebrow="INTELLIGENCE / COMMERCIAL" title="Commercial intelligence" description="Understand contractual commitments, supplier pricing and potential value leakage." action={<button className="button button-outline"><CalendarDays size={15}/> Reporting period</button>}/><div className="metrics-grid"><MetricCard label="Contracted spend" value="₹8.42 Cr" note="Portfolio commitment" icon={Wallet} tone="blue"/><MetricCard label="Potential savings" value="₹28.5 L" note="AI opportunities · demo" icon={TrendingDown} tone="green"/><MetricCard label="Invoices analysed" value="1,284" note="Sample transaction volume" icon={FileCheck2} tone="violet"/><MetricCard label="Variances flagged" value="17" note="Require validation" icon={AlertTriangle} tone="amber"/></div><div className="dashboard-grid"><section className="panel"><div className="panel-heading"><div><h3>Committed vs actual spend</h3><p>Illustrative monthly values · ₹ Lakhs</p></div></div><div className="chart-wrap tall"><ResponsiveContainer width="100%" height="100%"><BarChart data={spendData} barGap={5}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF0F5"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize:11,fill:"#8992A5"}}/><YAxis axisLine={false} tickLine={false} tick={{fontSize:11,fill:"#8992A5"}}/><Tooltip/><Bar dataKey="committed" fill="#8B7CF6" radius={[4,4,0,0]}/><Bar dataKey="actual" fill="#36B69A" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div></section><section className="panel"><div className="panel-heading"><div><h3>Value opportunities</h3><p>Illustrative opportunity categories</p></div></div><div className="opportunity-list"><div><span className="opportunity-icon green-soft"><TrendingDown size={16}/></span><div><b>Pricing variance</b><small>7 potential cases</small></div><strong>₹12.4 L</strong></div><div><span className="opportunity-icon blue-soft"><FileCheck2 size={16}/></span><div><b>Missed SLA credits</b><small>4 potential cases</small></div><strong>₹8.1 L</strong></div><div><span className="opportunity-icon amber-soft"><Clock3 size={16}/></span><div><b>Renewal optimisation</b><small>3 potential cases</small></div><strong>₹8.0 L</strong></div></div></section></div><div className="demo-disclaimer"><Wallet size={14}/> No invoices or purchase orders are connected. Potential savings are illustrative and are not verified recoveries.</div></>;
}


type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: {
    page: number;
    text: string;
    similarity: number;
  }[];
};

function AssistantView({
  chatInput,
  setChatInput,
  documents,
  selectedDocumentId,
  setSelectedDocumentId
}: {
  chatInput: string;
  setChatInput: (v: string) => void;
  documents: IndexedDocument[];
  selectedDocumentId: string;
  setSelectedDocumentId: (v: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const prompts = [
    "What is the total contract value?",
    "Who are the contracting parties?",
    "What is the payment period?",
    "What are the termination conditions?",
    "What is the liability cap?",
    "What information is missing from this contract?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [messages, isThinking]);

  const selectedDocument = documents.find(
    doc => doc.document_id === selectedDocumentId
  );

  const send = async (value: string) => {
    const question = value.trim();

    if (!question || isThinking) return;

    if (documents.length > 0 && !selectedDocumentId) {
      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          content: "Please select a contract before asking a document-specific question."
        }
      ]);
      return;
    }

    setMessages(previous => [
      ...previous,
      { role: "user", content: question }
    ]);

    setChatInput("");
    setIsThinking(true);

    try {
      const url = selectedDocumentId
        ? `${API_URL}/api/documents/${selectedDocumentId}/ask`
        : `${API_URL}/api/chat`;

      const body = selectedDocumentId
        ? { question }
        : { message: question };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI request failed."
        );
      }

      setBackendOnline(true);

      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          content: data.answer || data.response,
          sources: data.sources || []
        }
      ]);

    } catch (error) {
      setBackendOnline(false);

      setMessages(previous => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Could not connect to ContractIQ AI."
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const statusText =
    backendOnline === null
      ? "Local AI · Llama 3.2"
      : backendOnline
        ? "Local AI · Connected"
        : "Local AI · Connection error";

  return (
    <>
      <PageHeading
        eyebrow="AI WORKSPACE / COPILOT"
        title="AI contract assistant"
        description="Ask questions and retrieve evidence from your uploaded agreements."
      />

      <div className="assistant-layout">
        <div className="assistant-main">

          <div className="assistant-welcome">
            <div className="assistant-orb">
              <Sparkles size={25}/>
            </div>

            <h2>Your contract intelligence copilot</h2>

            <p>
              Ask questions about your agreements and receive
              AI-generated answers with supporting evidence.
            </p>

            <span className="demo-tag">
              <Activity size={12}/>
              {statusText}
            </span>
          </div>

          <div className="document-selector panel">
            <label htmlFor="contract-select">
              SELECT CONTRACT
            </label>

            <select
              id="contract-select"
              value={selectedDocumentId}
              onChange={e => {
                setSelectedDocumentId(e.target.value);
                setMessages([]);
              }}
            >
              <option value="">
                {documents.length === 0
                  ? "No indexed contracts available"
                  : "Select a contract"}
              </option>

              {documents.map(doc => (
                <option
                  key={doc.document_id}
                  value={doc.document_id}
                >
                  {doc.filename}
                </option>
              ))}
            </select>

            {selectedDocument && (
              <small>
                {selectedDocument.pages_indexed} pages ·
                {selectedDocument.chunks_created} text chunks ·
                Indexed
              </small>
            )}
          </div>

          {messages.length > 0 && (
            <div className="chat-history">
              {messages.map((message, index) => (
                <div
                  className={
                    message.role === "user"
                      ? "user-message"
                      : "assistant-message"
                  }
                  key={index}
                >
                  <div className="message-label">
                    {message.role === "user"
                      ? "You"
                      : "ContractIQ AI · Llama 3.2"}
                  </div>

                  <div>{message.content}</div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="evidence-list">
                      <b>Supporting contract evidence</b>

                      {message.sources.map((source, sourceIndex) => (
                        <div
                          className="evidence-item"
                          key={sourceIndex}
                        >
                          <b>Page {source.page}</b>

                          <p>{source.text}</p>

                          <small>
                            Retrieval similarity: {source.similarity}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="assistant-message">
                  <div className="message-label">
                    ContractIQ AI · Llama 3.2
                  </div>
                  <div>Reviewing contract evidence...</div>
                </div>
              )}

              <div ref={chatEndRef}/>
            </div>
          )}

          <div className="prompt-grid">
            {prompts.map(prompt => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                disabled={isThinking || !selectedDocumentId}
              >
                {prompt}
                <ArrowUpRight size={14}/>
              </button>
            ))}
          </div>

          <form
            className="chat-composer"
            onSubmit={e => {
              e.preventDefault();
              send(chatInput);
            }}
          >
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask a question about the selected contract..."
              disabled={isThinking}
            />

            <button
              className="send-button"
              type="submit"
              disabled={isThinking || !selectedDocumentId}
            >
              <ArrowRight size={17}/>
            </button>
          </form>

          <div className="assistant-footnote">
            Answers are generated using your local Llama model
            and retrieved contract passages. Always verify
            important contractual interpretations against the original document.
          </div>
        </div>

        <aside className="assistant-side panel">
          <h3>Suggested topics</h3>

          <div className="topic-link">
            <ShieldAlert size={16}/>
            Risk exposure
            <ChevronRight size={15}/>
          </div>

          <div className="topic-link">
            <CalendarDays size={16}/>
            Renewal terms
            <ChevronRight size={15}/>
          </div>

          <div className="topic-link">
            <Wallet size={16}/>
            Commercial terms
            <ChevronRight size={15}/>
          </div>

          <div className="topic-link">
            <FileSearch size={16}/>
            Clause search
            <ChevronRight size={15}/>
          </div>

          <div className="assistant-note">
            <Sparkles size={16}/>
            <b>Evidence-backed answers</b>
            <p>
              ContractIQ retrieves relevant passages from
              the selected agreement and shows supporting page references.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function AnalysisView({onUpload,uploaded}:any) {
  return <><PageHeading eyebrow="WORKSPACE / AI ANALYSIS" title="AI contract analysis" description="Extract structured terms, clauses and obligations from agreements." action={<button className="button button-primary" onClick={onUpload}><Upload size={15}/> Upload document</button>}/><div className="analysis-intro"><div className="analysis-illustration"><FileSearch size={32}/><Sparkles size={17}/></div><div><h2>Turn contracts into structured intelligence</h2><p>Upload a contract to begin the document understanding workflow. The next milestone connects OCR, extraction, validation and evidence mapping.</p></div></div><div className="analysis-steps">{[{n:"01",t:"Document understanding",d:"Classify the agreement and identify parties, dates and sections.",i:FileText},{n:"02",t:"Clause extraction",d:"Identify and structure payment, liability, termination and other clauses.",i:FileSearch},{n:"03",t:"Risk & obligation analysis",d:"Evaluate terms against policies and identify actionable commitments.",i:ShieldAlert},{n:"04",t:"Evidence-backed results",d:"Review findings with page, clause and source-text references.",i:CheckCircle2}].map(s=><div className="analysis-step" key={s.n}><span>{s.n}</span><div className="step-icon"><s.i size={19}/></div><div><b>{s.t}</b><p>{s.d}</p></div></div>)}</div>{uploaded.length>0 && <section className="panel uploaded-panel"><h3>Contracts stored in your backend</h3>{uploaded.map((f:string)=><div className="uploaded-file" key={f}><FileText size={17}/>{f}<span>Indexed in PostgreSQL</span></div>)}</section>}</>;
}

function ComparisonView() {
  return <><PageHeading eyebrow="INTELLIGENCE / COMPARISON" title="Contract comparison" description="Compare contract versions and identify commercial or legal deviations."/><div className="comparison-empty panel"><div className="empty-graphic"><FileCheck2 size={30}/></div><h2>Compare agreements side by side</h2><p>Select two contracts or versions to review clause changes, pricing differences, new obligations and risk movement.</p><div className="comparison-selectors"><button><FileText size={16}/> Select first contract <ChevronDown size={14}/></button><button><FileText size={16}/> Select second contract <ChevronDown size={14}/></button></div><button className="button button-primary" disabled>Compare documents <ArrowRight size={15}/></button><small>Comparison engine will be connected in a later milestone.</small></div></>;
}

function DraftingView() {
  return <><PageHeading eyebrow="AI WORKSPACE / DRAFTING" title="Contract drafting" description="Prepare clause alternatives, negotiation notes and amendment drafts."/><div className="draft-grid">{[{icon:FileText,title:"Draft a clause",desc:"Generate a first-pass clause using your organisation's drafting preferences."},{icon:MessageSquareText,title:"Negotiation points",desc:"Prepare structured negotiation positions from identified contract deviations."},{icon:FileCheck2,title:"Amendment summary",desc:"Summarise proposed changes between contract versions."}].map(x=><div className="panel draft-card" key={x.title}><div className="draft-icon"><x.icon size={20}/></div><h3>{x.title}</h3><p>{x.desc}</p><button className="text-button">Explore workflow <ArrowRight size={14}/></button></div>)}</div><div className="demo-disclaimer"><ShieldAlert size={14}/> Generated language will be draft-only and require qualified legal review.</div></>;
}

function SettingsView() {
  return <><PageHeading eyebrow="WORKSPACE / ADMINISTRATION" title="Workspace settings" description="Manage organisation preferences, access and review policies."/><div className="settings-grid">{[{t:"Organisation profile",d:"Company details, workspace identity and defaults",i:BriefcaseBusiness},{t:"Users & permissions",d:"Roles, access levels and team membership",i:Activity},{t:"Risk policies",d:"Configure clause rules and review thresholds",i:ShieldAlert},{t:"Notifications",d:"Renewal alerts and obligation reminders",i:Bell},{t:"AI configuration",d:"Model settings, retention and review controls",i:Bot},{t:"Audit & security",d:"Access logs, data controls and security settings",i:Settings}].map(x=><div className="panel setting-card" key={x.t}><div className="setting-icon"><x.i size={19}/></div><div><b>{x.t}</b><p>{x.d}</p></div><ChevronRight size={17}/></div>)}</div></>;
}
