import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation } from "react-router-dom";

const NAV_KEY = "bbContentNavCollapsed";

const pageOrder = [
  "executive-summary",
  "operating-context",
  "integration-signal-flow",
  "seller-experience",
  "governance-distribution",
  "intelligence-attribution",
  "security-trust-adoption",
  "capability-sequencing",
  "domain-map",
  "enablement-roadmap",
  "external-research",
  "forward-looking-statement"
];

const pages = {
  "executive-summary": {
    title: "Executive Summary",
    path: "/",
    group: "Overview",
    subtitle:
      "Prioritize Salesforce capabilities to retire Seismic risk while preserving flow-of-work and governance discipline.",
    blocks: [
      {
        heading: "Strategic Position",
        copy:
          "Blackbaud already owns the majority of required platform components. The primary decision is sequencing and adoption discipline, not platform replacement."
      },
      {
        heading: "v2 Licensing and Delivery Corrections",
        list: [
          "Sales/CS delivery is Microsoft-first (Teams, SharePoint, Outlook); Slack is not a Sales/CS dependency.",
          "MuleSoft ownership currently reflects Dataloader.io Enterprise, not Anypoint/Titanium.",
          "Bynder, Klue, and Workday connector patterns via full MuleSoft are incremental purchases."
        ]
      },
      {
        heading: "Executive Stakes by Persona",
        list: [
          "CRO: Improve win-rate consistency and deal-cycle velocity.",
          "CIO/CTO: Reduce architecture sprawl and preserve governance control.",
          "RevOps: Standardize approvals, distribution, and measurement."
        ]
      }
    ]
  },
  "operating-context": {
    title: "Operating Context",
    path: "/context",
    group: "Overview",
    subtitle:
      "Frame Blackbaud's post-divestiture priorities, AI ambition, and GTM workflow constraints.",
    blocks: [
      {
        heading: "Current State",
        copy: "Strong recurring model, complex switching costs, and growing pressure to simplify GTM systems."
      },
      {
        heading: "Future State",
        copy:
          "A unified operating model where recommendation quality, governance, and seller adoption are managed as one system."
      },
      {
        heading: "Context from Assessment v2",
        copy:
          "The operating model assumes Microsoft-first execution for Sales/CS with Agentforce reasoning delivered through Teams and CRM, while preserving optionality for selective ISV overlays."
      }
    ]
  },
  "integration-signal-flow": {
    title: "1. Integration and Signal Flow",
    path: "/theme-1",
    group: "Vignettes",
    subtitle: "Unify CRM, Gong, and Microsoft 365 signals into a trusted activation layer.",
    blocks: [
      {
        heading: "Capability Focus",
        list: [
          "Agentic AI / Autonomous Agents (DAG)",
          "Data Harmonization (DDH)",
          "Microsoft Ecosystem Integration (IMS)",
          "Enterprise Integration and Connectors (IEI, IEP)"
        ]
      },
      {
        heading: "Assessment v2 Implication",
        copy:
          "SharePoint and Teams pathways are owned today; integration patterns dependent on MuleSoft Anypoint (for Bynder/Klue/Workday) should be treated as incremental scope, not already-contracted capability."
      }
    ]
  },
  "seller-experience": {
    title: "2. In-Workflow Seller Experience",
    path: "/theme-2",
    group: "Vignettes",
    subtitle: "Improve adoption by delivering guidance in the seller's primary flow of work.",
    blocks: [
      {
        heading: "Capability Focus",
        list: [
          "Sales Enablement (SEM)",
          "Guided Solution Selling (SGS)",
          "Vector Search and RAG Grounding (DVS)",
          "Agentic AI / Autonomous Agents (DAG)"
        ]
      }
    ]
  },
  "governance-distribution": {
    title: "3. Content Governance and Distribution",
    path: "/theme-3",
    group: "Vignettes",
    subtitle: "Scale publication quality and role-aware access without losing speed.",
    blocks: [
      {
        heading: "Capability Focus",
        list: [
          "Content Management (MCN)",
          "Deal Support Requests (SDS)",
          "Recommendations and Experience (ORE)",
          "Self Service (VSS)"
        ]
      },
      {
        heading: "Assessment v2 Implication",
        copy:
          "Broad GTM access remains viable through Experience Cloud (pipeline) and Teams distribution. Slack-based governance workflows are not assumed for Sales/CS users."
      }
    ]
  },
  "intelligence-attribution": {
    title: "4. Intelligence and Attribution",
    path: "/theme-4",
    group: "Vignettes",
    subtitle: "Tie content behavior and seller action to measurable pipeline outcomes.",
    blocks: [
      {
        heading: "Capability Focus",
        list: [
          "Embedded BI and Dashboards (ABI)",
          "Sales Analytics (SSA)",
          "Marketing Analytics (MMA)",
          "Vector Search and RAG Grounding (DVS)"
        ]
      }
    ]
  },
  "security-trust-adoption": {
    title: "5. Security, Trust, and Adoption",
    path: "/theme-5",
    group: "Vignettes",
    subtitle: "Maintain trust, policy, and adoption controls as AI-guided operations scale.",
    blocks: [
      {
        heading: "Capability Focus",
        list: [
          "Einstein Trust Layer (DEL)",
          "Data Governance and Privacy (PGV)",
          "Knowledge Management (VKB)",
          "Training and Onboarding (VLN)"
        ]
      }
    ]
  },
  "capability-sequencing": {
    title: "Capability Sequencing",
    path: "/capability-map",
    group: "Architecture",
    subtitle: "Sequence activation by dependency, value speed, and risk control.",
    blocks: [
      {
        heading: "Phase 1",
        copy:
          "Foundation and flow: data harmonization, integration, governed content, and recommendation trust controls."
      },
      {
        heading: "Phase 2",
        copy:
          "Measurement and scale: embedded analytics, attribution, and operational optimization loops."
      },
      {
        heading: "Phase 3",
        copy:
          "Expansion and precision: broaden controlled access and selectively close residual workflow gaps."
      },
      {
        heading: "Assessment v2 Adjustment",
        copy:
          "Treat MuleSoft-dependent workstreams as explicit investment decisions. Prioritize owned Teams/Data Cloud pathways first, then evaluate incremental integration tiers based on measured value."
      }
    ],
    enablement: [
      {
        title: "Unlock Your Data with Data Cloud",
        url: "https://trailhead.salesforce.com/en/content/learn/trails/unlock-your-data-with-data-cloud"
      },
      {
        title: "Build and Administer CRM Analytics",
        url: "https://trailhead.salesforce.com/en/content/learn/trails/wave_analytics_enable_and_produce"
      }
    ]
  },
  "domain-map": {
    title: "Salesforce Domain Map",
    path: "/domain-map",
    group: "Architecture",
    subtitle:
      "Translate capability taxonomy into business meaning so teams can prioritize activation and funding decisions.",
    blocks: [
      {
        heading: "High-Priority Domains",
        list: [
          "Data & AI: recommendation quality, trust, and context grounding.",
          "Sales: in-workflow guidance and opportunity-linked execution.",
          "Integration: resilient connectivity across content and identity systems."
        ]
      },
      {
        heading: "Assessment v2 Domain Signal",
        copy:
          "Integration domain should distinguish owned capabilities from incremental connector architecture, while governance assumes Microsoft-first collaboration channels for Sales/CS."
      }
    ],
    enablement: [
      {
        title: "Build an AI Agent with Agentforce",
        url: "https://trailhead.salesforce.com/en/content/learn/trails/build-ai-assistants-with-einstein-copilot"
      },
      {
        title: "Drive Success with MuleSoft Anypoint Platform",
        url: "https://trailhead.salesforce.com/en/content/learn/trails/drive-success-with-mulesoft-anypoint-platform"
      }
    ]
  },
  "enablement-roadmap": {
    title: "Trailhead Enablement Roadmap",
    path: "/enablement-roadmap",
    group: "Architecture",
    subtitle:
      "Curated learning paths mapped to strategy phases and team roles, grounded in Trailhead MCP search results.",
    blocks: [
      {
        heading: "Executive Pre-Read",
        list: [
          "Build an AI Agent with Agentforce",
          "Unlock Your Data with Data Cloud",
          "Drive Sales with Operational Excellence"
        ]
      },
      {
        heading: "Role Tracks",
        list: [
          "Revenue Leadership: Agentforce Sales, Sales Operations, CRM Analytics",
          "Platform/Data: Data 360 modeling, MuleSoft architecture",
          "Service Operations: Agentforce Service and advanced security"
        ]
      }
    ],
    links: [
      ["Build an AI Agent with Agentforce", "https://trailhead.salesforce.com/en/content/learn/trails/build-ai-assistants-with-einstein-copilot"],
      ["Unlock Your Data with Data Cloud", "https://trailhead.salesforce.com/en/content/learn/trails/unlock-your-data-with-data-cloud"],
      ["Drive Success with MuleSoft Anypoint Platform", "https://trailhead.salesforce.com/en/content/learn/trails/drive-success-with-mulesoft-anypoint-platform"],
      ["Discover CRM Analytics", "https://trailhead.salesforce.com/en/content/learn/trails/discover-tableau-crm"]
    ]
  },
  "external-research": {
    title: "External Research",
    path: "/external-research",
    group: "Appendix",
    subtitle:
      "Blackbaud enters this window with recurring-revenue strength, explicit AI ambition, and pressure to simplify GTM tooling.",
    blocks: [
      {
        heading: "Advisory Implication",
        copy:
          "Best path is to maximize already-contracted Salesforce platform value while using overlays only for proven workflow gaps."
      }
    ]
  },
  "forward-looking-statement": {
    title: "Forward Looking Statement",
    path: "/forward-looking-statement",
    group: "Appendix",
    subtitle: "Mandatory legal language reproduced from the provided source artifact.",
    blocks: [
      {
        heading: "Legal Notice",
        copy:
          "This presentation contains forward-looking statements about, among other things, trend analyses and statements regarding future events, anticipated growth and industry prospects, and strategies regarding product releases and enhancements."
      }
    ]
  }
};

