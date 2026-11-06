"use client";
import ClauseExplorer from "./ClauseExplorer";
import TermsIndex from "./TermsIndex";

import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudUpload,
  FileCheck2,
  FileSearch,
  FileText,
  FileArchive,
  Files,
  Server,
  Filter,
  FolderOpen,
  Gauge,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Upload,
  Wallet,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from "recharts";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type IndexedDocument = {
  document_id: string;
  filename: string;
  original_filename?: string;
  pages_indexed: number;
  chunks_created: number;
  status: string;
};

type Section =
  | "Overview"
  | "System Health"
  | "Contracts"
  | "Contract Analysis"
  | "Clause & Condition Review"
  | "Contract Risk Assessment"
  | "Contractual Obligations"
  | "Contract Terms Index"
  | "Compare Contracts"
  | "Financial & Commercial Terms"
  | "Ask Your Contract Assistant"
  | "Contract Drafting"
  | "Settings"
  | "Monitor";

type ChatSource = {
  page: number;
  text: string;
  similarity: number;
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
};
const initialContracts = [
  {
    id: "CTR-2026-001",
    name: "Enterprise Cloud Services Agreement",
    vendor: "Nimbus Technologies",
    type: "Technology",
    value: "₹48,00,000",
    start: "12 Jan 2026",
    expiry: "11 Jan 2027",
    status: "Active",
    risk: "Medium",
    initials: "NT",
    color: "blue",
  },
  {
    id: "CTR-2026-002",
    name: "Logistics & Distribution MSA",
    vendor: "Apex Logistics Pvt Ltd",
    type: "Logistics",
    value: "₹32,50,000",
    start: "01 Mar 2026",
    expiry: "28 Feb 2027",
    status: "Active",
    risk: "High",
    initials: "AL",
    color: "orange",
  },
  {
    id: "CTR-2026-003",
    name: "Managed Security Services",
    vendor: "Sentinel Cyber",
    type: "Technology",
    value: "₹18,00,000",
    start: "15 Feb 2026",
    expiry: "14 Feb 2027",
    status: "Under Review",
    risk: "High",
    initials: "SC",
    color: "purple",
  },
  {
    id: "CTR-2026-004",
    name: "Office Facilities Agreement",
    vendor: "UrbanWorks Services",
    type: "Facilities",
    value: "₹12,00,000",
    start: "01 Apr 2026",
    expiry: "31 Mar 2027",
    status: "Active",
    risk: "Low",
    initials: "UW",
    color: "green",
  },
  {
    id: "CTR-2026-005",
    name: "Raw Materials Supply Contract",
    vendor: "Vertex Industrial",
    type: "Procurement",
    value: "₹76,00,000",
    start: "20 May 2026",
    expiry: "19 May 2027",
    status: "Active",
    risk: "Medium",
    initials: "VI",
    color: "teal",
  },
  {
    id: "CTR-2026-006",
    name: "Marketing Services SOW",
    vendor: "Brightline Media",
    type: "Marketing",
    value: "₹9,60,000",
    start: "01 Jun 2026",
    expiry: "30 Nov 2026",
    status: "Expiring Soon",
    risk: "Low",
    initials: "BM",
    color: "pink",
  },
];

const spendData = [
  { month: "May", committed: 22, actual: 18 },
  { month: "Jun", committed: 26, actual: 23 },
  { month: "Jul", committed: 24, actual: 21 },
  { month: "Aug", committed: 31, actual: 28 },
  { month: "Sep", committed: 29, actual: 26 },
  { month: "Oct", committed: 36, actual: 30 },
  { month: "Nov", committed: 33, actual: 27 },
  { month: "Dec", committed: 39, actual: 32 },
];
const obligations = [
  {
    title: "Renewal notice — Brightline Media",
    contract: "CTR-2026-006",
    date: "05 Nov 2026",
    days: "6 days",
    level: "Urgent",
  },
  {
    title: "Quarterly SLA performance review",
    contract: "CTR-2026-002",
    date: "09 Nov 2026",
    days: "10 days",
    level: "Upcoming",
  },
  {
    title: "Insurance certificate submission",
    contract: "CTR-2026-003",
    date: "15 Nov 2026",
    days: "16 days",
    level: "Upcoming",
  },
  {
    title: "Annual pricing review",
    contract: "CTR-2026-005",
    date: "20 Nov 2026",
    days: "21 days",
    level: "Normal",
  },
];

const navLabelMap: Partial<Record<Section, string>> = {
  Overview: "Dashboard",
  "Clause & Condition Review": "Review Contract Terms",
  "Contract Analysis": "Understand Your Contract",
  "Contract Risk Assessment": "Find Contract Risks",
  "Contractual Obligations": "Party Obligations",
  "Contract Terms Index": "Contract Terms",
  "Compare Contracts": "Compare Documents",
  "Financial & Commercial Terms": "Payments & Commercial Terms",
  "Ask Your Contract Assistant": "Ask About This Contract",
  "Contract Drafting": "Create a Contract",
};

const navGroups = [
  {
    label: "SYSTEM",
    items: [{ name: "Monitor" as Section, icon: ShieldAlert }],
  },
  {
    label: "TOOLS",
    items: [
      { name: "Overview" as Section, icon: LayoutDashboard },
      { name: "Clause & Condition Review" as Section, icon: FileSearch },
      { name: "Contracts" as Section, icon: FolderOpen },
      { name: "Contract Analysis" as Section, icon: FileSearch },
    ],
  },
  {
    label: "CONTRACT INSIGHTS",
    items: [
      { name: "Contract Risk Assessment" as Section, icon: ShieldAlert },
      { name: "Contractual Obligations" as Section, icon: CalendarDays },
      { name: "Contract Terms Index" as Section, icon: FileSearch },
      { name: "Compare Contracts" as Section, icon: FileCheck2 },
      { name: "Financial & Commercial Terms" as Section, icon: Wallet },
    ],
  },
  {
    label: "Heron IDP Assistant",
    items: [
      { name: "Ask Your Contract Assistant" as Section, icon: Bot },
      { name: "Contract Drafting" as Section, icon: FileText },
    ],
  },
];