const searchIndex = [
  { code: "DAG", name: "Agentic AI / Autonomous Agents", location: "Theme 2, Theme 4", path: "/theme-2" },
  { code: "DDH", name: "Data Harmonization", location: "Theme 1", path: "/theme-1" },
  { code: "MCN", name: "Content Management", location: "Theme 3", path: "/theme-3" },
  { code: "ABI", name: "Embedded BI and Dashboards", location: "Theme 4", path: "/theme-4" },
  { code: "PGV", name: "Data Governance and Privacy", location: "Theme 5", path: "/theme-5" },
  { code: "ORE", name: "Recommendations and Experience", location: "Capability Sequencing", path: "/capability-map" }
];

function PageView({ page }) {
  return (
    <main className="content">
      <div className="top-toolbar">
        <ToggleButton />
      </div>
      <h1 className="page-title">{page.title}</h1>
      <p className="page-subtitle">{page.subtitle}</p>
      <div className="card-grid">
        {page.blocks.map((block) => (
          <article className="card" key={block.heading}>
            <h3>{block.heading}</h3>
            {block.copy && <p>{block.copy}</p>}
            {block.list && (
              <ul>
                {block.list.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
      {page.enablement && (
        <>
          <h2>Suggested Trailhead Enablement</h2>
          <div className="card-grid">
            {page.enablement.map((item) => (
              <article className="card" key={item.title}>
                <h3>{item.title}</h3>
                <p>
                  <a href={item.url} target="_blank" rel="noreferrer">
                    Open Trail
                  </a>
                </p>
              </article>
            ))}
          </div>
        </>
      )}
      {page.links && (
        <>
          <h2>Trailhead Links</h2>
          <div className="card">
            <ul>
              {page.links.map(([title, href]) => (
                <li key={title}>
                  <a href={href} target="_blank" rel="noreferrer">
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      <Pager page={page} />
    </main>
  );
}

function Pager({ page }) {
  const index = pageOrder.findIndex((k) => pages[k].path === page.path);
  const prev = index > 0 ? pages[pageOrder[index - 1]] : null;
  const next = index < pageOrder.length - 1 ? pages[pageOrder[index + 1]] : null;
  return (
    <div className="pager">
      {prev ? <Link to={prev.path}>{"<- Previous: " + prev.title}</Link> : <span />}
      {next ? <Link to={next.path}>{"Next: " + next.title + " ->"}</Link> : <span />}
    </div>
  );
}

function ToggleButton() {
  const [collapsed, setCollapsed] = useState(localStorage.getItem(NAV_KEY) === "1");
  useEffect(() => {
    document.body.classList.toggle("nav-collapsed", collapsed);
    localStorage.setItem(NAV_KEY, collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <button id="nav-toggle" type="button" onClick={() => setCollapsed((v) => !v)}>
      {collapsed ? "Show Navigation" : "Hide Navigation"}
    </button>
  );
}

function Sidebar() {
  const [location] = useLocation();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter((item) => `${item.code} ${item.name} ${item.location}`.toLowerCase().includes(q));
  }, [query]);

  const groups = ["Overview", "Vignettes", "Architecture", "Appendix"];
  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>Blackbaud Content Management Rationalization</h1>
        <p>Salesforce Executive Discussion Site</p>
        <div className="logo-pill">
          <img src="/blackbaud-favicon.png" alt="Blackbaud logo" />
        </div>
      </div>
      <div className="group-label">Search</div>
      <div className="search-wrap">
        <input
          id="capability-search"
          type="search"
          placeholder="Find capability, code, or location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <div className="search-results open">
            {results.length === 0 ? (
              <div className="search-item">No matches yet</div>
            ) : (
              results.map((item) => (
                <Link to={item.path} key={item.code} className="search-item">
                  <strong>
                    {item.code}: {item.name}
                  </strong>
                  <span>{item.location}</span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
      {groups.map((group) => (
        <div key={group}>
          <div className="group-label">{group}</div>
          <div className="nav-list">
            {Object.values(pages)
              .filter((p) => p.group === group)
              .map((page) => (
                <Link key={page.path} className={`nav-item ${location === page.path ? "active" : ""}`} to={page.path}>
                  {page.title}
                </Link>
              ))}
          </div>
        </div>
      ))}
    </aside>
  );
}

export default function App() {
  useEffect(() => {
    document.body.classList.toggle("nav-collapsed", localStorage.getItem(NAV_KEY) === "1");
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <Routes>
        {Object.values(pages).map((page) => (
          <Route key={page.path} path={page.path} element={<PageView page={page} />} />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