type MetricCardProps = {
  label: string;
  value: string | number;
  note: string;
  icon: LucideIcon;
  tone: string;
  trend?: "up" | "down";
  onClick?: () => void;
};

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
  trend,
  onClick,
}: MetricCardProps) {
  const firstSpace = note.indexOf(" ");
  const trendText = firstSpace === -1 ? note : note.slice(0, firstSpace);
  const restText = firstSpace === -1 ? "" : note.slice(firstSpace + 1);
  return (
    <div
      className={`metric-card${onClick ? " metric-card-clickable" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={onClick ? `Open ${label}` : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      style={onClick ? { cursor: "pointer" } : undefined}
    >
      <div className="metric-top">
        <span>{label}</span>
        <div className={`metric-icon ${tone}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-note">
        {trend && (
          <span className={trend === "up" ? "trend-up" : "trend-down"}>
            {trend === "up" ? (
              <ArrowUpRight size={13} />
            ) : (
              <ArrowDownRight size={13} />
            )}{" "}
            {trendText}
          </span>
        )}
        <span>{trend ? restText : note}</span>
      </div>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState<Section>("Overview");
  const [previousActive, setPreviousActive] = useState<Section>("Overview");
  const [signedOut, setSignedOut] = useState(false);
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
  const [deletingDocumentId, setDeletingDocumentId] = useState("");
  const [deleteNotice, setDeleteNotice] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const zipRef = useRef<HTMLInputElement>(null);
  const [uploadMode, setUploadMode] = useState<
    "single" | "bulk" | "zip" | "sftp"
  >("single");
  const [sftpHost, setSftpHost] = useState("");
  const [sftpPort, setSftpPort] = useState("22");
  const [sftpUsername, setSftpUsername] = useState("");
  const [sftpPassword, setSftpPassword] = useState("");
  const [sftpPath, setSftpPath] = useState("");

  const handleDeleteDocument = async (doc: IndexedDocument) => {
    const displayName = doc.original_filename || doc.filename;
    const confirmed = window.confirm(
      `Permanently delete "${displayName}"?\n\nThis removes the PDF and its indexed contract data. This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingDocumentId(doc.document_id);
    setDeleteNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${encodeURIComponent(doc.document_id)}`,
        { method: "DELETE" },
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || "Could not delete this contract.");
      }

      setDocuments((current) =>
        current.filter((item) => item.document_id !== doc.document_id),
      );
      setSelectedDocumentId((current) =>
        current === doc.document_id ? "" : current,
      );
      setDeleteNotice(
        data.warning
          ? `Contract deleted, but file cleanup needs attention: ${data.warning}`
          : `"${displayName}" was deleted successfully.`,
      );
    } catch (error) {
      setDeleteNotice(
        error instanceof Error ? error.message : "Contract deletion failed.",
      );
    } finally {
      setDeletingDocumentId("");
    }
  };

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
        const loaded: IndexedDocument[] = (data.documents || []).map(
          (doc: any) => ({
            document_id: doc.document_id,
            filename: doc.original_filename || doc.filename,
            original_filename: doc.original_filename || doc.filename,
            pages_indexed: doc.pages_indexed ?? doc.pages ?? 0,
            chunks_created: doc.chunks_created ?? doc.chunks ?? 0,
            status: doc.status || "indexed",
          }),
        );
        // Display every document returned by the backend.
        // Preserve separate database records even when filenames match.
        const visibleDocuments = loaded;

        setDocuments(visibleDocuments);
        setSelectedDocumentId((current) =>
          current && visibleDocuments.some((doc) => doc.document_id === current)
            ? current
            : visibleDocuments.find(
                (doc) =>
                  doc.document_id === "b3ee654c-51d6-4655-9fbf-cd24f3c188dc",
              )?.document_id ||
              visibleDocuments[0]?.document_id ||
              "",
        );
      } catch (error) {
        console.error("Unable to load backend documents:", error);
        setUploadError(
          error instanceof Error
            ? error.message
            : "Could not connect to the document backend.",
        );
      } finally {
        setDocumentsLoading(false);
      }
    };
    loadDocuments();
  }, []);

  const filteredContracts = useMemo(
    () =>
      contracts.filter(
        (c) =>
          (c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.vendor.toLowerCase().includes(query.toLowerCase()) ||
            c.id.toLowerCase().includes(query.toLowerCase())) &&
          (filter === "All" || c.status === filter || c.risk === filter),
      ),
    [contracts, query, filter],
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError("");

    const selectedFiles = Array.from(files);

    try {
      for (const file of selectedFiles) {
        if (!file.name.toLowerCase().endsWith(".pdf")) {
          throw new Error(
            `${file.name}: Only PDF files are currently supported.`,
          );
        }

        if (file.size > 20 * 1024 * 1024) {
          throw new Error(`${file.name}: Maximum upload size is 20 MB.`);
        }

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${API_URL}/api/documents/upload`, {
          method: "POST",
          body: formData,
        });

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
          status: "indexed",
        };

        setDocuments((previous) => [
          newDocument,
          ...previous.filter(
            (doc) => doc.document_id !== newDocument.document_id,
          ),
        ]);

        // Automatically select the newly uploaded contract.
        setSelectedDocumentId(data.document_id);
      }

      setShowUpload(false);
      setActive("Contracts");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload document.",
      );
    } finally {
      setUploading(false);
    }
  };

  async function handleZipUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/documents/upload-zip`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "ZIP upload failed.");

      const added = (data.results || [])
        .filter((item: any) => item.success)
        .map((item: any): IndexedDocument => ({
          document_id: item.document_id,
          filename: item.original_filename || item.filename,
          original_filename: item.original_filename || item.filename,
          pages_indexed: item.pages_indexed,
          chunks_created: item.chunks_created,
          status: "indexed",
        }));

      setDocuments((previous) => [
        ...added,
        ...previous.filter(
          (old) =>
            !added.some(
              (item: IndexedDocument) => item.document_id === old.document_id,
            ),
        ),
      ]);

      if (added.length) setSelectedDocumentId(added[0].document_id);

      if (data.failed_count > 0) {
        setUploadError(
          `${data.indexed_count} PDFs indexed; ${data.failed_count} failed. Check the import results.`,
        );
      } else {
        setShowUpload(false);
        setActive("Contracts");
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "ZIP upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function handleSftpImport(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setUploadError("");

    try {
      const response = await fetch(`${API_URL}/api/documents/import-sftp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host: sftpHost,
          port: Number(sftpPort) || 22,
          username: sftpUsername,
          password: sftpPassword,
          remote_path: sftpPath,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "SFTP import failed.");

      const added = (data.results || [])
        .filter((item: any) => item.success)
        .map((item: any): IndexedDocument => ({
          document_id: item.document_id,
          filename: item.original_filename || item.filename,
          original_filename: item.original_filename || item.filename,
          pages_indexed: item.pages_indexed,
          chunks_created: item.chunks_created,
          status: "indexed",
        }));

      setDocuments((previous) => [...added, ...previous]);
      setSftpPassword("");

      if (added.length) setSelectedDocumentId(added[0].document_id);

      if (data.failed_count > 0) {
        setUploadError(
          `${data.indexed_count} PDFs indexed; ${data.failed_count} failed.`,
        );
      } else {
        setShowUpload(false);
        setActive("Contracts");
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "SFTP import failed.",
      );
    } finally {
      setUploading(false);
      setSftpPassword("");
    }
  }

  const runGlobalSearch = () => {
    setQuery(globalQuery.trim());
    setActive("Contracts");
  };

  const titleMap: Record<Section, string> = {
    Overview: "Contract Insights & Overview",
    "System Health": "System Health",
    Contracts: "Contract Repository",
    "Contract Analysis": "Understand Your Contract",
    "Clause & Condition Review": "Review Contract Terms",
    "Contract Risk Assessment": "Identify Contract Risks",
    "Contractual Obligations": "Responsibilities & Commitments",
    "Contract Terms Index": "Contract Terms Index",
    "Compare Contracts": "Compare Contracts",
    "Financial & Commercial Terms": "Payments & Commercial Details",
    "Ask Your Contract Assistant": "Ask Questions About Your Contract",
    "Contract Drafting": "Contract Drafting",
    Settings: "Workspace Settings",
    Monitor: "System Monitor",
  };

  const navigateTo = (section: Section) => {
    if (section !== active) setPreviousActive(active);
    setActive(section);
    setProfileMenuOpen(false);
    setMobileOpen(false);
  };

  const goBack = () => {
    const destination = previousActive === active ? "Overview" : previousActive;
    setPreviousActive(active);
    setActive(destination);
    setProfileMenuOpen(false);
  };

  return (
    <div className={`app-shell ${inter.className}`}>
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <button
            type="button"
            className="brand-home"
            onClick={() => navigateTo("Overview")}
            title="Go to Dashboard"
          >
            <div className="brand-text">
              <div className="brand-name">HeronIDP Contract Management</div>
              <div className="brand-caption">POWERED BY HERONIDP</div>
            </div>
          </button>

          <button
            className="mobile-close icon-button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="workspace-switch">
          <div className="workspace-avatar">A</div>
          <div className="workspace-copy">
            <b>ContractIQ Portal</b>
            <small>Organization Portal</small>
          </div>
        </div>
        <nav className="navigation">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.label}>
              <div className="nav-label">{group.label}</div>

              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.name}
                    onClick={() => navigateTo(item.name)}
                    className={`nav-item ${active === item.name ? "active" : ""}`}
                  >
                    <Icon size={17} />
                    <span>{navLabelMap[item.name] ?? item.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon">
              <CircleHelp size={17} />
            </div>
            <b>Need Help?</b>
            <p>Support Resources</p>
            <button onClick={() => setActive("Ask Your Contract Assistant")}>
              Help Centre <ArrowRight size={11} />
            </button>
          </div>
          <button
            className={`nav-item ${active === "Settings" ? "active" : ""}`}
            onClick={() => navigateTo("Settings")}
          >
            <Settings size={12} />
            <span>Preferences </span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">A</div>
            <div className="profile-copy">
              <b>Amit</b>
              <small>Admin</small>
            </div>
            <MoreHorizontal size={11} />
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="breadcrumb">
            Workspace <ChevronRight size={14} /> <b>{titleMap[active]}</b>
          </div>
          <div className="top-actions">
            <div className="global-search">
              <Search size={15} />
              <input
                placeholder="Search contracts... (press Enter)"
                value={globalQuery}
                onChange={(e) => setGlobalQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") runGlobalSearch();
                }}
              />
              <kbd>⌘ K</kbd>
            </div>
            <SystemStatus />
            <GPUStatus />
            <button className="icon-button notification">
              <Bell size={18} />
              <i />
            </button>
            <div className="profile-menu-wrap">
              <button
                type="button"
                className="top-avatar"
                aria-label="Open Amit's account menu"
                aria-haspopup="menu"
                aria-expanded={profileMenuOpen}
                onClick={() => setProfileMenuOpen((open) => !open)}
              >
                A
              </button>
              {profileMenuOpen && (
                <div className="profile-dropdown" role="menu">
                  <div className="profile-menu-heading">
                    <strong>Amit</strong>
                    <span>Workspace admin</span>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => navigateTo("Settings")}
                  >
                    <Settings size={16} /> Account settings
                  </button>
                  <button type="button" role="menuitem" onClick={goBack}>
                    <ChevronLeft size={16} /> Go back to previous page
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="signout-action"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setSignedOut(true);
                      setQuery("");
                      setGlobalQuery("");
                      setFilter("All");
                    }}
                  >
                    <ArrowRight size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {signedOut ? (
          <div className="signed-out-screen">
            <div className="signed-out-card">
              <div className="signed-out-mark">
                <Sparkles size={25} />
              </div>
              <h1>You’re signed out</h1>
              <p>
                This prototype does not yet have server-side account
                authentication. Your saved contracts and analysis remain in the
                workspace.
              </p>
              <button
                type="button"
                className="signed-out-return"
                onClick={() => {
                  setSignedOut(false);
                  setActive("Overview");
                }}
              >
                Return to workspace <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="content">
            {active !== "Overview" && (
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  setActive("Overview");
                  setProfileMenuOpen(false);
                }}
                style={{
                  marginBottom: 16,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <ChevronLeft size={16} /> Back to Dashboard
              </button>
            )}
            {active === "Overview" && (
              <Overview
                onUpload={() => setShowUpload(true)}
                setActive={setActive}
                documents={documents}
              />
            )}
            {active === "Contracts" && (
              <ContractsView
                contracts={filteredContracts}
                query={query}
                setQuery={setQuery}
                filter={filter}
                setFilter={setFilter}
                onUpload={() => setShowUpload(true)}
                documents={documents}
                documentsLoading={documentsLoading}
                onDeleteContract={handleDeleteDocument}
                deletingDocumentId={deletingDocumentId}
                deleteNotice={deleteNotice}
                onOpenContract={(id: string) => {
                  setSelectedDocumentId(id);
                  setActive("Contract Analysis");
                }}
              />
            )}
            {active === "Contract Risk Assessment" && (
              <RiskView
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                setSelectedDocumentId={setSelectedDocumentId}
              />
            )}
            {active === "Contract Terms Index" && (
              <TermsIndex
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                setSelectedDocumentId={setSelectedDocumentId}
              />
            )}{" "}
            {active === "Contractual Obligations" && (
              <ObligationsView
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                setSelectedDocumentId={setSelectedDocumentId}
              />
            )}
            {active === "Financial & Commercial Terms" && (
              <CommercialView
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                setSelectedDocumentId={setSelectedDocumentId}
              />
            )}
            {active === "Ask Your Contract Assistant" && (
              <AssistantView
                chatInput={chatInput}
                setChatInput={setChatInput}
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                setSelectedDocumentId={setSelectedDocumentId}
              />
            )}
            {active === "Contract Analysis" && (
              <AnalysisView
                onUpload={() => setShowUpload(true)}
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                setSelectedDocumentId={setSelectedDocumentId}
                setActive={setActive}
              />
            )}
            {active === "Clause & Condition Review" && (
              <ClauseExplorer
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                setSelectedDocumentId={setSelectedDocumentId}
              />
            )}
            {active === "Compare Contracts" && (
              <ComparisonView documents={documents} />
            )}
            {active === "Contract Drafting" && (
              <DraftingView
                documents={documents}
                selectedDocumentId={selectedDocumentId}
                setSelectedDocumentId={setSelectedDocumentId}
                setActive={setActive}
                onExit={goBack}
              />
            )}
            {active === "Monitor" && (
              <MonitorView
                onNavigate={navigateTo}
                onUpload={() => setShowUpload(true)}
              />
            )}
            {active === "Settings" && <SettingsView />}
          </div>
        )}
        <footer className="footer">
          <span>© 2026 HeronIDP ContractIQ</span>
          <span>
            <i className="status-dot" /> All systems operational{" "}
            <span className="footer-divider">·</span> v0.1.0
          </span>
        </footer>
      </main>

      {showUpload && (
        <div
          className="modal-backdrop"
          onClick={() => !uploading && setShowUpload(false)}
        >
          <div
            className="upload-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2 id="upload-modal-title">Upload contracts</h2>
                <p>Choose how you want to add contracts</p>
              </div>
              <button
                className="icon-button"
                type="button"
                disabled={uploading}
                onClick={() => setShowUpload(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2,minmax(0,1fr))",
                gap: 9,
                margin: "16px 0",
              }}
            >
              {(
                [
                  ["single", FileText, "Normal upload", "One PDF"],
                  ["zip", FileArchive, "ZIP upload", "Extract PDFs from ZIP"],
                  ["bulk", Files, "Bulk upload", "Multiple PDFs"],
                  ["sftp", Server, "SFTP upload", "Import from SFTP server"],
                ] as const
              ).map(([mode, Icon, label, sub]) => (
                <button
                  key={mode}
                  type="button"
                  disabled={uploading}
                  onClick={() => {
                    setUploadMode(mode);
                    setUploadError("");
                  }}
                  style={{
                    padding: 13,
                    borderRadius: 11,
                    textAlign: "left",
                    cursor: "pointer",
                    border:
                      uploadMode === mode
                        ? "2px solid #149F8D"
                        : "1px solid #DCE3EF",
                    background: uploadMode === mode ? "#ECFDF8" : "#FFFFFF",
                    color: "#1E293B",
                  }}
                >
                  <span style={{ display: "block", marginBottom: 5 }}>
                    <Icon size={22} strokeWidth={1.8} />
                  </span>
                  <b style={{ fontSize: 13, display: "block" }}>{label}</b>
                  <small style={{ color: "#64748B" }}>{sub}</small>
                </button>
              ))}
            </div>

            {(uploadMode === "single" || uploadMode === "bulk") && (
              <>
                <div
                  className="dropzone"
                  onClick={() => fileRef.current?.click()}
                >
                  <div className="upload-symbol">
                    <CloudUpload size={25} />
                  </div>
                  <b>
                    {uploadMode === "single"
                      ? "Choose one PDF contract"
                      : "Choose multiple PDF contracts"}
                  </b>
                  <span>
                    {uploadMode === "single"
                      ? "One PDF ? Maximum 20 MB"
                      : "Multiple PDFs ? Maximum 20 MB each"}
                  </span>
                  <button
                    type="button"
                    className="button button-primary"
                    disabled={uploading}
                    onClick={(e) => {
                      e.stopPropagation();
                      fileRef.current?.click();
                    }}
                  >
                    <Upload size={15} />{" "}
                    {uploading ? "Uploading and indexing..." : "Choose files"}
                  </button>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  multiple={uploadMode === "bulk"}
                  accept=".pdf,application/pdf"
                  hidden
                  onChange={(e) => {
                    handleFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </>
            )}

            {uploadMode === "zip" && (
              <div className="dropzone" onClick={() => zipRef.current?.click()}>
                <div className="upload-symbol">
                  <FileArchive size={25} />
                </div>
                <b>Upload a ZIP archive</b>
                <span>
                  Up to 50 PDFs ? 50 MB compressed archive ? 20 MB per PDF
                </span>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={uploading}
                  onClick={(e) => {
                    e.stopPropagation();
                    zipRef.current?.click();
                  }}
                >
                  {uploading ? "Extracting and indexing..." : "Choose ZIP file"}
                </button>
                <input
                  ref={zipRef}
                  type="file"
                  accept=".zip,application/zip"
                  hidden
                  onChange={(e) => {
                    handleZipUpload(e.target.files?.[0] || null);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {uploadMode === "sftp" && (
              <form
                onSubmit={handleSftpImport}
                style={{ display: "grid", gap: 11 }}
              >
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                  Connect to a trusted SFTP server and import PDFs from a remote
                  directory.
                </p>
                <input
                  required
                  value={sftpHost}
                  onChange={(e) => setSftpHost(e.target.value)}
                  placeholder="SFTP hostname"
                />
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 2fr",
                    gap: 9,
                  }}
                >
                  <input
                    required
                    type="number"
                    min="1"
                    max="65535"
                    value={sftpPort}
                    onChange={(e) => setSftpPort(e.target.value)}
                    placeholder="Port"
                  />
                  <input
                    required
                    value={sftpUsername}
                    onChange={(e) => setSftpUsername(e.target.value)}
                    placeholder="Username"
                  />
                </div>
                <input
                  required
                  type="password"
                  autoComplete="off"
                  value={sftpPassword}
                  onChange={(e) => setSftpPassword(e.target.value)}
                  placeholder="Password"
                />
                <input
                  required
                  value={sftpPath}
                  onChange={(e) => setSftpPath(e.target.value)}
                  placeholder="Remote directory, e.g. /contracts/incoming"
                />
                <small style={{ color: "#64748B", lineHeight: 1.5 }}>
                  Security: the server host key must already be trusted in the
                  backend machine's SSH known_hosts file. Credentials are sent
                  for this request only and are not stored by this application.
                </small>
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={uploading}
                >
                  {uploading
                    ? "Connecting and importing..."
                    : "Connect and import PDFs"}
                </button>
              </form>
            )}

            {uploadError && (
              <div
                className="modal-footnote"
                role="alert"
                style={{ color: "#B42318" }}
              >
                <ShieldAlert size={14} /> {uploadError}
              </div>
            )}
            <div className="modal-footnote">
              <CheckCircle2 size={14} /> Files are indexed in the local
              PostgreSQL contract repository.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

function MonitorView({
  onNavigate,
  onUpload,
}: {
  onNavigate: (page: Section) => void;
  onUpload: () => void;
}) {
  const tabs = [
    "System Health",
    "Document Processing",
    "Data Services",
    "Processing Workflow",
  ];

  const [tab, setTab] = useState("System Health");
  const [selectedStage, setSelectedStage] = useState("upload");
  const [health, setHealth] = useState<any>(null);
  const [gpu, setGpu] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const [h, g] = await Promise.all([
        fetch(`${API_URL}/api/health`),
        fetch(`${API_URL}/api/gpu-status`),
      ]);

      if (!h.ok) throw new Error("Backend health endpoint unavailable.");
      const healthData = await h.json();
      const gpuData = g.ok ? await g.json() : null;

      setHealth(healthData);
      setGpu(gpuData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Monitoring refresh failed.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const online = health?.api === "ok" && health?.database === "connected";
  const card = {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: 13,
    padding: 19,
    boxShadow: "0 4px 14px rgba(15,23,42,.04)",
  } as React.CSSProperties;

  const status = (ok: boolean) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11,
        fontWeight: 700,
        padding: "5px 9px",
        borderRadius: 20,
        color: ok ? "#15803D" : "#B45309",
        background: ok ? "#DCFCE7" : "#FEF3C7",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: ok ? "#16A34A" : "#D97706",
        }}
      />
      {ok ? "Online" : "Check status"}
    </span>
  );

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: "#64748B",
            }}
          >
            SYSTEM MONITOR / DEMO
          </div>
          <h1 style={{ fontSize: 30, margin: "7px 0" }}>Platform Health</h1>
          <p style={{ color: "#64748B", margin: 0, fontSize: 13 }}>
            Monitor ContractIQ AI services and document processing
            infrastructure.
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {status(online)}
          <button
            className="button button-outline"
            onClick={refresh}
            disabled={loading}
          >
            ? {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 5,
          borderBottom: "1px solid #E2E8F0",
          overflowX: "auto",
        }}
      >
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            style={{
              padding: "12px 15px",
              border: 0,
              whiteSpace: "nowrap",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 700,
              color: tab === item ? "#137C70" : "#64748B",
              background: tab === item ? "#E8F5F2" : "transparent",
              borderBottom:
                tab === item ? "3px solid #159989" : "3px solid transparent",
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" style={{ ...card, color: "#B42318" }}>
          {error}
        </div>
      )}

      {tab === "System Health" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
              gap: 12,
            }}
          >
            {(
              [
                [
                  "Backend API",
                  health?.api === "ok" ? "Online" : "Unknown",
                  () => {
                    void refresh();
                  },
                ],
                [
                  "Database Connection",
                  health?.database || "Unknown",
                  () => setTab("Data Services"),
                ],
                [
                  "HeronIDP Engine",
                  health?.ollama || "Unknown",
                  () => setTab("Data Services"),
                ],
                [
                  "INDEXED DOCUMENTS",
                  String(health?.indexed_documents ?? "?"),
                  () => setTab("Document Processing"),
                ],
                [
                  "Contract Understanding Model",
                  health?.chat_model_installed ? "Available" : "Check",
                  () => setTab("Data Services"),
                ],
                [
                  "Embedding Service",
                  health?.embedding_model_installed ? "Available" : "Check",
                  () => setTab("Data Services"),
                ],
              ] as Array<[string, string, () => void]>
            ).map(([label, value, action]) => (
              <button
                key={label}
                type="button"
                onClick={action}
                aria-label={`${label}: ${value}. Open related monitoring details.`}
                className="monitor-stat-card"
                style={{
                  ...card,
                  minHeight: 91,
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "#1E293B",
                  transition:
                    "transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: "#64748B",
                    letterSpacing: 1,
                  }}
                >
                  {label}
                </div>
                <div style={{ fontSize: 21, fontWeight: 800, marginTop: 13 }}>
                  {value}
                </div>
                <div style={{ fontSize: 10, color: "#64748B", marginTop: 7 }}>
                  Click to view details ?
                </div>
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 14,
            }}
          >
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#64748B" }}>
                Database Infrastructure
              </div>
              <h3
                style={{
                  fontFamily: "Georgia,serif",
                  fontSize: 22,
                  margin: "8px 0 15px",
                }}
              >
                PostgreSQL + pgvector
              </h3>
              {status(health?.database === "connected")}
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 14 }}>
                Contract records, terms, reviews and vector embeddings.
              </p>
            </div>
            <div style={card}>
              <div style={{ fontSize: 10, fontWeight: 800, color: "#64748B" }}>
                Heron Model Server
              </div>
              <h3
                style={{
                  fontFamily: "Georgia,serif",
                  fontSize: 22,
                  margin: "8px 0 15px",
                }}
              >
                Ollama
              </h3>
              {status(health?.ollama === "connected")}
              <p style={{ fontSize: 12, color: "#64748B", marginTop: 14 }}>
                Chat: {health?.chat_model || "Not reported"}
              </p>
              <p style={{ fontSize: 12, color: "#64748B" }}>
                Embeddings: {health?.embedding_model || "Not reported"}
              </p>
              <p style={{ fontSize: 12, color: "#64748B" }}>
                Heron Model Ready:{" "}
                {gpu?.model_loaded == null
                  ? "Not reported"
                  : gpu.model_loaded
                    ? "Yes"
                    : "Idle"}
              </p>
            </div>
          </div>
        </>
      )}

      {tab === "Document Processing" && (
        <div style={{ display: "grid", gap: 16 }}>
          <section style={card}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2 style={{ fontFamily: "Georgia,serif", margin: "0 0 7px" }}>
                  Document Intake & Processing
                </h2>
                <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>
                  Explore{" "}
                </p>
              </div>
              <button className="button button-primary" onClick={onUpload}>
                Document Upload
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("Contracts")}
              style={{
                marginTop: 20,
                padding: 15,
                width: "100%",
                textAlign: "left",
                border: "1px solid #DCE5EF",
                borderRadius: 12,
                background: "#F8FAFC",
                cursor: "pointer",
                color: "#1E293B",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                  color: "#64748B",
                }}
              >
                INDEXED DOCUMENTS
              </div>
              <div style={{ fontSize: 32, fontWeight: 800, margin: "5px 0" }}>
                {health?.indexed_documents ?? "?"}
              </div>
              <div style={{ fontSize: 12, color: "#64748B" }}>
                View all indexed documents
              </div>
            </button>
          </section>

          <section style={card}>
            <h3
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 21,
                margin: "0 0 7px",
              }}
            >
              Document Processing Pipeline
            </h3>
            <p style={{ fontSize: 12, color: "#64748B", margin: "0 0 16px" }}>
              Select any stage to see how Heron IDP processes your documents.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(145px,1fr))",
                gap: 10,
              }}
            >
              {[
                ["upload", "01", "Upload document", "Add PDF contracts"],
                ["extract", "02", "Text Extraction", "Read text and pages"],
                [
                  "chunks",
                  "03",
                  "	Organising Contract Content",
                  "Prepare searchable text",
                ],
                [
                  "embed",
                  "04",
                  "Understanding Contract Language",
                  "Generate semantic vectors",
                ],
                [
                  "storage",
                  "05",
                  "Making Contract Information Searchable",
                  "Store records and vectors",
                ],
                [
                  "review",
                  "06",
                  "Reviewing Contract Terms",
                  "Extract terms and clauses",
                ],
              ].map(([id, number, title, subtitle]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selectedStage === id}
                  onClick={() => {
                    setSelectedStage(id);
                    if (id === "upload") onUpload();
                    if (id === "storage") setTab("Data Services");
                    if (id === "review") onNavigate("Contract Terms Index");
                  }}
                  style={{
                    padding: 14,
                    minHeight: 105,
                    textAlign: "left",
                    borderRadius: 11,
                    border:
                      selectedStage === id
                        ? "2px solid #159989"
                        : "1px solid #DCE5EF",
                    background: selectedStage === id ? "#EAF7F4" : "#FFFFFF",
                    color: "#1E293B",
                    cursor: "pointer",
                    transition: "all 150ms ease",
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#149889",
                      marginBottom: 9,
                    }}
                  >
                    STEP {number}
                  </div>
                  <b style={{ display: "block", fontSize: 13 }}>{title}</b>
                  <small
                    style={{ display: "block", marginTop: 5, color: "#64748B" }}
                  >
                    {subtitle}
                  </small>
                  <small
                    style={{
                      display: "block",
                      marginTop: 9,
                      color: "#148779",
                      fontWeight: 700,
                    }}
                  >
                    See What Happens
                  </small>
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: 17,
                padding: 16,
                borderRadius: 11,
                background: "#F1F7FA",
                border: "1px solid #DFEAF0",
              }}
            >
              <b style={{ fontSize: 14 }}>
                {{
                  upload: "Upload document",
                  extract: "PDF text extraction",
                  chunks: "Text chunking",
                  embed: "Semantic embeddings",
                  storage: "PostgreSQL and pgvector indexing",
                  review: "Extraction and human review",
                }[selectedStage] || "Ingestion stage"}
              </b>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.7,
                  color: "#475569",
                  margin: "7px 0 0",
                }}
              >
                {{
                  upload:
                    "Upload individual PDFs, multiple PDFs or supported ZIP archives. Files are validated before indexing.",
                  extract:
                    "The backend reads PDF content and extracts text for downstream contract processing.",
                  chunks:
                    "Extracted text is divided into searchable sections so relevant contract passages can be retrieved.",
                  embed:
                    "The configured Contract Search Model converts text chunks into vectors for semantic retrieval.",
                  storage:
                    "Contract records, extracted data and vector representations are stored using PostgreSQL and pgvector.",
                  review:
                    "HeronIDP proposes contractual terms and clauses. Reviewers can inspect evidence and approve, reject or return extracted items.",
                }[selectedStage] || "Select a pipeline stage to view details."}
              </p>
            </div>
          </section>
        </div>
      )}

      {tab === "Data Services" && (
        <div style={card}>
          <h2 style={{ fontFamily: "Georgia,serif" }}>Service connectivity</h2>
          {[
            ["FastAPI", health?.api === "ok"],
            ["PostgreSQL", health?.database === "connected"],
            ["Ollama", health?.ollama === "connected"],
            ["Contract Understanding Model", !!health?.chat_model_installed],
            [
              "Contract Search Model installed",
              !!health?.embedding_model_installed,
            ],
          ].map(([name, ok]) => (
            <div
              key={String(name)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "13px 0",
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              <b style={{ fontSize: 13 }}>{String(name)}</b>
              {status(Boolean(ok))}
            </div>
          ))}
        </div>
      )}

      {tab === "Processing Workflow" && (
        <div style={card}>
          <h2 style={{ fontFamily: "Georgia,serif" }}>
            Contract processing workflow
          </h2>
          {[
            "Document upload",
            "PDF validation and text extraction",
            "	Organising Contract Content",
            "Understanding Contract Language",
            "PostgreSQL + pgvector indexing",
            "AI term and clause extraction",
            "Human review and approval",
          ].map((step, i) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 13,
                padding: "12px 0",
                borderBottom: "1px solid #E2E8F0",
              }}
            >
              <span
                style={{
                  width: 27,
                  height: 27,
                  borderRadius: 30,
                  background: "#E8F5F2",
                  color: "#137C70",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {i + 1}
              </span>
              <b style={{ fontSize: 13 }}>{step}</b>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: 11, color: "#64748B" }}>
        Live service status comes from the backend health endpoints. Job history
        and worker telemetry are not instrumented in this demo.
      </div>
    </div>
  );
}

function Overview({
  onUpload,
  setActive,
  documents = [],
}: {
  onUpload: () => void;
  setActive: (page: Section) => void;
  documents: IndexedDocument[];
}) {
  const [dateLabel, setDateLabel] = useState("");
  const [greeting, setGreeting] = useState("Welcome back");
  const [riskCount, setRiskCount] = useState<number | null>(null);
  const [ruleCount, setRuleCount] = useState<number | null>(null);
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [termStatsUnavailable, setTermStatsUnavailable] = useState(false);
  const [termStats, setTermStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    commercial: 0,
    samples: [] as Array<{
      contract: string;
      term: string;
      amount: string;
      status: string;
    }>,
  });

  useEffect(() => {
    const now = new Date();
    setDateLabel(
      now
        .toLocaleDateString("en-GB", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .toUpperCase(),
    );
    setGreeting(
      now.getHours() < 12
        ? "Good morning"
        : now.getHours() < 17
          ? "Good afternoon"
          : "Good evening",
    );
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPortfolioData() {
      if (!documents.length) {
        setRiskCount(0);
        setRuleCount(0);
        setPendingCount(0);
        return;
      }

      setLoading(true);
      try {
        const results = await Promise.all(
          documents.map(async (doc) => {
            const [riskResponse, ruleResponse] = await Promise.all([
              fetch(`${API_URL}/api/documents/${doc.document_id}/risks`),
              fetch(`${API_URL}/api/documents/${doc.document_id}/rules`),
            ]);

            if (!riskResponse.ok || !ruleResponse.ok) {
              throw new Error(
                `Portfolio request failed for ${doc.original_filename || doc.filename || doc.document_id}: risks ${riskResponse.status}, rules ${ruleResponse.status}`,
              );
            }
            const risksData = await riskResponse.json();
            const rulesData = await ruleResponse.json();

            const risks = Array.isArray(risksData)
              ? risksData
              : risksData.risks || [];
            const rules = Array.isArray(rulesData)
              ? rulesData
              : rulesData.rules || [];

            return {
              risks,
              rules,
              pending: [
                ...risks.filter(
                  (x: any) => (x.review_status || "pending") === "pending",
                ),
                ...rules.filter(
                  (x: any) => (x.review_status || "pending") === "pending",
                ),
              ].length,
            };
          }),
        );

        if (!cancelled) {
          setRiskCount(results.reduce((n, x) => n + x.risks.length, 0));
          setRuleCount(results.reduce((n, x) => n + x.rules.length, 0));
          setPendingCount(results.reduce((n, x) => n + x.pending, 0));
        }
      } catch {
        if (!cancelled) {
          setRiskCount(null);
          setRuleCount(null);
          setPendingCount(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPortfolioData();
    return () => {
      cancelled = true;
    };
  }, [documents]);

  useEffect(() => {
    let cancelled = false;

    async function loadTermStats() {
      const selected = new Map<string, IndexedDocument>();
      documents.forEach((doc) => selected.set(doc.document_id, doc));
      if (selected.size === 0) {
        if (!cancelled) {
          setTermStatsUnavailable(false);
          setTermStats({
            total: 0,
            approved: 0,
            pending: 0,
            commercial: 0,
            samples: [],
          });
        }
        return;
      }

      try {
        const responses = await Promise.all(
          [...selected.values()].map(async (doc) => {
            const response = await fetch(
              `${API_URL}/api/documents/${doc.document_id}/terms`,
            );
            if (!response.ok) {
              throw new Error(
                `Terms request failed for ${doc.original_filename || doc.filename || doc.document_id}: HTTP ${response.status}`,
              );
            }
            const data = await response.json();
            return (Array.isArray(data.terms) ? data.terms : []).map(
              (term: any) => ({
                ...term,
                contractName:
                  doc.original_filename || doc.filename || "Contract",
              }),
            );
          }),
        );

        if (cancelled) return;

        const terms = responses.flat();
        const commercialFields = [
          "rate_amount",
          "currency",
          "rate_unit",
          "rate_basis",
          "percentage",
          "index_name",
          "index_base_value",
          "indexation_frequency",
          "indexation_cap_pct",
          "indexation_floor_pct",
          "fx_reference",
          "fx_date_rule",
          "volume_min",
          "volume_max",
          "volume_unit",
          "payment_due_days",
          "renewal_notice_days",
          "exit_notice_days",
        ];

        const commercial = terms.filter(
          (term: any) =>
            term.commercial_details &&
            commercialFields.some((field) => {
              const value = term.commercial_details[field];
              return value !== null && value !== undefined && value !== "";
            }),
        );

        const samples = commercial.map((term: any) => {
          const d = term.commercial_details;
          let amount = "Commercial condition captured";

          if (d.rate_amount != null) {
            amount =
              `${d.currency || ""} ${Number(d.rate_amount).toLocaleString("en-IN")}`.trim();
          } else if (d.payment_due_days != null) {
            amount = `Payment due: ${d.payment_due_days} days`;
          } else if (d.renewal_notice_days != null) {
            amount = `Renewal notice: ${d.renewal_notice_days} days`;
          } else if (d.exit_notice_days != null) {
            amount = `Exit notice: ${d.exit_notice_days} days`;
          } else if (d.percentage != null) {
            amount = `Percentage: ${d.percentage}%`;
          } else if (d.index_name) {
            amount = `Index: ${d.index_name}`;
          }

          return {
            contract: term.contractName,
            term: term.term_name || "Commercial term",
            amount,
            status: term.review_status || "pending",
          };
        });

        setTermStatsUnavailable(false);
        setTermStats({
          total: terms.length,
          approved: terms.filter((t: any) => t.review_status === "approved")
            .length,
          pending: terms.filter(
            (t: any) => !t.review_status || t.review_status === "pending",
          ).length,
          commercial: commercial.length,
          samples: samples.slice(0, 8),
        });
      } catch (error) {
        if (!cancelled) {
          setTermStatsUnavailable(true);
          setTermStats({
            total: 0,
            approved: 0,
            pending: 0,
            commercial: 0,
            samples: [],
          });
        }
        console.error("Commercial dashboard load failed:", error);
      }
    }

    loadTermStats();
    return () => {
      cancelled = true;
    };
  }, [documents]);

  const totalPages = documents.reduce((n, d) => n + (d.pages_indexed || 0), 0);
  const totalChunks = documents.reduce(
    (n, d) => n + (d.chunks_created || 0),
    0,
  );

  return (
    <>
      <PageHeading
        eyebrow={dateLabel}
        title="Contract Insights & Overview"
        description="A unified view of your contracts, obligations, risks and commercial commitments"
        action={
          <button className="button button-primary" onClick={onUpload}>
            <Plus size={16} /> Upload a contract
          </button>
        }
      />

      <div className="insight-banner">
        <div className="insight-spark">
          <Sparkles size={19} />
        </div>
        <div>
          <b>
            {pendingCount === null
              ? "Review status unavailable"
              : `${pendingCount} items awaiting human validation`}
          </b>
          <p>
            Review identified contractual obligations and potential risks before
            taking action.
          </p>
        </div>
        <button onClick={() => setActive("Contract Risk Assessment")}>
          Review potential risks <ArrowRight size={22} />
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Contracts uploaded"
          value={String(documents.length)}
          note={loading ? "Refreshing..." : "Stored in local workspace"}
          icon={FileText}
          tone="violet"
        />
        <MetricCard
          label="Contract pages processed"
          value={totalPages.toLocaleString("en-IN")}
          note={`${totalChunks.toLocaleString("en-IN")} searchable chunks`}
          icon={FileSearch}
          tone="blue"
        />
        <MetricCard
          label="Potential contract risks"
          value={riskCount === null ? "—" : String(riskCount)}
          note="Identified in indexed documents"
          icon={ShieldAlert}
          tone="red"
          onClick={() => setActive("Contract Risk Assessment")}
        />
        <MetricCard
          label="Contractual Obligations identified"
          value={ruleCount === null ? "—" : String(ruleCount)}
          note="Contractual Obligations, conditions and rights"
          icon={FileCheck2}
          tone="amber"
          onClick={() => setActive("Contractual Obligations")}
        />

        <MetricCard
          label="Extracted contract terms"
          value={termStatsUnavailable ? "—" : String(termStats.total)}
          note="Across all loaded contracts"
          icon={FileSearch}
          tone="blue"
          onClick={() => setActive("Contract Terms Index")}
        />
        <MetricCard
          label="Approved terms"
          value={termStatsUnavailable ? "—" : String(termStats.approved)}
          note="Human-reviewed and approved"
          icon={FileCheck2}
          tone="violet"
          onClick={() => setActive("Contract Terms Index")}
        />
        <MetricCard
          label="Pending term reviews"
          value={termStatsUnavailable ? "—" : String(termStats.pending)}
          note="Awaiting human validation"
          icon={CalendarDays}
          tone="amber"
          onClick={() => setActive("Contract Terms Index")}
        />
        <MetricCard
          label="Commercial records"
          value={termStatsUnavailable ? "—" : String(termStats.commercial)}
          note="Rates, payment and notice conditions"
          icon={Wallet}
          tone="blue"
          onClick={() => setActive("Financial & Commercial Terms")}
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h3>Recently added contracts</h3>
              <p>Your latest contracts available for review</p>
            </div>
            <button className="text-button">
              View all <ArrowRight size={14} />
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="empty-state" style={{ padding: 28 }}>
              No contracts have been indexed yet. Upload a PDF to start building
              your repository.
            </div>
          ) : (
            <div style={{ padding: "0 18px 18px" }}>
              {documents.slice(0, 6).map((doc) => (
                <div
                  key={doc.document_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: "13px 0",
                    borderBottom: "1px solid var(--border, #eee)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <b
                      style={{
                        display: "block",
                        overflowWrap: "anywhere",
                        fontSize: 13,
                      }}
                    >
                      {doc.original_filename || doc.filename}
                    </b>
                    <small style={{ opacity: 0.7 }}>
                      {doc.pages_indexed} pages · {doc.chunks_created} chunks
                    </small>
                  </div>
                  <span className="status-pill">{doc.status || "indexed"}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section
          className="panel"
          role="button"
          tabIndex={0}
          aria-label="Open pending contract review queue"
          onClick={() => setActive("Contractual Obligations")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setActive("Contractual Obligations");
            }
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="panel-heading">
            <div>
              <h3>Pending contract reviews</h3>
              <p>Contract findings awaiting your review</p>
            </div>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ fontSize: 36, fontWeight: 700 }}>
              {pendingCount === null ? "—" : pendingCount}
            </div>
            <p style={{ fontSize: 13, opacity: 0.7 }}>
              Risk observations and contractual rules awaiting human review.
            </p>
            <button
              className="button button-primary"
              onClick={() => setActive("Contractual Obligations")}
            >
              Open review queue <ArrowRight size={15} />
            </button>
          </div>
        </section>
      </div>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-heading">
          <div>
            <h3>Commercial intelligence captured</h3>
            <p>Extracted financial and contractual conditions</p>
          </div>
          <button
            className="text-button"
            onClick={() => setActive("Financial & Commercial Terms")}
          >
            View commercial terms <ArrowRight size={14} />
          </button>
        </div>
        {termStats.samples.length === 0 ? (
          <div className="empty-state" style={{ padding: 22 }}>
            No populated commercial details are available.
          </div>
        ) : (
          <div style={{ padding: "0 18px 18px" }}>
            {termStats.samples.map((item, index) => (
              <div
                key={`${item.contract}-${item.term}-${index}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border, #eee)",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <b style={{ display: "block", fontSize: 13 }}>{item.term}</b>
                  <small style={{ opacity: 0.7 }}>{item.contract}</small>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <b style={{ display: "block", fontSize: 13 }}>
                    {item.amount}
                  </b>
                  <small style={{ opacity: 0.7 }}>{item.status}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="demo-disclaimer">
        <ShieldAlert size={14} />
        Dashboard figures are fetched from the local indexed-document database
        and extraction endpoints. No invoice actuals, savings, contract values
        or upcoming deadlines are assumed.
      </div>
    </>
  );
}

function ContractsView({
  query,
  setQuery,
  filter,
  setFilter,
  onUpload,
  documents,
  documentsLoading,
  onOpenContract,
  onDeleteContract,
  deletingDocumentId,
  deleteNotice,
}: any) {
  const statuses = ["All", "Indexed"];

  // Show every document returned by the backend; do not restrict the
  // repository to a hard-coded demo filename allowlist.
  const repositoryDocuments: IndexedDocument[] = Array.isArray(documents)
    ? documents
    : [];

  const [termSummaries, setTermSummaries] = useState<Record<string, any>>({});
  const [termsLoading, setTermsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadContractTerms() {
      setTermsLoading(true);

      const results: Record<string, any> = {};

      await Promise.all(
        repositoryDocuments.map(async (doc) => {
          try {
            const response = await fetch(
              `${API_URL}/api/documents/${doc.document_id}/terms`,
            );

            if (!response.ok) {
              results[doc.document_id] = { error: true };
              return;
            }

            const data = await response.json();

            results[doc.document_id] = {
              terms: Array.isArray(data.terms) ? data.terms : [],
            };
          } catch {
            results[doc.document_id] = { error: true };
          }
        }),
      );

      if (!cancelled) {
        setTermSummaries(results);
        setTermsLoading(false);
      }
    }

    if (repositoryDocuments.length > 0) {
      loadContractTerms();
    } else {
      setTermSummaries({});
      setTermsLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [documents]);

  function getFinancialTerms(documentId: string): string {
    const terms = termSummaries[documentId]?.terms || [];

    const values: string[] = Array.from(
      new Set<string>(
        terms
          .map((term: any): string =>
            typeof term.financial_impact === "string"
              ? term.financial_impact.trim()
              : "",
          )
          .filter((value: string) => value.length > 0),
      ),
    );

    return values.length > 0 ? values.join("; ") : "-";
  }

  function getExpiryDate(documentId: string): string {
    const terms = termSummaries[documentId]?.terms || [];

    const dates: string[] = Array.from(
      new Set<string>(
        terms
          .map((term: any): string =>
            typeof term.expiry_date === "string" ? term.expiry_date.trim() : "",
          )
          .filter((value: string) => value.length > 0),
      ),
    );

    if (dates.length === 0) return "-";

    if (dates.length > 1) return "Multiple dates — review";

    const date: string = dates[0];
    const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return date;

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE / DOCUMENTS"
        title="Contract repository"
        description="Manage, search and explore your organisation's agreements."
        action={
          <button className="button button-primary" onClick={onUpload}>
            <Plus size={29} /> Upload a contract
          </button>
        }
      />

      <div className="metrics-grid compact-metrics">
        <MetricCard
          label="Total contracts"
          value={repositoryDocuments.length}
          note="Available in repository"
          icon={FileText}
          tone="violet"
        />
        <MetricCard
          label="Indexed"
          value={repositoryDocuments.length}
          note="Successfully indexed"
          icon={CheckCircle2}
          tone="green"
        />
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="table-search">
            <Search size={19} />
            <input
              placeholder="Search contracts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="toolbar-right">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>CONTRACT DOCUMENT</th>
                <th>TYPE</th>
                <th>FINANCIAL TERMS</th>
                <th>EXPIRY DATE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {repositoryDocuments
                .filter((doc) =>
                  (doc.original_filename || doc.filename || "")
                    .toLowerCase()
                    .includes(query.toLowerCase()),
                )
                .map((doc) => {
                  const documentId = doc.document_id;
                  const summary = termSummaries[documentId];

                  return (
                    <tr
                      key={documentId}
                      onClick={() => onOpenContract(documentId)}
                      onKeyDown={(e) => {
                        if ((e.target as HTMLElement).closest("button")) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onOpenContract(documentId);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`Open ${doc.original_filename || doc.filename} in contract analysis`}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        <div className="contract-cell">
                          <div className="vendor-avatar gray">
                            <FileText size={19} />
                          </div>
                          <div>
                            <b
                              style={{
                                fontSize: "14px",
                                fontWeight: 700,
                                color: "#1D2939",
                              }}
                            >
                              {doc.original_filename || doc.filename}
                            </b>
                            <span>Document ID: {documentId}</span>
                          </div>
                        </div>
                      </td>

                      <td>PDF document</td>

                      <td>
                        {termsLoading
                          ? "Loading..."
                          : summary?.error
                            ? "Unavailable"
                            : getFinancialTerms(documentId)}
                      </td>

                      <td>
                        {termsLoading
                          ? "Loading..."
                          : summary?.error
                            ? "Unavailable"
                            : getExpiryDate(documentId)}
                      </td>

                      <td>
                        <span className="status-pill active">
                          {doc.status || "Indexed"}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={deletingDocumentId === documentId}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteContract(doc);
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                          aria-label={`Delete ${doc.original_filename || doc.filename}`}
                          style={{
                            padding: "7px 11px",
                            border: "1px solid #F2B8B5",
                            borderRadius: 7,
                            background: "#FFF5F4",
                            color: "#B42318",
                            cursor: deletingDocumentId === documentId ? "not-allowed" : "pointer",
                            opacity: deletingDocumentId === documentId ? 0.6 : 1,
                          }}
                        >
                          {deletingDocumentId === documentId ? "Deleting..." : "Delete"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

              {documentsLoading && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Loading contracts...
                  </td>
                </tr>
              )}

              {deleteNotice && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    {deleteNotice}
                  </td>
                </tr>
              )}

              {!documentsLoading && repositoryDocuments.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No contracts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="demo-disclaimer" style={{ marginTop: 16 }}>
          <ShieldAlert size={14} />
          Financial terms and expiry dates are drawn from extracted provisions.
          Multiple dates or missing information require human verification.
          These figures are not automatically confirmed contract totals.
        </div>
      </section>
    </>
  );
}

type ContractRiskItem = {
  id: number;
  risk: string;
  severity: "low" | "medium" | "high";
  explanation: string;
  evidence: string;
  page_number: number | null;
  review_status: "pending" | "reviewed" | "resolved" | string;
  review_notes?: string | null;
  created_at?: string | null;
  reviewed_at?: string | null;
};
function RiskView({
  documents,
  selectedDocumentId,
  setSelectedDocumentId,
}: {
  documents: IndexedDocument[];
  selectedDocumentId: string;
  setSelectedDocumentId: (id: string) => void;
}) {
  const [risks, setRisks] = useState<ContractRiskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [notesByRisk, setNotesByRisk] = useState<Record<number, string>>({});
  const [savingRiskId, setSavingRiskId] = useState<number | null>(null);
  const riskLoadRequestRef = useRef(0);
  const reviewRequestRef = useRef(0);

  const selected = documents.find(
    (doc) => doc.document_id === selectedDocumentId,
  );

  const loadRisks = async () => {
    const documentId = selectedDocumentId;
    const requestId = ++riskLoadRequestRef.current;

    if (!documentId) {
      setRisks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${encodeURIComponent(documentId)}/risks`,
      );
      const data = await response.json().catch(() => null);

      if (requestId !== riskLoadRequestRef.current) return;

      if (response.status === 404) {
        setRisks([]);
        setNotesByRisk({});
        setNotice(
          "No saved analysis was found for this contract. Run Contract Analysis first.",
        );
        return;
      }

      if (!response.ok) {
        throw new Error(data?.detail || "Could not load contract risks.");
      }

      const loadedRisks: ContractRiskItem[] = Array.isArray(data?.risks)
        ? data.risks
        : [];

      setRisks(loadedRisks);
      setNotesByRisk(
        Object.fromEntries(
          loadedRisks.map((risk) => [risk.id, risk.review_notes || ""]),
        ),
      );
    } catch (e) {
      if (requestId !== riskLoadRequestRef.current) return;
      setError(
        e instanceof Error ? e.message : "Could not load risk findings.",
      );
    } finally {
      if (requestId === riskLoadRequestRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Invalidate any in-flight load or save from the previous contract.
    reviewRequestRef.current += 1;

    setRisks([]);
    setNotesByRisk({});
    setStatusFilter("all");
    setSeverityFilter("all");
    setError("");
    setNotice("");
    setSavingRiskId(null);

    void loadRisks();

    return () => {
      riskLoadRequestRef.current += 1;
      reviewRequestRef.current += 1;
    };
    // Refresh the risk list when the selected contract changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDocumentId]);

  const updateReview = async (
    riskId: number,
    reviewStatus: "pending" | "reviewed" | "resolved",
  ) => {
    const documentId = selectedDocumentId;
    if (!documentId) return;

    const requestId = ++reviewRequestRef.current;

    setSavingRiskId(riskId);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${encodeURIComponent(documentId)}/risks/${riskId}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            review_status: reviewStatus,
            review_notes: notesByRisk[riskId] || "",
          }),
        },
      );

      const data = await response.json().catch(() => null);

      if (requestId !== reviewRequestRef.current) return;

      if (!response.ok) {
        throw new Error(data?.detail || "Could not update risk review.");
      }

      setRisks((previous) =>
        previous.map((risk) =>
          risk.id === riskId
            ? {
                ...risk,
                review_status: data.review_status,
                review_notes: data.review_notes,
                reviewed_at: data.reviewed_at,
              }
            : risk,
        ),
      );

      setNotice(`Risk #${riskId} marked ${reviewStatus}.`);
    } catch (e) {
      if (requestId !== reviewRequestRef.current) return;
      setError(
        e instanceof Error ? e.message : "Could not update risk review.",
      );
    } finally {
      if (requestId === reviewRequestRef.current) {
        setSavingRiskId(null);
      }
    }
  };
  const highCount = risks.filter((r) => r.severity === "high").length;
  const mediumCount = risks.filter((r) => r.severity === "medium").length;
  const lowCount = risks.filter((r) => r.severity === "low").length;
  const pendingCount = risks.filter(
    (r) => r.review_status === "pending",
  ).length;
  const reviewedCount = risks.filter(
    (r) => r.review_status === "reviewed",
  ).length;
  const resolvedCount = risks.filter(
    (r) => r.review_status === "resolved",
  ).length;

  const visibleRisks = risks.filter(
    (risk) =>
      (severityFilter === "all" || risk.severity === severityFilter) &&
      (statusFilter === "all" || risk.review_status === statusFilter),
  );

  const severityStyle = (severity: string): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "capitalize",
    color:
      severity === "high"
        ? "#B42318"
        : severity === "medium"
          ? "#9A6700"
          : "#16794D",
    background:
      severity === "high"
        ? "#FEE4E2"
        : severity === "medium"
          ? "#FFF3D6"
          : "#DCFCE7",
  });

  const statusStyle = (status: string): React.CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 9px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    textTransform: "capitalize",
    color:
      status === "resolved"
        ? "#166534"
        : status === "reviewed"
          ? "#1D4ED8"
          : "#8A5A00",
    background:
      status === "resolved"
        ? "#DCFCE7"
        : status === "reviewed"
          ? "#DBEAFE"
          : "#FEF3C7",
  });

  const smallButton: React.CSSProperties = {
    border: "1px solid #D9DEE8",
    borderRadius: 7,
    background: "#fff",
    padding: "7px 10px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  };

  return (
    <>
      <PageHeading
        eyebrow="INTELLIGENCE / RISK"
        title="Risk intelligence"
        description="Review evidence-backed findings extracted from your uploaded contracts."
        action={
          <button
            className="button button-outline"
            onClick={loadRisks}
            disabled={loading || !selectedDocumentId}
          >
            <Activity size={15} /> Refresh findings
          </button>
        }
      />

      <section
        className="panel obligation-contract-picker"
        style={{ padding: 20, marginBottom: 18 }}
      >
        <label
          htmlFor="risk-contract-select"
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 9,
          }}
        >
          SELECT CONTRACT
        </label>
        <select
          id="risk-contract-select"
          value={selectedDocumentId}
          onChange={(e) => setSelectedDocumentId(e.target.value)}
          disabled={!documents.length}
          style={{
            width: "100%",
            maxWidth: 540,
            padding: "11px 13px",
            border: "1px solid #E2E6EE",
            borderRadius: 9,
            background: "#fff",
          }}
        >
          <option value="">Select an indexed contract</option>
          {documents.map((doc) => (
            <option key={doc.document_id} value={doc.document_id}>
              {doc.filename}
            </option>
          ))}
        </select>
        {selected && (
          <p style={{ margin: "8px 0 0", color: "#7C8799", fontSize: 12 }}>
            {selected.pages_indexed} pages · {selected.chunks_created} indexed
            text chunks
          </p>
        )}
        {!documents.length && (
          <p style={{ color: "#7C8799", fontSize: 13 }}>
            Upload a PDF and run Contract Analysis before reviewing risks.
          </p>
        )}
      </section>

      <div className="metrics-grid">
        <MetricCard
          label="High severity"
          value={highCount}
          note="Click to show high-risk findings"
          icon={ShieldAlert}
          tone="red"
          onClick={() => {
            setSeverityFilter("high");
            setStatusFilter("all");
          }}
        />
        <MetricCard
          label="Medium severity"
          value={mediumCount}
          note="Click to show medium-risk findings"
          icon={AlertTriangle}
          tone="amber"
          onClick={() => {
            setSeverityFilter("medium");
            setStatusFilter("all");
          }}
        />
        <MetricCard
          label="Low severity"
          value={lowCount}
          note="Click to show low-risk findings"
          icon={Activity}
          tone="green"
          onClick={() => {
            setSeverityFilter("low");
            setStatusFilter("all");
          }}
        />
        <MetricCard
          label="Pending review"
          value={pendingCount}
          note="Click to show pending findings"
          icon={Clock3}
          tone="blue"
          onClick={() => {
            setSeverityFilter("all");
            setStatusFilter("pending");
          }}
        />
      </div>

      <section className="panel table-panel" style={{ marginTop: 18 }}>
        <div className="panel-heading" style={{ padding: 20 }}>
          <div>
            <h3>Contract risk findings</h3>
            <p>
              {selected
                ? selected.filename
                : "Select a contract to view saved findings"}{" "}
              · {risks.length} findings
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select
              aria-label="Filter by severity"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                border: "1px solid #E2E6EE",
                borderRadius: 8,
              }}
            >
              <option value="all">All severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              aria-label="Filter by review status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 10px",
                border: "1px solid #E2E6EE",
                borderRadius: 8,
              }}
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {loading && (
          <p role="status" style={{ padding: 20, color: "#687386" }}>
            Loading saved risk findings…
          </p>
        )}
        {error && (
          <p role="alert" style={{ margin: 20, color: "#B42318" }}>
            {error}
          </p>
        )}
        {notice && (
          <p role="status" style={{ margin: 20, color: "#16794D" }}>
            {notice}
          </p>
        )}

        {!loading && !error && !selectedDocumentId && (
          <p className="empty-state">
            Select an indexed contract to see its risk findings.
          </p>
        )}

        {!loading && selectedDocumentId && risks.length === 0 && !error && (
          <div style={{ padding: 24, textAlign: "center" }}>
            <ShieldAlert size={26} color="#8992A5" />
            <h3 style={{ margin: "10px 0 5px" }}>No saved risk findings</h3>
            <p style={{ color: "#7C8799", fontSize: 13 }}>
              Run Contract Analysis for this contract. An empty risk list does
              not mean the contract is risk-free.
            </p>
          </div>
        )}

        {!loading &&
          visibleRisks.map((risk) => (
            <article
              key={risk.id}
              className="risk-finding-card"
              style={{ padding: 20, borderTop: "1px solid #EDF0F5" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <b>{risk.risk}</b>
                  <span style={severityStyle(risk.severity)}>
                    {risk.severity}
                  </span>
                  <span style={statusStyle(risk.review_status)}>
                    {risk.review_status}
                  </span>
                </div>
                <small style={{ color: "#7C8799" }}>
                  Finding #{risk.id}
                  {risk.page_number ? ` · Page ${risk.page_number}` : ""}
                </small>
              </div>

              <p style={{ margin: "12px 0", fontSize: 16, lineHeight: 1.75 }}>
                {risk.explanation}
              </p>

              {risk.evidence && (
                <blockquote
                  className="risk-evidence"
                  style={{
                    margin: "10px 0",
                    padding: "12px 14px",
                    borderLeft: "3px solid #8B7CF6",
                    background: "#F8F7FF",
                    borderRadius: "0 8px 8px 0",
                    color: "#465064",
                  }}
                >
                  <small
                    style={{
                      display: "block",
                      fontWeight: 700,
                      marginBottom: 5,
                    }}
                  >
                    CONTRACT EVIDENCE
                  </small>
                  “{risk.evidence}”
                </blockquote>
              )}

              <div style={{ marginTop: 12 }}>
                <label
                  htmlFor={`risk-note-${risk.id}`}
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 6,
                    color: "#687386",
                  }}
                >
                  REVIEW NOTES
                </label>
                <textarea
                  className="risk-review-notes"
                  id={`risk-note-${risk.id}`}
                  value={notesByRisk[risk.id] ?? risk.review_notes ?? ""}
                  onChange={(e) =>
                    setNotesByRisk((previous) => ({
                      ...previous,
                      [risk.id]: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Add reviewer comments or rationale…"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #D9DEE8",
                    borderRadius: 8,
                    padding: 10,
                    font: "inherit",
                    fontSize: 13,
                    resize: "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginTop: 10,
                }}
              >
                <button
                  style={smallButton}
                  disabled={savingRiskId === risk.id}
                  onClick={() => updateReview(risk.id, "pending")}
                >
                  Mark pending
                </button>
                <button
                  style={smallButton}
                  disabled={savingRiskId === risk.id}
                  onClick={() => updateReview(risk.id, "reviewed")}
                >
                  Mark reviewed
                </button>
                <button
                  style={{
                    ...smallButton,
                    borderColor: "#B7E4C7",
                    color: "#16794D",
                  }}
                  disabled={savingRiskId === risk.id}
                  onClick={() => updateReview(risk.id, "resolved")}
                >
                  Mark resolved
                </button>
                {savingRiskId === risk.id && (
                  <small
                    role="status"
                    style={{ alignSelf: "center", color: "#687386" }}
                  >
                    Saving…
                  </small>
                )}
              </div>
            </article>
          ))}

        {!loading && visibleRisks.length === 0 && risks.length > 0 && (
          <p className="empty-state">No findings match the selected filters.</p>
        )}
      </section>

      <div className="demo-disclaimer">
        <ShieldAlert size={14} /> Findings are generated review aids. Verify
        every quotation against the original contract and obtain qualified legal
        review where appropriate.
      </div>
    </>
  );
}

type ObligationRule = {
  id: number;
  clause_id: number;
  rule_type: string;
  category: string | null;
  title: string;
  actor: string | null;
  beneficiary: string | null;
  modality: string | null;
  action: string | null;
  trigger_condition: string | null;
  deadline_or_duration: string | null;
  amount_or_formula: string | null;
  exceptions_or_qualifications: string | null;
  consequence_or_remedy: string | null;
  original_text: string;
  plain_language_explanation: string;
  page_number: number | null;
  review_status: string;
  review_notes: string | null;
};

function ObligationsView({
  documents,
  selectedDocumentId,
  setSelectedDocumentId,
}: {
  documents: IndexedDocument[];
  selectedDocumentId: string;
  setSelectedDocumentId: (id: string) => void;
}) {
  const [rules, setRules] = useState<ObligationRule[]>([]);
  const [ruleNotes, setRuleNotes] = useState<Record<number, string>>({});
  const [savingRuleId, setSavingRuleId] = useState<number | null>(null);
  const [ruleReviewNotice, setRuleReviewNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [metricFilter, setMetricFilter] = useState("all");
  const [reloadCounter, setReloadCounter] = useState(0);

  const saveRuleReview = async (
    ruleId: number,
    status: "pending" | "reviewed" | "resolved",
    existingNotes?: string | null,
  ) => {
    if (!selectedDocumentId) {
      setRuleReviewNotice("Please select a contract first.");
      return;
    }

    const notes = ruleNotes[ruleId] ?? existingNotes ?? "";
    setSavingRuleId(ruleId);
    setRuleReviewNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${encodeURIComponent(selectedDocumentId)}/rules/${ruleId}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            notes,
            review_status: status,
            review_notes: notes,
          }),
        },
      );

      if (!response.ok) throw new Error(await response.text());
      const updated = await response.json();

      setRules((previous) =>
        previous.map((rule) =>
          rule.id === ruleId
            ? {
                ...rule,
                review_status: updated.review_status ?? status,
                review_notes: updated.review_notes ?? notes,
              }
            : rule,
        ),
      );
      setRuleNotes((previous) => ({
        ...previous,
        [ruleId]: updated.review_notes ?? notes,
      }));
      setRuleReviewNotice("Review saved successfully.");
    } catch (err) {
      console.error("Failed to save obligation review:", err);
      setRuleReviewNotice("Unable to save review. Please try again.");
    } finally {
      setSavingRuleId(null);
    }
  };

  useEffect(() => {
    if (!selectedDocumentId) {
      setRules([]);
      return;
    }

    let cancelled = false;

    async function loadRules() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/documents/${selectedDocumentId}/rules`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || "Could not load contractual rules.");
        }

        if (!cancelled) {
          setRules(
            Array.isArray(data)
              ? data
              : Array.isArray(data.rules)
                ? data.rules
                : [],
          );
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not load rules.");
          setRules([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRules();
    return () => {
      cancelled = true;
    };
  }, [selectedDocumentId, reloadCounter]);

  const filteredRules = rules.filter((rule) => {
    const text = [
      rule.title,
      rule.category,
      rule.actor,
      rule.action,
      rule.plain_language_explanation,
      rule.original_text,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = text.includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || rule.rule_type === typeFilter;
    const matchesMetric =
      metricFilter === "all" ||
      (metricFilter === "pending" && rule.review_status === "pending") ||
      (metricFilter === "reviewed" && rule.review_status !== "pending") ||
      (metricFilter === "categorized" && Boolean(rule.category));

    return matchesSearch && matchesType && matchesMetric;
  });

  const pending = rules.filter((r) => r.review_status === "pending").length;
  const reviewed = rules.filter((r) => r.review_status !== "pending").length;
  const types = Array.from(
    new Set(rules.map((r) => r.rule_type).filter(Boolean)),
  );

  const metricTile = (key: string, outline: string, card: React.ReactNode) => (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setMetricFilter(key)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setMetricFilter(key);
      }}
      style={{
        cursor: "pointer",
        borderRadius: 12,
        outline: metricFilter === key ? `2px solid ${outline}` : "none",
      }}
    >
      {card}
    </div>
  );

  return (
    <>
      <PageHeading
        eyebrow="INTELLIGENCE / OBLIGATIONS"
        title="Obligation management"
        description="Explore contractual obligations, rights, conditions, deadlines and remedies extracted from the source document."
      />

      <section
        className="panel obligation-contract-picker"
        style={{ padding: 20, marginBottom: 18 }}
      >
        <label
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          SELECT CONTRACT
        </label>
        <select
          value={selectedDocumentId}
          onChange={(e) => setSelectedDocumentId(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 600,
            padding: 11,
            border: "1px solid #E2E6EE",
            borderRadius: 8,
          }}
        >
          <option value="">Select an indexed contract</option>
          {documents.map((doc) => (
            <option key={doc.document_id} value={doc.document_id}>
              {doc.filename}
            </option>
          ))}
        </select>
      </section>

      <div className="metrics-grid">
        {metricTile(
          "all",
          "#159B8A",
          <MetricCard
            label="Contractual Obligations identified"
            value={rules.length}
            note="Click to show all obligations"
            icon={FileCheck2}
            tone="violet"
          />,
        )}
        {metricTile(
          "pending",
          "#D99024",
          <MetricCard
            label="Pending review"
            value={pending}
            note="Click to show pending records"
            icon={Clock3}
            tone="amber"
          />,
        )}
        {metricTile(
          "reviewed",
          "#159B8A",
          <MetricCard
            label="Reviewed"
            value={reviewed}
            note="Click to show reviewed records"
            icon={CheckCircle2}
            tone="green"
          />,
        )}
        {metricTile(
          "categorized",
          "#3978D5",
          <MetricCard
            label="Rule categories"
            value={types.length}
            note="Click to show categorised rules"
            icon={FileSearch}
            tone="blue"
          />,
        )}
      </div>

      <section
        className="panel obligation-results-panel"
        style={{ marginTop: 18 }}
      >
        <div className="panel-heading" style={{ padding: 20 }}>
          <div>
            <h3>Contractual rules and obligations</h3>
            <p>Original wording and generated plain-language explanations</p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            padding: "0 20px 18px",
            flexWrap: "wrap",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search obligations, clauses or wording..."
            style={{
              flex: 1,
              minWidth: 220,
              padding: 10,
              border: "1px solid #E2E6EE",
              borderRadius: 8,
            }}
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: 10,
              border: "1px solid #E2E6EE",
              borderRadius: 8,
            }}
          >
            <option value="all">All rule types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            className="button button-outline"
            onClick={() => setReloadCounter((value) => value + 1)}
          >
            Refresh
          </button>
        </div>

        {loading && <p style={{ padding: 20 }}>Loading extracted rules...</p>}
        {error && (
          <p role="alert" style={{ padding: 20, color: "#B42318" }}>
            {error}
          </p>
        )}
        {ruleReviewNotice && (
          <p role="status" style={{ padding: "0 20px 12px", color: "#16794D" }}>
            {ruleReviewNotice}
          </p>
        )}

        {!loading && !error && !selectedDocumentId && (
          <p className="empty-state">
            Select a contract to view its extracted rules.
          </p>
        )}

        {!loading &&
          !error &&
          selectedDocumentId &&
          filteredRules.length === 0 && (
            <p className="empty-state">
              No matching rules found. Extract clauses first if this contract
              has not been processed.
            </p>
          )}

        {filteredRules.map((rule) => (
          <article
            key={rule.id}
            className="obligation-card"
            style={{ padding: 20, borderTop: "1px solid #EDF0F5" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div>
                <b>{rule.title}</b>
                <p style={{ color: "#7C8799", fontSize: 12, marginTop: 5 }}>
                  {rule.category || rule.rule_type} · Rule #{rule.id}
                  {rule.page_number ? ` · Page ${rule.page_number}` : ""}
                </p>
              </div>
              <span
                className={`status-pill ${rule.review_status === "pending" ? "under-review" : "active"}`}
              >
                {rule.review_status}
              </span>
            </div>

            <div
              className="obligation-explanation"
              style={{
                marginTop: 12,
                background: "#F6F8FB",
                padding: 14,
                borderRadius: 8,
              }}
            >
              <small style={{ fontWeight: 700, color: "#687386" }}>
                PLAIN-LANGUAGE EXPLANATION
              </small>
              <p style={{ marginTop: 6, lineHeight: 1.6 }}>
                {rule.plain_language_explanation}
              </p>
            </div>

            <div style={{ marginTop: 12 }}>
              <small style={{ fontWeight: 700, color: "#687386" }}>
                CONTRACT SOURCE WORDING
              </small>
              <blockquote
                className="obligation-source"
                style={{
                  margin: "7px 0",
                  padding: 12,
                  borderLeft: "3px solid #897AF1",
                  background: "#FAFAFC",
                  lineHeight: 1.6,
                }}
              >
                {rule.original_text}
              </blockquote>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: 12,
                marginTop: 12,
                fontSize: 12,
              }}
            >
              {rule.actor && (
                <div>
                  <b>Responsible party</b>
                  <p>{rule.actor}</p>
                </div>
              )}
              {rule.beneficiary && (
                <div>
                  <b>Beneficiary</b>
                  <p>{rule.beneficiary}</p>
                </div>
              )}
              {rule.deadline_or_duration && (
                <div>
                  <b>Deadline / duration</b>
                  <p>{rule.deadline_or_duration}</p>
                </div>
              )}
              {rule.amount_or_formula && (
                <div>
                  <b>Amount / formula</b>
                  <p>{rule.amount_or_formula}</p>
                </div>
              )}
              {rule.trigger_condition && (
                <div>
                  <b>Trigger</b>
                  <p>{rule.trigger_condition}</p>
                </div>
              )}
              {rule.exceptions_or_qualifications && (
                <div>
                  <b>Exceptions</b>
                  <p>{rule.exceptions_or_qualifications}</p>
                </div>
              )}
              {rule.consequence_or_remedy && (
                <div>
                  <b>Consequence / remedy</b>
                  <p>{rule.consequence_or_remedy}</p>
                </div>
              )}
            </div>

            <div className="obligation-review-editor" style={{ marginTop: 16 }}>
              <h4>Human Review</h4>

              <textarea
                value={ruleNotes[rule.id] ?? rule.review_notes ?? ""}
                onChange={(event) =>
                  setRuleNotes((previous) => ({
                    ...previous,
                    [rule.id]: event.target.value,
                  }))
                }
                placeholder="Enter review notes or observations..."
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid #D9DEE8",
                  borderRadius: 8,
                  padding: 10,
                  font: "inherit",
                  fontSize: 13,
                }}
              />

              <p>
                Current status:{" "}
                <strong>{rule.review_status ?? "pending"}</strong>
              </p>

              <div
                className="obligation-review-actions"
                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
              >
                <button
                  className="button button-outline"
                  disabled={savingRuleId === rule.id}
                  onClick={() =>
                    saveRuleReview(rule.id, "pending", rule.review_notes)
                  }
                >
                  Save as Pending
                </button>
                <button
                  className="button button-outline"
                  disabled={savingRuleId === rule.id}
                  onClick={() =>
                    saveRuleReview(rule.id, "reviewed", rule.review_notes)
                  }
                >
                  Mark Reviewed
                </button>
                <button
                  className="button button-outline"
                  disabled={savingRuleId === rule.id}
                  onClick={() =>
                    saveRuleReview(rule.id, "resolved", rule.review_notes)
                  }
                >
                  Resolve
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <div className="demo-disclaimer">
        Contractual Obligations identified are generated review aids. Dates are
        not treated as scheduled events unless their trigger and calculation
        have been validated.
      </div>
    </>
  );
}
type CommercialRule = {
  id: number;
  clause_id: number;
  rule_type: string;
  category: string | null;
  title: string;
  actor: string | null;
  beneficiary: string | null;
  modality: string | null;
  action: string | null;
  trigger_condition: string | null;
  deadline_or_duration: string | null;
  amount_or_formula: string | null;
  exceptions_or_qualifications: string | null;
  consequence_or_remedy: string | null;
  original_text: string;
  plain_language_explanation: string;
  page_number: number | null;
  review_status: string;
  review_notes?: string | null;
};

type CommercialTermDetails = {
  commercial_type?: string | null;
  rate_amount?: number | string | null;
  currency?: string | null;
  rate_unit?: string | null;
  rate_basis?: string | null;
  percentage?: number | string | null;
  index_name?: string | null;
  index_base_value?: number | string | null;
  indexation_frequency?: string | null;
  indexation_cap_pct?: number | string | null;
  indexation_floor_pct?: number | string | null;
  fx_reference?: string | null;
  fx_date_rule?: string | null;
  volume_min?: number | string | null;
  volume_max?: number | string | null;
  volume_unit?: string | null;
  payment_due_days?: number | null;
  renewal_notice_days?: number | null;
  exit_notice_days?: number | null;
};

type CommercialTerm = {
  id: number;
  term_name?: string | null;
  term_category?: string | null;
  clause_reference?: string | null;
  page_number?: number | null;
  original_text?: string | null;
  interpretation?: string | null;
  effective_date?: string | null;
  expiry_date?: string | null;
  financial_impact?: string | null;
  confidence?: number | null;
  review_status?: string | null;
  review_notes?: string | null;
  commercial_details?: CommercialTermDetails | null;
};

function CommercialView({
  documents,
  selectedDocumentId,
  setSelectedDocumentId,
}: {
  documents: IndexedDocument[];
  selectedDocumentId: string;
  setSelectedDocumentId: (id: string) => void;
}) {
  const [rules, setRules] = useState<CommercialRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [metricFilter, setMetricFilter] = useState<
    "all" | "amounts" | "timelines" | "other"
  >("all");
  const [commercialTerms, setCommercialTerms] = useState<CommercialTerm[]>([]);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState("");
  const [commercialReviewNotes, setCommercialReviewNotes] = useState<Record<number, string>>({});
  const [savingCommercialRuleId, setSavingCommercialRuleId] = useState<number | null>(null);
  const [commercialReviewNotice, setCommercialReviewNotice] = useState("");

  const saveCommercialRuleReview = async (
    ruleId: number,
    status: "pending" | "reviewed" | "resolved",
    existingNotes?: string | null,
  ) => {
    if (!selectedDocumentId) {
      setCommercialReviewNotice("Please select a contract first.");
      return;
    }

    const notes = commercialReviewNotes[ruleId] ?? existingNotes ?? "";
    setSavingCommercialRuleId(ruleId);
    setCommercialReviewNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${encodeURIComponent(selectedDocumentId)}/rules/${ruleId}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status,
            notes,
            review_status: status,
            review_notes: notes,
          }),
        },
      );

      if (!response.ok) throw new Error(await response.text());
      const updated = await response.json();

      setRules((previous) =>
        previous.map((rule) =>
          rule.id === ruleId
            ? {
                ...rule,
                review_status: updated.review_status ?? status,
                review_notes: updated.review_notes ?? notes,
              }
            : rule,
        ),
      );
      setCommercialReviewNotes((previous) => ({
        ...previous,
        [ruleId]: updated.review_notes ?? notes,
      }));
      setCommercialReviewNotice("Commercial review saved successfully.");
    } catch (err) {
      console.error("Failed to save commercial rule review:", err);
      setCommercialReviewNotice("Unable to save commercial review. Please try again.");
    } finally {
      setSavingCommercialRuleId(null);
    }
  };

  useEffect(() => {
    if (!selectedDocumentId) {
      setRules([]);
      return;
    }

    let cancelled = false;

    async function loadRules() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/documents/${selectedDocumentId}/rules`,
        );

        if (!response.ok) {
          throw new Error(`Could not load contract rules (${response.status})`);
        }

        const data = await response.json();

        if (!cancelled) {
          setRules(Array.isArray(data) ? data : data.rules || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to load data");
          setRules([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRules();
    return () => {
      cancelled = true;
    };
  }, [selectedDocumentId]);

  useEffect(() => {
    if (!selectedDocumentId) {
      setCommercialTerms([]);
      setTermsError("");
      return;
    }

    let cancelled = false;

    async function loadCommercialTerms() {
      setTermsLoading(true);
      setTermsError("");

      try {
        const response = await fetch(
          `${API_URL}/api/documents/${selectedDocumentId}/terms`,
        );

        if (!response.ok) {
          throw new Error(
            `Could not load structured commercial terms (${response.status})`,
          );
        }

        const data = await response.json();
        const rows = Array.isArray(data)
          ? data
          : Array.isArray(data.terms)
            ? data.terms
            : [];

        if (!cancelled) {
          setCommercialTerms(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setCommercialTerms([]);
          setTermsError(
            err instanceof Error
              ? err.message
              : "Unable to load structured commercial terms.",
          );
        }
      } finally {
        if (!cancelled) setTermsLoading(false);
      }
    }

    loadCommercialTerms();
    return () => {
      cancelled = true;
    };
  }, [selectedDocumentId]);

  const commercialRules = useMemo(() => {
    const terms =
      /payment|price|cost|fee|tax|gst|amount|value|security|deposit|guarantee|retention|deduction|penalt|liquidated|damages|compensation|invoice|advance|interest|escalation|rate|financial|performance bank/i;

    return rules.filter((rule) =>
      terms.test(
        [
          rule.rule_type,
          rule.category,
          rule.title,
          rule.amount_or_formula,
          rule.action,
          rule.plain_language_explanation,
          rule.original_text,
        ]
          .filter(Boolean)
          .join(" "),
      ),
    );
  }, [rules]);

  const otherRules = rules.filter(
    (rule) => !commercialRules.some((commercial) => commercial.id === rule.id),
  );

  const metricRules =
    metricFilter === "amounts"
      ? commercialRules.filter((rule) => Boolean(rule.amount_or_formula))
      : metricFilter === "timelines"
        ? commercialRules.filter((rule) => Boolean(rule.deadline_or_duration))
        : metricFilter === "other"
          ? otherRules
          : commercialRules;

  const filteredRules = metricRules.filter((rule) =>
    [
      rule.title,
      rule.category,
      rule.actor,
      rule.action,
      rule.amount_or_formula,
      rule.deadline_or_duration,
      rule.plain_language_explanation,
      rule.original_text,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const countWithAmounts = commercialRules.filter(
    (r) => r.amount_or_formula,
  ).length;
  const countWithDeadlines = commercialRules.filter(
    (r) => r.deadline_or_duration,
  ).length;

  return (
    <>
      <style jsx global>{`
        .commercial-metrics-grid .metric-card .metric-top > span {
          font-size: 15px !important;
          line-height: 1.5 !important;
        }
        .commercial-metrics-grid .metric-card .metric-value {
          font-size: 30px !important;
        }
        .commercial-metrics-grid .metric-card .metric-note {
          font-size: 13px !important;
          line-height: 1.5 !important;
        }
      `}</style>
      <PageHeading
        eyebrow="INTELLIGENCE / COMMERCIAL"
        title="Commercial intelligence"
        description="Extract financial commitments and commercial conditions from the selected contract."
      />

      <section
        className="panel commercial-source-picker"
        style={{ padding: 18, marginBottom: 18 }}
      >
        <div className="panel-heading">
          <div>
            <h3 style={{ fontSize: 20 }}>Contract source</h3>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>
              Commercial findings are taken from extracted contract rules.
            </p>
          </div>
        </div>

        <select
          className="select-button"
          value={selectedDocumentId}
          onChange={(e) => setSelectedDocumentId(e.target.value)}
          style={{
            minWidth: 280,
            maxWidth: "100%",
            fontSize: 16,
            minHeight: 46,
          }}
        >
          {documents.map((doc) => (
            <option key={doc.document_id} value={doc.document_id}>
              {doc.original_filename || doc.filename}
            </option>
          ))}
        </select>
      </section>

      <div className="metrics-grid commercial-metrics-grid">
        <MetricCard
          label="Commercial rules"
          value={String(commercialRules.length)}
          note="Click to show all commercial rules"
          icon={Wallet}
          tone="blue"
          onClick={() => setMetricFilter("all")}
        />
        <MetricCard
          label="Rules with amounts"
          value={String(countWithAmounts)}
          note="Click to filter amount rules"
          icon={TrendingDown}
          tone="green"
          onClick={() =>
            setMetricFilter(metricFilter === "amounts" ? "all" : "amounts")
          }
        />
        <MetricCard
          label="Rules with timelines"
          value={String(countWithDeadlines)}
          note="Click to filter timeline rules"
          icon={Clock3}
          tone="amber"
          onClick={() =>
            setMetricFilter(metricFilter === "timelines" ? "all" : "timelines")
          }
        />
        <MetricCard
          label="Other extracted rules"
          value={String(otherRules.length)}
          note="Click to show other rules"
          icon={FileCheck2}
          tone="violet"
          onClick={() =>
            setMetricFilter(metricFilter === "other" ? "all" : "other")
          }
        />
      </div>
      <section
        className="panel commercial-results-panel"
        style={{ marginTop: 18 }}
      >
        <div className="panel-heading">
          <div>
            <h3 style={{ fontSize: 22 }}>
              Financial and commercial provisions
            </h3>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>
              Original wording, extracted amounts, conditions and consequences.
            </p>
          </div>
          <span className="status-pill">
            {loading ? "Loading..." : `${filteredRules.length} findings`}
          </span>
        </div>

        <div style={{ padding: "0 18px 16px" }}>
          <input
            className="search-input"
            placeholder="Search payment, GST, penalty, security, amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        {error && (
          <div className="demo-disclaimer" style={{ margin: 18 }}>
            {error}
          </div>
        )}

        {!loading && !error && !selectedDocumentId && (
          <div className="empty-state">
            Upload and select a contract to view commercial intelligence.
          </div>
        )}

        {!loading &&
          !error &&
          selectedDocumentId &&
          filteredRules.length === 0 && (
            <div className="empty-state" style={{ padding: 30 }}>
              {metricFilter === "other"
                ? "No other extracted rules found."
                : "No rules match this selection or search."}
            </div>
          )}

        <div style={{ display: "grid", gap: 12, padding: 18 }}>
          {filteredRules.map((rule) => (
            <article
              className="commercial-rule-card"
              key={rule.id}
              style={{
                border: "1px solid var(--border, #e5e7eb)",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 10,
                }}
              >
                <div>
                  <strong style={{ fontSize: 21, lineHeight: 1.5 }}>
                    {rule.title || rule.category || "Commercial provision"}
                  </strong>
                  <div style={{ fontSize: 15, opacity: 0.85, marginTop: 6 }}>
                    {(
                      rule.category ||
                      rule.rule_type ||
                      "Commercial"
                    ).replaceAll("_", " ")}
                    {rule.page_number ? ` · Page ${rule.page_number}` : ""}
                    {` · Rule #${rule.id}`}
                  </div>
                </div>
                <span className="status-pill">
                  {rule.review_status || "pending"}
                </span>
              </div>

              {rule.amount_or_formula && (
                <div className="commercial-amount" style={{ margin: "10px 0" }}>
                  <small
                    style={{ opacity: 0.85, fontSize: 13, fontWeight: 700 }}
                  >
                    AMOUNT / FORMULA
                  </small>
                  <div
                    style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.5 }}
                  >
                    {rule.amount_or_formula}
                  </div>
                </div>
              )}

              {rule.plain_language_explanation && (
                <p
                  className="commercial-explanation"
                  style={{ margin: "12px 0", fontSize: 17, lineHeight: 1.85 }}
                >
                  {rule.plain_language_explanation}
                </p>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                  margin: "12px 0",
                  fontSize: 13,
                }}
              >
                {rule.actor && (
                  <div>
                    <b>Responsible party</b>
                    <br />
                    {rule.actor}
                  </div>
                )}
                {rule.beneficiary && (
                  <div>
                    <b>Beneficiary</b>
                    <br />
                    {rule.beneficiary}
                  </div>
                )}
                {rule.deadline_or_duration && (
                  <div>
                    <b>Timeline</b>
                    <br />
                    {rule.deadline_or_duration}
                  </div>
                )}
                {rule.trigger_condition && (
                  <div>
                    <b>Trigger</b>
                    <br />
                    {rule.trigger_condition}
                  </div>
                )}
                {rule.consequence_or_remedy && (
                  <div>
                    <b>Consequence / remedy</b>
                    <br />
                    {rule.consequence_or_remedy}
                  </div>
                )}
                {rule.exceptions_or_qualifications && (
                  <div>
                    <b>Exceptions</b>
                    <br />
                    {rule.exceptions_or_qualifications}
                  </div>
                )}
              </div>

              {rule.original_text && (
                <details style={{ marginTop: 12 }}>
                  <summary
                    style={{ cursor: "pointer", fontWeight: 700, fontSize: 15 }}
                  >
                    View original contract wording
                  </summary>
                  <blockquote
                    className="commercial-source-text"
                    style={{
                      margin: "10px 0 0",
                      padding: 12,
                      borderLeft: "3px solid #8b7cf6",
                      background: "var(--surface-secondary, #f7f7fa)",
                      fontSize: 13,
                      lineHeight: 1.6,
                    }}
                  >
                    {rule.original_text}
                  </blockquote>
                </details>
              )}

              <div className="obligation-review-editor" style={{ marginTop: 16 }}>
                <h4>Human Review</h4>
                <textarea
                  value={commercialReviewNotes[rule.id] ?? rule.review_notes ?? ""}
                  onChange={(event) =>
                    setCommercialReviewNotes((previous) => ({
                      ...previous,
                      [rule.id]: event.target.value,
                    }))
                  }
                  placeholder="Enter commercial review notes or observations..."
                  rows={3}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #D9DEE8",
                    borderRadius: 8,
                    padding: 10,
                    font: "inherit",
                    fontSize: 13,
                  }}
                />
                <p>
                  Current status: <strong>{rule.review_status ?? "pending"}</strong>
                </p>
                <div
                  className="obligation-review-actions"
                  style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                >
                  <button
                    className="button button-outline"
                    disabled={savingCommercialRuleId === rule.id}
                    onClick={() =>
                      saveCommercialRuleReview(rule.id, "pending", rule.review_notes)
                    }
                  >
                    Save as Pending
                  </button>
                  <button
                    className="button button-outline"
                    disabled={savingCommercialRuleId === rule.id}
                    onClick={() =>
                      saveCommercialRuleReview(rule.id, "reviewed", rule.review_notes)
                    }
                  >
                    Mark Reviewed
                  </button>
                  <button
                    className="button button-outline"
                    disabled={savingCommercialRuleId === rule.id}
                    onClick={() =>
                      saveCommercialRuleReview(rule.id, "resolved", rule.review_notes)
                    }
                  >
                    Resolve
                  </button>
                </div>
                {commercialReviewNotice && (
                  <p role="status" style={{ marginTop: 8 }}>
                    {commercialReviewNotice}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" style={{ marginTop: 18 }}>
        <div className="panel-heading" style={{ padding: 18 }}>
          <div>
            <h3 style={{ fontSize: 22 }}>Structured commercial records</h3>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>
              Machine-readable values extracted from evidence-backed contract
              terms. These records are separate from the rule-based findings
              above.
            </p>
          </div>
          <span className="status-pill">
            {termsLoading
              ? "Loading..."
              : `${commercialTerms.filter((term) => term.commercial_details).length} records`}
          </span>
        </div>

        {termsError && (
          <div className="demo-disclaimer" style={{ margin: 18 }}>
            {termsError}
          </div>
        )}

        {!termsLoading &&
          !termsError &&
          selectedDocumentId &&
          commercialTerms.filter((term) => term.commercial_details).length ===
            0 && (
            <div className="empty-state" style={{ padding: 26 }}>
              No structured commercial records are available for this contract.
              Use Contract Terms Index to extract or review contract terms.
            </div>
          )}

        <div style={{ display: "grid", gap: 12, padding: 18 }}>
          {commercialTerms
            .filter((term) => term.commercial_details)
            .filter((term) => {
              const details = term.commercial_details!;
              const searchable = [
                term.term_name,
                term.term_category,
                term.clause_reference,
                term.original_text,
                term.interpretation,
                term.financial_impact,
                details.commercial_type,
                details.currency,
                details.rate_amount,
                details.rate_unit,
                details.rate_basis,
                details.percentage,
                details.index_name,
                details.indexation_frequency,
                details.fx_reference,
                details.fx_date_rule,
                details.volume_unit,
                details.payment_due_days,
                details.renewal_notice_days,
                details.exit_notice_days,
              ]
                .filter((value) => value !== null && value !== undefined)
                .join(" ")
                .toLowerCase();

              return searchable.includes(search.toLowerCase());
            })
            .map((term) => {
              const details = term.commercial_details!;
              const fields: Array<
                [string, string | number | null | undefined]
              > = [
                ["Commercial type", details.commercial_type],
                [
                  "Rate / amount",
                  details.rate_amount == null
                    ? null
                    : [
                        details.currency,
                        details.rate_amount,
                        details.rate_unit ? `/ ${details.rate_unit}` : null,
                      ]
                        .filter(Boolean)
                        .join(" "),
                ],
                ["Rate basis", details.rate_basis],
                [
                  "Percentage",
                  details.percentage == null ? null : `${details.percentage}%`,
                ],
                ["Index name", details.index_name],
                ["Index base value", details.index_base_value],
                ["Indexation frequency", details.indexation_frequency],
                [
                  "Indexation cap",
                  details.indexation_cap_pct == null
                    ? null
                    : `${details.indexation_cap_pct}%`,
                ],
                [
                  "Indexation floor",
                  details.indexation_floor_pct == null
                    ? null
                    : `${details.indexation_floor_pct}%`,
                ],
                ["FX reference", details.fx_reference],
                ["FX date rule", details.fx_date_rule],
                ["Minimum volume", details.volume_min],
                ["Maximum volume", details.volume_max],
                ["Volume unit", details.volume_unit],
                [
                  "Payment due",
                  details.payment_due_days == null
                    ? null
                    : `${details.payment_due_days} days`,
                ],
                [
                  "Renewal notice",
                  details.renewal_notice_days == null
                    ? null
                    : `${details.renewal_notice_days} days`,
                ],
                [
                  "Exit notice",
                  details.exit_notice_days == null
                    ? null
                    : `${details.exit_notice_days} days`,
                ],
              ];
              const visibleFields = fields.filter(
                ([, value]) =>
                  value !== null && value !== undefined && value !== "",
              );

              return (
                <article
                  key={term.id}
                  style={{
                    border: "1px solid var(--border, #e5e7eb)",
                    borderRadius: 12,
                    padding: 16,
                    background: "var(--surface, #fff)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: 19, lineHeight: 1.5 }}>
                        {term.term_name ||
                          term.term_category ||
                          "Commercial term"}
                      </strong>
                      <div style={{ fontSize: 13, opacity: 0.8, marginTop: 5 }}>
                        {(term.term_category || "Commercial").replaceAll(
                          "_",
                          " ",
                        )}
                        {term.clause_reference
                          ? ` ? Clause ${term.clause_reference}`
                          : ""}
                        {term.page_number ? ` ? Page ${term.page_number}` : ""}
                        {` ? Term #${term.id}`}
                      </div>
                    </div>
                    <span className="status-pill">
                      {term.review_status || "pending"}
                    </span>
                  </div>

                  {visibleFields.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(170px, 1fr))",
                        gap: 14,
                        margin: "14px 0",
                      }}
                    >
                      {visibleFields.map(([label, value]) => (
                        <div key={label}>
                          <div
                            style={{
                              fontSize: 11,
                              color: "var(--muted, #64748b)",
                              marginBottom: 4,
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {String(value)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(term.effective_date ||
                    term.expiry_date ||
                    term.financial_impact) && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(170px, 1fr))",
                        gap: 12,
                        fontSize: 13,
                        margin: "12px 0",
                      }}
                    >
                      {term.effective_date && (
                        <div>
                          <b>Effective date</b>
                          <div>{term.effective_date}</div>
                        </div>
                      )}
                      {term.expiry_date && (
                        <div>
                          <b>Expiry date</b>
                          <div>{term.expiry_date}</div>
                        </div>
                      )}
                      {term.financial_impact && (
                        <div>
                          <b>Financial impact</b>
                          <div>{term.financial_impact}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {term.interpretation && (
                    <p
                      style={{
                        fontSize: 14,
                        lineHeight: 1.7,
                        margin: "12px 0",
                      }}
                    >
                      {term.interpretation}
                    </p>
                  )}

                  {term.review_notes && (
                    <div style={{ fontSize: 13, marginTop: 10 }}>
                      <b>Review note</b>
                      <p style={{ margin: "4px 0", lineHeight: 1.6 }}>
                        {term.review_notes}
                      </p>
                    </div>
                  )}

                  {term.original_text && (
                    <details style={{ marginTop: 12 }}>
                      <summary
                        style={{
                          cursor: "pointer",
                          fontWeight: 700,
                          fontSize: 14,
                        }}
                      >
                        View original contract wording
                      </summary>
                      <blockquote
                        style={{
                          margin: "10px 0 0",
                          padding: 12,
                          borderLeft: "3px solid #8b7cf6",
                          background: "var(--surface-secondary, #f7f7fa)",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        {term.original_text}
                      </blockquote>
                    </details>
                  )}
                </article>
              );
            })}
        </div>
      </section>

      <div className="demo-disclaimer" style={{ marginTop: 16 }}>
        <Wallet size={14} />
        System extracts contract provisions; it does not calculate actual
        invoice payments, savings or financial exposure without verified source
        data.
      </div>
    </>
  );
}
function AssistantView({
  chatInput,
  setChatInput,
  documents,
  selectedDocumentId,
  setSelectedDocumentId,
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
  const requestSequenceRef = useRef(0);

  const prompts = [
    "What is the total contract value?",
    "Who are the contracting parties?",
    "What is the payment period?",
    "What are the termination conditions?",
    "What is the liability cap?",
    "What information is missing from this contract?",
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isThinking]);

  const selectedDocument = documents.find(
    (doc) => doc.document_id === selectedDocumentId,
  );

  const send = async (value: string) => {
    const question = value.trim();

    if (!question || isThinking) return;

    if (documents.length > 0 && !selectedDocumentId) {
      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            "Please select a contract before asking a document-specific question.",
        },
      ]);
      return;
    }

    const requestId = ++requestSequenceRef.current;
    const requestDocumentId = selectedDocumentId;

    setMessages((previous) => [
      ...previous,
      { role: "user", content: question },
    ]);

    setChatInput("");
    setIsThinking(true);

    try {
      const url = requestDocumentId
        ? `${API_URL}/api/documents/${encodeURIComponent(requestDocumentId)}/ask`
        : `${API_URL}/api/chat`;

      const body = requestDocumentId ? { question } : { message: question };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            data?.message ||
            `Request failed (${response.status}).`,
        );
      }

      if (requestId !== requestSequenceRef.current) return;

      const answer = data?.answer || data?.response;

      if (typeof answer !== "string" || !answer.trim()) {
        throw new Error(
          "The assistant returned an empty response. Please try again.",
        );
      }

      setBackendOnline(true);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: answer,
          sources: Array.isArray(data?.sources) ? data.sources : [],
        },
      ]);
    } catch (error) {
      if (requestId !== requestSequenceRef.current) return;

      setBackendOnline(false);

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Could not connect to ContractIQ.",
        },
      ]);
    } finally {
      if (requestId === requestSequenceRef.current) {
        setIsThinking(false);
      }
    }
  };

  const statusText =
    backendOnline === null
      ? "Heron IDP Intelligence"
      : backendOnline
        ? "HeronIDP · Connected"
        : "HeronIDP · Connection error";

  return (
    <>
      <style jsx global>{`
        .commercial-metrics-grid .metric-card .metric-top > span {
          font-size: 15px !important;
          line-height: 1.5 !important;
        }
        .commercial-metrics-grid .metric-card .metric-value {
          font-size: 30px !important;
        }
        .commercial-metrics-grid .metric-card .metric-note {
          font-size: 13px !important;
          line-height: 1.5 !important;
        }
      `}</style>
      <PageHeading
        eyebrow="HeronIDP WORKSPACE / COPILOT"
        title="HeronIDP contract assistant"
        description="Ask questions and retrieve evidence from your uploaded agreements."
      />

      {/* assistant contract font update */}
      <style jsx global>{`
        .document-selector label {
          font-size: 13px !important;
          font-weight: 700 !important;
          letter-spacing: 0.06em;
        }
        .document-selector select {
          font-size: 17px !important;
          min-height: 48px;
          padding: 12px 14px !important;
          line-height: 1.5;
        }
        .document-selector select option {
          font-size: 16px;
        }
        .document-selector small {
          display: block;
          font-size: 13px !important;
          line-height: 1.6;
          margin-top: 8px;
        }
      `}</style>
      <style jsx global>{`
        .assistant-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 290px;
          gap: 22px;
          align-items: start;
          max-width: 1440px;
          margin: 0 auto;
        }

        .assistant-main {
          min-width: 0;
          padding: 24px;
          background: #ffffff;
          border: 1px solid #e5eaf1;
          border-radius: 18px;
          box-shadow: 0 5px 22px rgba(20, 35, 60, 0.045);
        }

        .assistant-welcome {
          text-align: center;
          padding: 22px 15px 26px;
        }

        .assistant-orb {
          width: 54px;
          height: 54px;
          margin: 0 auto 15px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: #087f78;
          background: linear-gradient(135deg, #e0f7f2, #eef2ff);
        }

        .assistant-welcome h2 {
          font-size: 25px;
          font-weight: 750;
          letter-spacing: -0.7px;
          color: #172b45;
          margin: 0 0 9px;
        }

        .assistant-welcome p {
          max-width: 490px;
          margin: 0 auto 15px;
          color: #718096;
          font-size: 14px;
          line-height: 1.7;
        }

        .demo-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 13px;
          border-radius: 30px;
          background: #eaf7f3;
          color: #087f70;
          font-size: 12px;
          font-weight: 650;
        }

        .document-selector {
          padding: 19px;
          border: 1px solid #e3e9f0;
          border-radius: 13px;
          background: #f9fbfd;
          margin-bottom: 22px;
        }

        .document-selector label {
          display: block;
          color: #42536a;
          font-size: 11px !important;
          font-weight: 750 !important;
          letter-spacing: 0.08em;
          margin-bottom: 10px;
        }

        .document-selector select {
          width: 100%;
          min-height: 48px;
          padding: 11px 14px !important;
          border: 1px solid #d9e2ec;
          border-radius: 9px;
          background: #fff;
          color: #24364d;
          font-size: 14px !important;
        }

        .document-selector small {
          display: block;
          margin-top: 10px;
          color: #718096;
          font-size: 12px !important;
        }

        .chat-history {
          display: flex;
          flex-direction: column;
          gap: 17px;
          margin: 20px 0;
        }

        .user-message,
        .assistant-message {
          max-width: 90%;
          padding: 16px 18px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.75;
          overflow-wrap: anywhere;
        }

        .user-message {
          align-self: flex-end;
          background: #edf2ff;
          color: #283c65;
          border: 1px solid #e0e7ff;
          border-bottom-right-radius: 4px;
        }

        .assistant-message {
          align-self: flex-start;
          background: #ffffff;
          color: #34445a;
          border: 1px solid #e2e8f0;
          border-bottom-left-radius: 4px;
          box-shadow: 0 3px 12px rgba(20, 35, 60, 0.035);
        }

        .message-label {
          margin-bottom: 9px;
          color: #087f78;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0.03em;
        }

        .user-message .message-label {
          color: #6474a6;
        }

        .evidence-list {
          margin-top: 17px;
          padding-top: 14px;
          border-top: 1px solid #e7edf3;
        }

        .evidence-list > b {
          display: block;
          margin-bottom: 10px;
          color: #34445a;
          font-size: 12px;
        }

        .evidence-item {
          padding: 13px;
          margin-top: 9px;
          background: #f5f8fc;
          border: 1px solid #e4ebf3;
          border-left: 3px solid #159989;
          border-radius: 8px;
        }

        .evidence-item b {
          color: #087f78;
          font-size: 12px;
        }

        .evidence-item p {
          margin: 7px 0;
          color: #46566b;
          font-size: 13px;
          line-height: 1.7;
        }

        .evidence-item small {
          color: #8793a5;
          font-size: 11px;
        }

        .prompt-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
          margin: 20px 0;
        }

        .prompt-grid button {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 8px;
          padding: 12px 14px;
          border: 1px solid #e0e7ef;
          border-radius: 9px;
          background: #fff;
          color: #43556d;
          font-size: 12px;
          text-align: left;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .prompt-grid button:hover {
          border-color: #159989;
          background: #f0faf7;
          color: #087f78;
        }

        .chat-composer {
          display: flex;
          gap: 10px;
          padding: 8px;
          border: 1px solid #dce5ed;
          border-radius: 12px;
          background: #fff;
          box-shadow: 0 4px 15px rgba(20, 35, 60, 0.045);
        }

        .chat-composer input {
          flex: 1;
          min-width: 0;
          padding: 11px;
          border: 0;
          outline: none;
          background: transparent;
          color: #26384e;
          font-size: 13px;
        }

        .chat-composer .send-button {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          border: 0;
          border-radius: 9px;
          background: #087f78;
          color: white;
          cursor: pointer;
        }

        .chat-composer .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .assistant-footnote {
          margin-top: 15px;
          color: #8995a5;
          font-size: 11px;
          line-height: 1.7;
        }

        .assistant-side {
          position: sticky;
          top: 20px;
          padding: 21px;
          border: 1px solid #e3e9f0;
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 5px 20px rgba(20, 35, 60, 0.04);
        }

        .assistant-side h3 {
          margin: 0 0 16px;
          color: #24364d;
          font-size: 16px;
        }

        .topic-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 5px;
          border-bottom: 1px solid #edf1f5;
          color: #52647a;
          font-size: 13px;
        }

        .topic-link svg:last-child {
          margin-left: auto;
          color: #9aa7b7;
        }

        .assistant-note {
          margin-top: 20px;
          padding: 16px;
          border: 1px solid #e6e8ff;
          border-radius: 11px;
          background: #f5f5ff;
          color: #5966a3;
        }

        .assistant-note b {
          margin-left: 7px;
          font-size: 12px;
        }

        .assistant-note p {
          margin: 9px 0 0;
          color: #687394;
          font-size: 11px;
          line-height: 1.7;
        }

        @media (max-width: 850px) {
          .assistant-layout {
            grid-template-columns: 1fr;
          }

          .assistant-side {
            position: static;
          }
        }

        @media (max-width: 550px) {
          .assistant-main {
            padding: 14px;
          }

          .assistant-welcome h2 {
            font-size: 21px;
          }

          .prompt-grid {
            grid-template-columns: 1fr;
          }

          .user-message,
          .assistant-message {
            max-width: 100%;
          }
        }
      `}</style>
      <div className="assistant-layout">
        <div className="assistant-main">
          <div className="assistant-welcome">
            <div className="assistant-orb">
              <Sparkles size={25} />
            </div>

            <h2>Your contract intelligence</h2>

            <p>
              Ask questions about your agreements and receive answers with
              supporting evidence.
            </p>

            <span className="demo-tag">
              <Activity size={12} />
              {statusText}
            </span>
          </div>

          <div className="document-selector panel">
            <label htmlFor="contract-select">SELECT CONTRACT</label>

            <select
              id="contract-select"
              value={selectedDocumentId}
              onChange={(e) => {
                requestSequenceRef.current += 1;
                setIsThinking(false);
                setSelectedDocumentId(e.target.value);
                setMessages([]);
              }}
            >
              <option value="">
                {documents.length === 0
                  ? "No indexed contracts available"
                  : "Select a contract"}
              </option>

              {documents.map((doc) => (
                <option key={doc.document_id} value={doc.document_id}>
                  {doc.filename}
                </option>
              ))}
            </select>

            {selectedDocument && (
              <small>
                {selectedDocument.pages_indexed} pages ·
                {selectedDocument.chunks_created} text chunks · Indexed
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
                    {message.role === "user" ? "You" : "ContractIQ · Heron IDP"}
                  </div>

                  <div>{message.content}</div>

                  {message.sources && message.sources.length > 0 && (
                    <div className="evidence-list">
                      <b>Supporting contract evidence</b>

                      {message.sources.map(
                        (source: ChatSource, sourceIndex: number) => (
                          <div className="evidence-item" key={sourceIndex}>
                            <b>Page {source.page}</b>

                            <p>{source.text}</p>

                            <small>
                              Retrieval similarity: {source.similarity}
                            </small>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="assistant-message">
                  <div className="message-label">ContractIQ · HeronAI IDP</div>
                  <div>Reviewing contract evidence...</div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}

          <div className="prompt-grid">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => send(prompt)}
                disabled={isThinking || !selectedDocumentId}
              >
                {prompt}
                <ArrowUpRight size={14} />
              </button>
            ))}
          </div>

          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              send(chatInput);
            }}
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about the selected contract..."
              disabled={isThinking}
            />

            <button
              className="send-button"
              type="submit"
              disabled={isThinking || !selectedDocumentId}
            >
              <ArrowRight size={17} />
            </button>
          </form>

          <div className="assistant-footnote">
            Answers are generated using Heron IDP Intelligence and retrieved
            contract passages.
          </div>
        </div>

        <aside className="assistant-side panel">
          <h3>Suggested topics</h3>

          {[
            {
              icon: ShieldAlert,
              label: "Risk exposure",
              prompt:
                "What are the key risks and potential liabilities in this contract?",
            },
            {
              icon: CalendarDays,
              label: "Renewal terms",
              prompt:
                "What are the renewal dates, notice periods and termination conditions?",
            },
            {
              icon: Wallet,
              label: "Commercial terms",
              prompt:
                "Summarize the contract value, payment terms, fees and financial obligations.",
            },
            {
              icon: FileSearch,
              label: "Clause search",
              prompt:
                "Identify and explain the important clauses in this contract.",
            },
          ].map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              type="button"
              className="topic-link"
              onClick={() => send(prompt)}
              disabled={isThinking || !selectedDocumentId}
              style={{
                width: "100%",
                border: 0,
                borderBottom: "1px solid #edf1f5",
                background: "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Icon size={16} />
              {label}
              <ChevronRight size={15} />
            </button>
          ))}

          <div className="assistant-note">
            <Sparkles size={16} />
            <b>Evidence-backed answers</b>
            <p>
              ContractIQ retrieves relevant passages from the selected agreement
              and shows supporting page references.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

type ContractAnalysisResult = {
  contract_overview?: any;
  financial_terms?: any[];
  key_clauses?: any[];
  obligations?: any[];
  risk_assessment?: any[];
  important_dates?: any[];
  missing_information?: any[];
};

function AnalysisView({
  onUpload,
  documents,
  selectedDocumentId,
  setSelectedDocumentId,
  setActive,
}: {
  onUpload: () => void;
  documents: IndexedDocument[];
  selectedDocumentId: string;
  setSelectedDocumentId: (id: string) => void;
  setActive: (section: Section) => void;
}) {
  const [analysis, setAnalysis] = useState<ContractAnalysisResult | null>(null);
  const [analysisId, setAnalysisId] = useState<number | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selected = documents.find((d) => d.document_id === selectedDocumentId);
  const show = (v: unknown) =>
    v === null || v === undefined || v === "" ? "Not specified" : String(v);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setAnalysis(null);
      setAnalysisId(null);
      setError("");
      setNotice("");
      if (!selectedDocumentId) return;
      setLoadingSaved(true);
      try {
        const response = await fetch(
          `${API_URL}/api/documents/${encodeURIComponent(selectedDocumentId)}/analysis`,
        );
        const data = await response.json();
        if (response.status === 404) {
          if (!cancelled)
            setNotice(
              "No saved analysis yet. Select Analyse Contract to run it.",
            );
          return;
        }
        if (!response.ok)
          throw new Error(data.detail || "Could not load saved analysis.");
        if (!cancelled) {
          setAnalysis(data.analysis || null);
          setAnalysisId(data.analysis_id ?? null);
        }
        setNotice("Saved analysis loaded from PostgreSQL.");
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : "Could not load saved analysis.",
          );
      } finally {
        if (!cancelled) setLoadingSaved(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [selectedDocumentId]);

  const runAnalysis = async () => {
    if (!selectedDocumentId || running) return;
    setRunning(true);
    setError("");
    setNotice("");
    setAnalysis(null);
    setAnalysisId(null);
    try {
      const response = await fetch(
        `${API_URL}/api/documents/${encodeURIComponent(selectedDocumentId)}/analyse`,
        {
          method: "POST",
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || "Contract analysis failed.");
      setAnalysis(data.analysis || null);
      setAnalysisId(data.analysis_id ?? null);
      setNotice("Analysis completed and saved in PostgreSQL.");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not analyse this contract.",
      );
    } finally {
      setRunning(false);
    }
  };

  const Section = ({
    title,
    subtitle,
    children,
  }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
  }) => (
    <section className="panel" style={{ padding: 22, marginBottom: 18 }}>
      <div className="panel-heading">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );

  return (
    <>
      <style jsx global>{`
        .commercial-metrics-grid .metric-card .metric-top > span {
          font-size: 15px !important;
          line-height: 1.5 !important;
        }
        .commercial-metrics-grid .metric-card .metric-value {
          font-size: 30px !important;
        }
        .commercial-metrics-grid .metric-card .metric-note {
          font-size: 13px !important;
          line-height: 1.5 !important;
        }
      `}</style>
      <PageHeading
        eyebrow="WORKSPACE / CONTRACT INTELLIGENCE"
        title="Contract intelligence & analysis"
        description="Review extracted contract terms, obligations, key clauses, important dates and potential risks from your indexed agreements."
        action={
          <button className="button button-primary" onClick={onUpload}>
            <Upload size={15} /> Upload document
          </button>
        }
      />

      <section className="panel" style={{ padding: 22, marginBottom: 20 }}>
        <label
          htmlFor="analysis-contract-select"
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 9,
          }}
        >
          SELECT AN INDEXED CONTRACT
        </label>
        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "end",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 280px" }}>
            <select
              id="analysis-contract-select"
              value={selectedDocumentId}
              onChange={(e) => setSelectedDocumentId(e.target.value)}
              disabled={!documents.length || running}
              style={{
                width: "100%",
                maxWidth: 520,
                padding: "12px 14px",
                border: "1px solid #E2E6EE",
                borderRadius: 9,
                background: "#fff",
              }}
            >
              <option value="">Select a contract</option>
              {documents.map((doc) => (
                <option key={doc.document_id} value={doc.document_id}>
                  {doc.filename}
                </option>
              ))}
            </select>
            {selected && (
              <p style={{ margin: "8px 0 0", color: "#7C8799", fontSize: 12 }}>
                {selected.pages_indexed} pages · {selected.chunks_created}{" "}
                chunks · {selected.status}
              </p>
            )}
          </div>
          <button
            className="button button-primary"
            onClick={runAnalysis}
            disabled={!selectedDocumentId || running || loadingSaved}
          >
            <Sparkles size={15} />
            {running ? "Analysing contract…" : "Analyse Contract"}
          </button>
        </div>
        {!documents.length && (
          <p style={{ color: "#7C8799", fontSize: 13 }}>
            No indexed contracts available. Upload a PDF to get started.
          </p>
        )}
        {loadingSaved && (
          <p role="status" style={{ fontSize: 13, color: "#687386" }}>
            Checking PostgreSQL for a saved analysis…
          </p>
        )}
        {running && (
          <p role="status" style={{ fontSize: 13, color: "#687386" }}>
            Heron IDP is analysing the selected contract. This may take a
            moment.
          </p>
        )}
        {notice && (
          <p role="status" style={{ fontSize: 13, color: "#16845D" }}>
            {notice}
            {analysisId ? ` Analysis #${analysisId}.` : ""}
          </p>
        )}
        {error && (
          <p role="alert" style={{ fontSize: 13, color: "#B42318" }}>
            {error}
          </p>
        )}
      </section>

      {analysis && (
        <>
          <section
            className="panel"
            aria-label="Analysis summary"
            style={{
              padding: "16px 20px",
              marginBottom: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 0, flex: "1 1 240px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <CheckCircle2 size={16} color="#16845D" />
                <strong style={{ fontSize: 13 }}>Analysis available</strong>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "#687386",
                  overflowWrap: "anywhere",
                }}
              >
                {selected?.filename || "Selected contract"}
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                fontSize: 12,
                color: "#687386",
              }}
            >
              <span>{selected?.pages_indexed ?? 0} indexed pages</span>
              <span>{selected?.chunks_created ?? 0} text chunks</span>
              {analysisId !== null && <span>Analysis #{analysisId}</span>}
            </div>
          </section>
          <div className="metrics-grid compact-metrics">
            <button
              type="button"
              title="Open Financial and Commercial Terms"
              onClick={() => setActive("Financial & Commercial Terms")}
              style={{
                width: "100%",
                border: 0,
                padding: 0,
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 12,
              }}
            >
              <MetricCard
                label="Contract value"
                value={show(analysis.contract_overview?.contract_value)}
                note={show(analysis.contract_overview?.currency)}
                icon={Wallet}
                tone="blue"
              />
            </button>
            <button
              type="button"
              title="Review Contract Terms"
              onClick={() => setActive("Clause & Condition Review")}
              style={{
                width: "100%",
                border: 0,
                padding: 0,
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 12,
              }}
            >
              <MetricCard
                label="Key clauses"
                value={analysis.key_clauses?.length ?? 0}
                note="Extracted clauses"
                icon={FileSearch}
                tone="violet"
              />
            </button>
            <button
              type="button"
              title="Open Contractual Obligations"
              onClick={() => setActive("Contractual Obligations")}
              style={{
                width: "100%",
                border: 0,
                padding: 0,
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 12,
              }}
            >
              <MetricCard
                label="Obligations"
                value={analysis.obligations?.length ?? 0}
                note="Identified commitments"
                icon={FileCheck2}
                tone="green"
              />
            </button>
            <button
              type="button"
              title="Open Contract Risk Assessment"
              onClick={() => setActive("Contract Risk Assessment")}
              style={{
                width: "100%",
                border: 0,
                padding: 0,
                background: "transparent",
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 12,
              }}
            >
              <MetricCard
                label="Potential risks"
                value={analysis.risk_assessment?.length ?? 0}
                note="For human review"
                icon={ShieldAlert}
                tone="amber"
              />
            </button>
          </div>

          <Section
            title="Contract overview"
            subtitle={show(analysis.contract_overview?.contract_type)}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                gap: 16,
              }}
            >
              <div>
                <small>Parties</small>
                <p>
                  {analysis.contract_overview?.parties
                    ?.map(
                      (p: any) =>
                        `${p.party_name || "Party"} (${p.party_type || "Role"})`,
                    )
                    .join(", ") || "Not specified"}
                </p>
              </div>
              <div>
                <small>Effective date</small>
                <p>{show(analysis.contract_overview?.effective_date)}</p>
              </div>
              <div>
                <small>Expiry date</small>
                <p>{show(analysis.contract_overview?.expiry_date)}</p>
              </div>
            </div>
          </Section>

          <Section
            title="Financial terms"
            subtitle="Commercial amounts extracted from the contract"
          >
            {analysis.financial_terms?.length ? (
              analysis.financial_terms.map((x: any, i: number) => (
                <div
                  key={i}
                  style={{ padding: "12px 0", borderTop: "1px solid #EDF0F5" }}
                >
                  <b>
                    {x.description || "Financial term"} · {show(x.amount)}
                  </b>
                  <p>Payment condition: {show(x.payment_condition)}</p>
                  {x.evidence && <blockquote>{x.evidence}</blockquote>}
                </div>
              ))
            ) : (
              <p>No financial terms were extracted.</p>
            )}
          </Section>

          <div className="dashboard-grid">
            <Section
              title="Key clauses"
              subtitle="Clause summaries and source evidence"
            >
              {analysis.key_clauses?.length ? (
                analysis.key_clauses.map((x: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 0",
                      borderTop: "1px solid #EDF0F5",
                    }}
                  >
                    <b>{x.clause_name || "Clause"}</b>
                    <p>{x.summary}</p>
                    <small>
                      {x.page_number
                        ? `Page ${x.page_number}`
                        : "Page not identified"}
                    </small>
                    {x.evidence && <blockquote>{x.evidence}</blockquote>}
                  </div>
                ))
              ) : (
                <p>No clauses were extracted.</p>
              )}
            </Section>
            <Section
              title="Contractual Obligations"
              subtitle="Responsibilities identified in the agreement"
            >
              {analysis.obligations?.length ? (
                analysis.obligations.map((x: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 0",
                      borderTop: "1px solid #EDF0F5",
                    }}
                  >
                    <b>{x.responsible_party || "Responsible party"}</b>
                    <p>{x.obligation}</p>
                    <small>
                      Deadline: {show(x.deadline)}
                      {x.page_number ? ` · Page ${x.page_number}` : ""}
                    </small>
                    {x.evidence && <blockquote>{x.evidence}</blockquote>}
                  </div>
                ))
              ) : (
                <p>No obligations were extracted.</p>
              )}
            </Section>
          </div>

          <div className="dashboard-grid" style={{ marginTop: 18 }}>
            <Section
              title="Risk assessment"
              subtitle="Potential issues requiring human review"
            >
              {analysis.risk_assessment?.length ? (
                analysis.risk_assessment.map((x: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 0",
                      borderTop: "1px solid #EDF0F5",
                    }}
                  >
                    <b>{x.risk || "Potential risk"}</b>{" "}
                    <span
                      className={`risk-pill ${(x.severity || "medium").toLowerCase()}`}
                    >
                      {x.severity || "Unrated"}
                    </span>
                    <p>{x.explanation}</p>
                    {x.evidence && <blockquote>{x.evidence}</blockquote>}
                  </div>
                ))
              ) : (
                <p>
                  No qualifying risks were identified by this analysis. This
                  does not guarantee the contract is risk-free.
                </p>
              )}
            </Section>
            <Section
              title="Important dates"
              subtitle="Dates explicitly identified in the contract"
            >
              {analysis.important_dates?.length ? (
                analysis.important_dates.map((x: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      padding: "12px 0",
                      borderTop: "1px solid #EDF0F5",
                    }}
                  >
                    <b>{x.event || "Contract event"}</b>
                    <p>
                      {show(x.date)} · Notice period: {show(x.notice_period)}
                    </p>
                  </div>
                ))
              ) : (
                <p>No explicit important dates were extracted.</p>
              )}
            </Section>
          </div>

          <Section
            title="Missing information"
            subtitle="Items not found in the supplied contract text"
          >
            {analysis.missing_information?.length ? (
              analysis.missing_information.map((x: any, i: number) => (
                <div
                  key={i}
                  style={{ padding: "10px 0", borderTop: "1px solid #EDF0F5" }}
                >
                  <b>{x.description || x.event || "Unspecified information"}</b>
                  {x.explanation && <p>{x.explanation}</p>}
                </div>
              ))
            ) : (
              <p>No missing information was reported.</p>
            )}
          </Section>
          <div className="demo-disclaimer">
            <ShieldAlert size={14} /> Generated extraction is a review aid, not
            legal advice. Verify findings against the original contract.
          </div>
        </>
      )}

      {!analysis &&
        !loadingSaved &&
        !running &&
        selectedDocumentId &&
        !error && (
          <div className="analysis-intro">
            <div className="analysis-illustration">
              <FileSearch size={32} />
              <Sparkles size={17} />
            </div>
            <div>
              <h2>Ready to analyse this contract</h2>
              <p>
                Run Heron IDP to extract the overview, financial terms, clauses,
                obligations, potential risks and important dates. Results will
                be saved in PostgreSQL.
              </p>
            </div>
          </div>
        )}
    </>
  );
}

type ComparisonRule = {
  id: number;
  clause_id: number;
  rule_type: string;
  category: string | null;
  title: string;
  actor: string | null;
  beneficiary: string | null;
  modality: string | null;
  action: string | null;
  trigger_condition: string | null;
  deadline_or_duration: string | null;
  amount_or_formula: string | null;
  exceptions_or_qualifications: string | null;
  consequence_or_remedy: string | null;
  original_text: string;
  plain_language_explanation: string;
  page_number: number | null;
  review_status: string;
};

function ComparisonView({ documents }: { documents: IndexedDocument[] }) {
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const [leftRules, setLeftRules] = useState<ComparisonRule[]>([]);
  const [rightRules, setRightRules] = useState<ComparisonRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [compared, setCompared] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!leftId && documents.length) setLeftId(documents[0].document_id);
    if (!rightId && documents.length > 1) setRightId(documents[1].document_id);
  }, [documents, leftId, rightId]);

  const normalise = (value: string | null | undefined) =>
    (value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const fetchRules = async (id: string): Promise<ComparisonRule[]> => {
    const response = await fetch(`${API_URL}/api/documents/${id}/rules`);
    if (!response.ok)
      throw new Error(`Could not load rules for contract (${response.status})`);
    const data = await response.json();
    return Array.isArray(data) ? data : data.rules || [];
  };

  async function runComparison() {
    if (!leftId || !rightId || leftId === rightId) {
      setError("Select two different contracts.");
      return;
    }

    setLoading(true);
    setError("");
    setCompared(false);

    try {
      const [a, b] = await Promise.all([
        fetchRules(leftId),
        fetchRules(rightId),
      ]);
      setLeftRules(a);
      setRightRules(b);
      setCompared(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed.");
    } finally {
      setLoading(false);
    }
  }

  const comparison = useMemo(() => {
    const keyFor = (r: ComparisonRule) =>
      normalise(r.category || r.rule_type) +
      "|" +
      normalise(r.title || r.action || r.plain_language_explanation);

    const leftMap = new Map<string, ComparisonRule[]>();
    const rightMap = new Map<string, ComparisonRule[]>();

    leftRules.forEach((r) => {
      const key = keyFor(r);
      leftMap.set(key, [...(leftMap.get(key) || []), r]);
    });

    rightRules.forEach((r) => {
      const key = keyFor(r);
      rightMap.set(key, [...(rightMap.get(key) || []), r]);
    });

    const keys = Array.from(new Set([...leftMap.keys(), ...rightMap.keys()]));

    return keys.map((key) => {
      const a = leftMap.get(key)?.[0] || null;
      const b = rightMap.get(key)?.[0] || null;

      let status = "matching";
      if (!a) status = "only-right";
      else if (!b) status = "only-left";
      else {
        const fields: (keyof ComparisonRule)[] = [
          "actor",
          "beneficiary",
          "modality",
          "action",
          "trigger_condition",
          "deadline_or_duration",
          "amount_or_formula",
          "exceptions_or_qualifications",
          "consequence_or_remedy",
        ];
        if (
          fields.some(
            (field) =>
              normalise(String(a[field] ?? "")) !==
              normalise(String(b[field] ?? "")),
          )
        ) {
          status = "different";
        }
      }

      return { key, a, b, status };
    });
  }, [leftRules, rightRules]);

  const visible = comparison.filter(
    (item) => filter === "all" || item.status === filter,
  );
  const leftName =
    documents.find((d) => d.document_id === leftId)?.original_filename ||
    documents.find((d) => d.document_id === leftId)?.filename ||
    "Contract A";
  const rightName =
    documents.find((d) => d.document_id === rightId)?.original_filename ||
    documents.find((d) => d.document_id === rightId)?.filename ||
    "Contract B";

  const statusLabel = (status: string) =>
    ({
      matching: "Matching rule",
      different: "Different terms",
      "only-left": "Only in first contract",
      "only-right": "Only in second contract",
    })[status] || status;

  return (
    <>
      <PageHeading
        eyebrow="INTELLIGENCE / COMPARISON"
        title="Contract comparison"
        description="Compare extracted contractual rules across two indexed contracts."
      />

      <section
        className="panel comparison-selector-panel"
        style={{ padding: 18, marginBottom: 18 }}
      >
        <div className="panel-heading">
          <div>
            <h3 style={{ fontSize: 21 }}>Select contracts</h3>
            <p style={{ fontSize: 15, lineHeight: 1.7 }}>
              Choose two different indexed contracts to compare their extracted
              rules.
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: 14,
          }}
        >
          <label>
            <span
              style={{
                display: "block",
                marginBottom: 7,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              First contract
            </span>
            <select
              className="select-button"
              style={{ fontSize: 15, minHeight: 44 }}
              value={leftId}
              onChange={(e) => {
                setLeftId(e.target.value);
                setCompared(false);
              }}
            >
              <option value="">Select contract</option>
              {documents.map((d) => (
                <option key={d.document_id} value={d.document_id}>
                  {d.original_filename || d.filename}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span
              style={{
                display: "block",
                marginBottom: 7,
                fontSize: 16,
                fontWeight: 700,
              }}
            >
              Second contract
            </span>
            <select
              className="select-button"
              style={{ fontSize: 15, minHeight: 44 }}
              value={rightId}
              onChange={(e) => {
                setRightId(e.target.value);
                setCompared(false);
              }}
            >
              <option value="">Select contract</option>
              {documents.map((d) => (
                <option key={d.document_id} value={d.document_id}>
                  {d.original_filename || d.filename}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          className="button button-primary"
          style={{ marginTop: 16 }}
          onClick={runComparison}
          disabled={loading || !leftId || !rightId || leftId === rightId}
        >
          {loading ? "Comparing..." : "Compare contracts"}
          <ArrowRight size={15} />
        </button>

        {error && <p style={{ color: "#c44", marginTop: 12 }}>{error}</p>}
      </section>

      {compared && (
        <>
          <div className="metrics-grid">
            <MetricCard
              label="Rules in first contract"
              value={String(leftRules.length)}
              note={leftName}
              icon={FileText}
              tone="blue"
            />
            <MetricCard
              label="Rules in second contract"
              value={String(rightRules.length)}
              note={rightName}
              icon={FileText}
              tone="violet"
            />
            <MetricCard
              label="Different terms"
              value={String(
                comparison.filter((x) => x.status === "different").length,
              )}
              note="Matched categories with differing fields"
              icon={AlertTriangle}
              tone="amber"
            />
            <MetricCard
              label="Contract-specific rules"
              value={String(
                comparison.filter(
                  (x) => x.status === "only-left" || x.status === "only-right",
                ).length,
              )}
              note="No matching extracted rule found"
              icon={FileSearch}
              tone="green"
            />
          </div>

          <section
            className="panel comparison-results-panel"
            style={{ marginTop: 18 }}
          >
            <div className="panel-heading">
              <div>
                <h3>Comparison findings</h3>
                <p>
                  Rule-level comparison based on extracted categories and
                  titles. Similarity is not a legal equivalence determination.
                </p>
              </div>
              <span className="status-pill">{visible.length} findings</span>
            </div>

            <div
              style={{
                padding: "0 18px 16px",
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
              }}
            >
              {[
                ["all", "All findings"],
                ["different", "Different"],
                ["only-left", "First only"],
                ["only-right", "Second only"],
                ["matching", "Matching"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={
                    filter === value
                      ? "button button-primary"
                      : "button button-outline"
                  }
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gap: 12, padding: 18 }}>
              {visible.map((item) => (
                <article
                  className="comparison-finding-card"
                  key={item.key}
                  style={{
                    border: "1px solid var(--border, #e5e7eb)",
                    borderRadius: 12,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                      marginBottom: 12,
                    }}
                  >
                    <strong>
                      {item.a?.title ||
                        item.b?.title ||
                        item.a?.category ||
                        item.b?.category ||
                        "Contract rule"}
                    </strong>
                    <span className="status-pill">
                      {statusLabel(item.status)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: 12,
                    }}
                  >
                    {[
                      { label: leftName, rule: item.a },
                      { label: rightName, rule: item.b },
                    ].map((side, index) => (
                      <div
                        className="comparison-side-card"
                        key={index}
                        style={{
                          background: "var(--surface-secondary, #f7f7fa)",
                          padding: 13,
                          borderRadius: 9,
                        }}
                      >
                        <b style={{ fontSize: 13 }}>{side.label}</b>
                        {!side.rule ? (
                          <p style={{ opacity: 0.65, fontSize: 13 }}>
                            No matching extracted rule found.
                          </p>
                        ) : (
                          <>
                            <p
                              style={{
                                fontSize: 13,
                                lineHeight: 1.5,
                                marginTop: 9,
                              }}
                            >
                              {side.rule.plain_language_explanation ||
                                "No plain-language explanation extracted."}
                            </p>
                            {side.rule.amount_or_formula && (
                              <p style={{ fontSize: 13 }}>
                                <b>Amount/formula:</b>{" "}
                                {side.rule.amount_or_formula}
                              </p>
                            )}
                            {side.rule.deadline_or_duration && (
                              <p style={{ fontSize: 13 }}>
                                <b>Timeline:</b>{" "}
                                {side.rule.deadline_or_duration}
                              </p>
                            )}
                            {side.rule.actor && (
                              <p style={{ fontSize: 13 }}>
                                <b>Responsible party:</b> {side.rule.actor}
                              </p>
                            )}
                            {side.rule.page_number && (
                              <p style={{ fontSize: 12, opacity: 0.7 }}>
                                Page {side.rule.page_number}
                              </p>
                            )}
                            <details style={{ marginTop: 9 }}>
                              <summary
                                style={{
                                  cursor: "pointer",
                                  fontSize: 13,
                                  fontWeight: 600,
                                }}
                              >
                                Original wording
                              </summary>
                              <blockquote
                                style={{
                                  fontSize: 12,
                                  lineHeight: 1.5,
                                  marginTop: 8,
                                  paddingLeft: 10,
                                  borderLeft: "3px solid #8b7cf6",
                                }}
                              >
                                {side.rule.original_text ||
                                  "No original wording stored."}
                              </blockquote>
                            </details>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              ))}
              {visible.length === 0 && (
                <p style={{ padding: 20 }}>No findings in this filter.</p>
              )}
            </div>
          </section>

          <div className="demo-disclaimer" style={{ marginTop: 16 }}>
            <ShieldAlert size={14} />
            Automated comparison is based on extracted rule labels and selected
            fields. It may miss differently worded equivalent clauses or
            incorrectly group similar titles. Review both original contracts
            before relying on a finding.
          </div>
        </>
      )}
    </>
  );
}

function DraftingView({
  documents,
  selectedDocumentId,
  setSelectedDocumentId,
  setActive,
  onExit,
}: {
  documents: IndexedDocument[];
  selectedDocumentId: string;
  setSelectedDocumentId: (id: string) => void;
  setActive: (section: Section) => void;
  onExit: () => void;
}) {
  const [mode, setMode] = useState<"clause" | "negotiation" | null>(null);
  const [brief, setBrief] = useState("");
  const [result, setResult] = useState("");
  const [sources, setSources] = useState<Array<{ page: number; text: string }>>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runWorkflow(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedDocumentId) {
      setError("Please select a contract first.");
      return;
    }

    if (!brief.trim()) {
      setError("Please describe what you want to draft or negotiate.");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");
    setSources([]);

    const prompt =
      mode === "clause"
        ? `Prepare a proposed first-draft contractual clause using the relevant passages from this agreement as context.

Requested clause and drafting instructions:
${brief}

Requirements:
- Clearly label the wording as a proposed draft, not an existing contractual term.
- Use relevant defined terms consistently where supported by the contract.
- Do not invent party names, amounts, dates or obligations.
- Identify assumptions or missing information separately.
- Keep the proposed clause clear and professionally structured.
- State that qualified human legal review is required before use.`
        : `Prepare structured contract negotiation points based on the relevant provisions of this agreement.

Negotiation topic and instructions:
${brief}

For each point provide:
1. Existing contractual position, with supporting evidence.
2. Potential concern or negotiation opportunity.
3. Suggested negotiation position.
4. Suggested discussion rationale.
5. Priority: High, Medium or Low, explaining why.

Clearly distinguish contract wording from recommendations. Do not invent contractual facts.`;

    try {
      const response = await fetch(
        `${API_URL}/api/documents/${selectedDocumentId}/ask`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: prompt }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The workflow could not be completed.");
      }

      setResult(data.answer || "No generated response was returned.");
      setSources(data.sources || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Workflow failed.");
    } finally {
      setLoading(false);
    }
  }

  const resetWorkflow = () => {
    setMode(null);
    setBrief("");
    setResult("");
    setSources([]);
    setError("");
  };

  return (
    <>
      <PageHeading
        eyebrow="CONTRACT WORKSPACE / DRAFTING"
        title="Contract drafting"
        description="Prepare clause alternatives, negotiation notes and amendment comparisons using your indexed contracts."
        action={
          <button
            type="button"
            className="button button-outline"
            onClick={onExit}
          >
            <ChevronLeft size={16} /> Exit Drafting
          </button>
        }
      />

      <section
        className="panel drafting-contract-panel"
        style={{ padding: 18, marginBottom: 18 }}
      >
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 9,
          }}
        >
          SELECT CONTRACT
        </label>
        <select
          value={selectedDocumentId}
          onChange={(e) => {
            setSelectedDocumentId(e.target.value);
            resetWorkflow();
          }}
          style={{
            width: "100%",
            maxWidth: 650,
            padding: 12,
            fontSize: 15,
            border: "1px solid #E2E6EE",
            borderRadius: 9,
          }}
        >
          <option value="">Select an indexed contract</option>
          {documents.map((doc) => (
            <option key={doc.document_id} value={doc.document_id}>
              {doc.original_filename || doc.filename}
            </option>
          ))}
        </select>
      </section>

      {!mode && (
        <div className="draft-grid drafting-workflow-grid">
          <article className="panel draft-card">
            <div className="draft-icon">
              <FileText size={20} />
            </div>
            <h3>Draft a Contract Clause</h3>
            <p>
              Generate a proposed first draft using the selected agreement as
              context.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setError("");
                setMode("clause");
              }}
            >
              Open clause drafting <ArrowRight size={14} />
            </button>
          </article>

          <article className="panel draft-card">
            <div className="draft-icon">
              <MessageSquareText size={20} />
            </div>
            <h3>Contract Negotiation Points</h3>
            <p>
              Generate structured negotiation positions grounded in the selected
              contract.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setError("");
                setMode("negotiation");
              }}
            >
              Open negotiation workflow <ArrowRight size={14} />
            </button>
          </article>

          <article className="panel draft-card">
            <div className="draft-icon">
              <FileCheck2 size={20} />
            </div>
            <h3>Contract Amendment Summary</h3>
            <p>
              Compare two contracts to identify changed terms, additional rules
              and omissions.
            </p>
            <button
              type="button"
              className="text-button"
              onClick={() => setActive("Compare Contracts")}
            >
              Open contract comparison <ArrowRight size={14} />
            </button>
          </article>
        </div>
      )}

      {mode && (
        <section
          className="panel drafting-editor-panel"
          style={{ padding: 22, marginTop: 18 }}
        >
          <div className="panel-heading">
            <div>
              <h3 style={{ fontSize: 21 }}>
                {mode === "clause"
                  ? "Draft a Contract Clause"
                  : "Contract Negotiation Points"}
              </h3>
              <p>
                {mode === "clause"
                  ? "Describe the clause you need drafted."
                  : "Describe the terms or issues you want to negotiate."}
              </p>
            </div>
            <button
              type="button"
              className="button button-outline"
              onClick={resetWorkflow}
            >
              Back to workflows
            </button>
          </div>

          <form onSubmit={runWorkflow}>
            <label
              style={{
                display: "block",
                fontSize: 14,
                fontWeight: 700,
                margin: "16px 0 8px",
              }}
            >
              {mode === "clause"
                ? "CLAUSE REQUIREMENTS"
                : "NEGOTIATION OBJECTIVE"}
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={5}
              placeholder={
                mode === "clause"
                  ? "Example: Draft a service-level clause specifying uptime, support response times and service credits."
                  : "Example: Identify negotiation points concerning payment milestones, liability limits and termination notice."
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 13,
                border: "1px solid #D9DEE8",
                borderRadius: 9,
                font: "inherit",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            />

            {error && (
              <p role="alert" style={{ color: "#B42318" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="button button-primary"
              disabled={loading || !selectedDocumentId}
              style={{ marginTop: 14 }}
            >
              {loading ? "Generating..." : "Generate"}
              <ArrowRight size={15} />
            </button>
          </form>

          {result && (
            <div
              className="drafting-output"
              style={{
                marginTop: 22,
                borderTop: "1px solid #E7EAF0",
                paddingTop: 18,
              }}
            >
              <h3>Generated output</h3>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  fontSize: 15,
                  lineHeight: 1.8,
                  padding: 16,
                  background: "#F7F8FB",
                  borderRadius: 9,
                }}
              >
                {result}
              </div>

              {sources.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <h4>Supporting contract evidence</h4>
                  {sources.map((source, index) => (
                    <blockquote
                      key={index}
                      style={{
                        margin: "10px 0",
                        padding: 12,
                        borderLeft: "3px solid #897AF1",
                        background: "#FAFAFC",
                        fontSize: 13,
                        lineHeight: 1.6,
                      }}
                    >
                      <b>Page {source.page}</b>
                      <p>{source.text}</p>
                    </blockquote>
                  ))}
                </div>
              )}

              <button
                type="button"
                className="button button-outline"
                onClick={() => navigator.clipboard.writeText(result)}
                style={{ marginTop: 12 }}
              >
                Copy generated output
              </button>
            </div>
          )}
        </section>
      )}

      <div className="demo-disclaimer" style={{ marginTop: 18 }}>
        <ShieldAlert size={14} />
        Generated clauses and negotiation points are preliminary drafting aids.
        They are not approved legal language. Verify source evidence and obtain
        qualified legal review before use.
      </div>
    </>
  );
}
function SettingsView() {
  const sections = [
    {
      title: "Organisation Profile",
      subtitle: "Company identity and workspace information",
      icon: BriefcaseBusiness,
      status: "In progress",
      description: "Organisation details and default business information.",
      rows: [
        ["Organisation Name", "3 Beacons"],
        ["Registered Address", "Bangalore"],
        ["Business Unit", "Software Development"],
        ["Default Currency", "Indian Rupee (INR)"],
        ["Organisation Details", "In progress"],
      ],
    },
    {
      title: "Users & Access Control",
      subtitle: "Members, roles and workspace permissions",
      icon: Activity,
      status: "Configured",
      description: "Workspace members and their access responsibilities.",
      rows: [
        ["User Directory", "Sakshi, Amit"],
        ["Amit — Admin Role", "Tech Head"],
        ["Reviewer Access", "Admin, Viewer"],
        ["Permissions", "Read, Write"],
        ["Team Responsibilities", "Yes"],
      ],
    },
    {
      title: "Risk & Review Policies",
      subtitle: "Risk classification and contract review standards",
      icon: ShieldAlert,
      status: "Review workflow available",
      description:
        "Review identified contract risks and findings. Organisation-wide policy configuration is not currently enabled.",
      rows: [
        ["Risk Findings", "Available for review"],
        ["Human Review", "Required"],
        ["Policy Configuration", "Not configured"],
      ],
    },
    {
      title: "Notifications & Reminders",
      subtitle: "Renewals, deadlines and pending reviews",
      icon: Bell,
      status: "Not configured",
      description: "Notification preferences and reminder schedules.",
      rows: [
        ["Contract Expiry Alerts", "Not configured"],
        ["Renewal Reminders", "Not configured"],
        ["Pending Review Notifications", "Not configured"],
        ["Obligation Deadlines", "Not configured"],
      ],
    },
    {
      title: "HeronIDP & Document Processing",
      subtitle: "HeronIDPservices and document analysis preferences",
      icon: Bot,
      status: "System information",
      description:
        "HeronIDP service and document-processing configuration. Live service status is shown on the system health panel.",
      rows: [
        ["HeronIDP Model", "See live system health"],
        ["Extraction Preferences", "Not configured"],
        ["Supported File Types", "PDF"],
        ["Human Review", "Required"],
      ],
    },
    {
      title: "Audit, Security & Data",
      subtitle: "Data governance and security controls",
      icon: Settings,
      status: "Not configured",
      description:
        "Audit history, document access and data-retention settings.",
      rows: [
        ["Activity History", "Not configured"],
        ["Document Access Records", "Not configured"],
        ["Data Retention", "Not configured"],
        ["Security Controls", "Not configured"],
      ],
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="WORKSPACE / ADMINISTRATION"
        title="Organisation Settings"
        description="View organisation details, workspace members, access responsibilities and contract review preferences."
      />

      <div className="settings-intro panel settings-intro-polished">
        <div className="settings-intro-mark">
          <BriefcaseBusiness size={23} />
        </div>
        <div>
          <b>3 Beacons</b>
          <p>
            Organisation profile and workspace information. Settings marked as
            not configured are displayed for reference and are not yet editable
            in this prototype.
          </p>
        </div>
      </div>

      <div className="settings-grid settings-grid-polished">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <details className="panel setting-card" key={section.title}>
              <summary>
                <div className="setting-icon">
                  <Icon size={21} />
                </div>

                <div className="setting-card-copy">
                  <b>{section.title}</b>
                  <p>{section.subtitle}</p>
                  <span className="settings-status">{section.status}</span>
                </div>

                <ChevronRight size={19} className="setting-chevron" />
              </summary>

              <div className="setting-detail">
                <p>{section.description}</p>

                <div className="settings-item-list">
                  {section.rows.map(([label, value]) => (
                    <div className="settings-data-row" key={label}>
                      <span className="settings-data-label">{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                {section.title === "Users & Access Control" && (
                  <div className="settings-note">
                    <b>Access information</b>
                    <p>
                      Amit is listed with the Admin Role of Tech Head. Reviewer
                      access options are Admin and Viewer. Listed permissions
                      are Read and Write.
                    </p>
                  </div>
                )}

                <small>
                  Configuration changes are not enabled in this prototype.
                </small>
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}

function SystemStatus() {
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking",
  );

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();

        if (active) {
          setStatus(
            response.ok && data.api === "ok" && data.database === "connected"
              ? "online"
              : "offline",
          );
        }
      } catch {
        if (active) setStatus("offline");
      }
    };

    checkHealth();
    const timer = setInterval(checkHealth, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const labels = {
    checking: "Checking System",
    online: "System Online",
    offline: "System Offline",
  };

  return (
    <div className={`system-status system-${status}`}>
      <span className="system-status-light" />
      <span>{labels[status]}</span>
    </div>
  );
}

function GPUStatus() {
  const [status, setStatus] = useState<
    "checking" | "allocated" | "idle" | "cpu" | "unavailable"
  >("checking");

  useEffect(() => {
    let active = true;

    const checkGPU = async () => {
      try {
        const response = await fetch(`${API_URL}/api/gpu-status`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error("GPU status unavailable");
        }

        if (active) {
          switch (data.status) {
            case "gpu_memory_allocated":
              setStatus("allocated");
              break;
            case "idle":
              setStatus("idle");
              break;
            case "cpu_only":
              setStatus("cpu");
              break;
            default:
              setStatus("unavailable");
          }
        }
      } catch {
        if (active) setStatus("unavailable");
      }
    };

    checkGPU();
    const timer = setInterval(checkGPU, 10000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const labels = {
    checking: "Checking GPU",
    allocated: "GPU Memory Allocated",
    idle: "GPU Idle",
    cpu: "GPU Not Allocated",
    unavailable: "GPU Unavailable",
  };

  return (
    <div
      className={`gpu-status gpu-${status}`}
      title="Remote Ollama model memory status"
    >
      <span className="gpu-status-light" />
      <span>{labels[status]}</span>
    </div>
  );
}

