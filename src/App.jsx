import { Component, useEffect, useMemo, useRef, useState } from "react";
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";

// ── Clerk setup ─────────────────────────────────────────────────────────────
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

// ── Domain restriction ──────────────────────────────────────────────────────
const ALLOWED_DOMAINS = ["blackbaud.com", "salesforce.com"];
const ADMIN_EMAILS = new Set([
  "afisher@salesforce.com",
  "bill.schermer@salesforce.com",
]);

function isAllowedDomain(email) {
  const normalized = email.toLowerCase();
  return (
    ADMIN_EMAILS.has(normalized) ||
    ALLOWED_DOMAINS.some((d) => normalized.endsWith(`@${d}`))
  );
}

const NAV_KEY = "bbContentNavCollapsed";
const TRAILHEAD_VERIFIED_AT = "2026-08-13";

const confidenceLegend = {
  Confirmed: "Validated in provided artifacts and implementation evidence.",
  Inferred: "Directionally supported but requires execution-time confirmation.",
  Pending: "Decision or data dependency remains open."
};

const scorecardDimensions = [
  {
    dimension: "Integration Readiness",
    currentScore: 3,
    targetScore: 5,
    confidence: "Confirmed",
    evidence:
      "Microsoft-first channels are active today, while several high-value connectors still require incremental integration investment decisions.",
    owner: "CIO / Enterprise Architecture",
    nextAction: "Approve a staged connector roadmap with value gates for Bynder, Klue, and Workday pathways."
  },
  {
    dimension: "Content Governance Maturity",
    currentScore: 3,
    targetScore: 5,
    confidence: "Inferred",
    evidence:
      "Governed publication and approvals are viable, but role-aware distribution policy still needs standard operating definitions across teams.",
    owner: "RevOps / Content Operations",
    nextAction: "Publish a governance playbook with release tiers, approvals, and policy exceptions."
  },
  {
    dimension: "Seller Workflow Adoption",
    currentScore: 2,
    targetScore: 5,
    confidence: "Confirmed",
    evidence:
      "The strategic requirement is to keep guidance in the seller flow of work while minimizing tool switching and duplicate asset retrieval.",
    owner: "CRO / Sales Enablement",
    nextAction: "Prioritize in-context recommendations for top opportunity stages before broad expansion."
  },
  {
    dimension: "AI Trust and Safety Controls",
    currentScore: 3,
    targetScore: 5,
    confidence: "Confirmed",
    evidence:
      "Trust controls are available, but adoption scale depends on explicit guardrails, auditability, and clear legal-operating boundaries.",
    owner: "CIO / Security and Compliance",
    nextAction: "Define red/amber/green policy classes for prompts, actions, and data access patterns."
  },
  {
    dimension: "Attribution and Measurement",
    currentScore: 2,
    targetScore: 5,
    confidence: "Inferred",
    evidence:
      "The current state emphasizes activity and content usage signals, with opportunity movement attribution requiring stronger cross-system instrumentation.",
    owner: "RevOps / Analytics",
    nextAction: "Stand up an attribution MVP linking content interactions to stage progression and cycle velocity."
  },
  {
    dimension: "Change Readiness and Enablement",
    currentScore: 3,
    targetScore: 5,
    confidence: "Pending",
    evidence:
      "Role-based enablement exists, but a formal capability-by-persona curriculum and certification cadence is not yet operationalized.",
    owner: "Sales Enablement Leadership",
    nextAction: "Launch a phased enablement program tied to deployment waves and scorecard targets."
  }
];

const scorecardRollup = (() => {
  const current = scorecardDimensions.reduce((sum, item) => sum + item.currentScore, 0);
  const target = scorecardDimensions.reduce((sum, item) => sum + item.targetScore, 0);
  const max = scorecardDimensions.length * 5;
  const avgCurrent = (current / scorecardDimensions.length).toFixed(1);
  const avgTarget = (target / scorecardDimensions.length).toFixed(1);
  return {
    avgCurrent,
    avgTarget,
    uplift: (Number(avgTarget) - Number(avgCurrent)).toFixed(1),
    readinessPct: Math.round((current / max) * 100)
  };
})();

const trailheadCatalog = {
  executiveQuickStart: [
    {
      title: "Build an AI Agent with Agentforce",
      type: "Trail",
      level: "Intermediate",
      role: "Executive Sponsor",
      minutes: 140,
      whyItMatters: "Frames practical Agentforce operating decisions for cross-functional leaders.",
      apiName: "build-ai-assistants-with-einstein-copilot",
      url: "https://trailhead.salesforce.com/content/learn/trails/build-ai-assistants-with-einstein-copilot",
      verifiedAt: TRAILHEAD_VERIFIED_AT
    },
    {
      title: "Unlock Your Data with Data Cloud",
      type: "Trail",
      level: "Intermediate",
      role: "Executive Sponsor",
      minutes: 606,
      whyItMatters: "Connects data harmonization strategy with AI and segmentation activation outcomes.",
      apiName: "unlock-your-data-with-data-cloud",
      url: "https://trailhead.salesforce.com/content/learn/trails/unlock-your-data-with-data-cloud",
      verifiedAt: TRAILHEAD_VERIFIED_AT
    },
    {
      title: "Drive Sales with Operational Excellence",
      type: "Trail",
      level: "Foundational",
      role: "Revenue Leadership",
      minutes: 110,
      whyItMatters: "Anchors execution discipline for sales operations, collaboration, and opportunity rigor.",
      apiName: "drive-sales-with-operational-excellence",
      url: "https://trailhead.salesforce.com/content/learn/trails/drive-sales-with-operational-excellence",
      verifiedAt: TRAILHEAD_VERIFIED_AT
    }
  ],
  roleTracks: [
    {
      track: "Revenue Leadership Track",
      audience: "CRO, Sales Leadership, RevOps",
      focus: "Pipeline velocity, guided selling, and attribution confidence.",
      items: [
        {
          title: "Drive Sales with Operational Excellence",
          type: "Trail",
          level: "Foundational",
          role: "Sales Professional",
          minutes: 110,
          whyItMatters: "Improves forecasting hygiene and operating cadence for managers and reps.",
          apiName: "drive-sales-with-operational-excellence",
          url: "https://trailhead.salesforce.com/content/learn/trails/drive-sales-with-operational-excellence",
          verifiedAt: TRAILHEAD_VERIFIED_AT
        },
        {
          title: "Accelerate Your Sales Team with Sales Engagement",
          type: "Trail",
          level: "Intermediate",
          role: "Sales Professional",
          minutes: 40,
          whyItMatters: "Operationalizes cadence-based outreach in seller workflows.",
          apiName: "accelerate-your-sales-team-with-high-velocity-sales",
          url: "https://trailhead.salesforce.com/en/content/learn/trails/accelerate-your-sales-team-with-high-velocity-sales",
          verifiedAt: TRAILHEAD_VERIFIED_AT
        }
      ]
    },
    {
      track: "Platform and Data Track",
      audience: "CIO, Enterprise Architects, Data Leaders",
      focus: "Identity-safe integration, harmonized data, and trusted automation.",
      items: [
        {
          title: "Unlock Your Data with Data Cloud",
          type: "Trail",
          level: "Intermediate",
          role: "Architect",
          minutes: 606,
          whyItMatters: "Builds shared understanding of ingestion, modeling, and activation dependencies.",
          apiName: "unlock-your-data-with-data-cloud",
          url: "https://trailhead.salesforce.com/content/learn/trails/unlock-your-data-with-data-cloud",
          verifiedAt: TRAILHEAD_VERIFIED_AT
        },
        {
          title: "Drive Success with MuleSoft Anypoint Platform",
          type: "Trail",
          level: "Intermediate",
          role: "Architect",
          minutes: 360,
          whyItMatters: "Supports connector decisioning for incremental integration investments.",
          apiName: "drive-success-with-mulesoft-anypoint-platform",
          url: "https://trailhead.salesforce.com/en/content/learn/trails/drive-success-with-mulesoft-anypoint-platform",
          verifiedAt: TRAILHEAD_VERIFIED_AT
        }
      ]
    },
    {
      track: "Service and AI Operations Track",
      audience: "Service Leaders, Admins, AI Operations Owners",
      focus: "Responsible AI rollout, service automation, and trust controls.",
      items: [
        {
          title: "Build with Agentforce for Service",
          type: "Trail",
          level: "Advanced",
          role: "Administrator",
          minutes: 479,
          whyItMatters: "Guides enterprise service use cases with AI orchestration and governance.",
          apiName: "build-with-agentforce-for-service",
          url: "https://trailhead.salesforce.com/en/content/learn/trails/build-with-agentforce-for-service",
          verifiedAt: TRAILHEAD_VERIFIED_AT
        },
        {
          title: "Discover Agentforce Service",
          type: "Trail",
          level: "Intermediate",
          role: "Administrator",
          minutes: 582,
          whyItMatters: "Expands practical service-side execution patterns for AI-assisted teams.",
          apiName: "discover-agentforce-service",
          url: "https://trailhead.salesforce.com/en/content/learn/trails/discover-agentforce-service",
          verifiedAt: TRAILHEAD_VERIFIED_AT
        }
      ]
    }
  ]
};

const pageOrder = [
  "executive-summary",
  "operating-context",
  "integration-signal-flow",
  "seller-experience",
  "governance-distribution",
  "intelligence-attribution",
  "security-trust-adoption",
  "capability-sequencing",
  "capability-scorecard",
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
          "Blackbaud owns most foundational platform capabilities today. The critical decision is now operating-model execution: sequence investments, govern risk, and drive adoption inside seller workflows.",
        metrics: [
          { label: "Current Readiness", value: `${scorecardRollup.readinessPct}%`, note: "Cross-capability average (1-5 model)." },
          { label: "Target Uplift", value: `+${scorecardRollup.uplift}`, note: "Average score increase required for target state." },
          { label: "Priority Window", value: "Two Quarters", note: "First value realization horizon." }
        ],
        decisionPrompts: [
          "Which two capabilities unlock the fastest measurable cycle-time reduction?",
          "What investment gates will control incremental connector spend?",
          "How will leadership hold teams accountable to adoption metrics?"
        ]
      },
      {
        heading: "Overall Capability Scorecard Snapshot",
        copy:
          `Average score rises from ${scorecardRollup.avgCurrent} to ${scorecardRollup.avgTarget}. The largest gaps are seller adoption and attribution consistency.`,
        links: [{ label: "Open full Capability Scorecard", href: "/scorecard", internal: true }]
      },
      {
        heading: "Licensing and Delivery Guardrails",
        list: [
          "Sales/CS delivery is Microsoft-first (Teams, SharePoint, Outlook); Slack is not a Sales/CS dependency.",
          "MuleSoft ownership currently reflects Dataloader.io Enterprise, not Anypoint/Titanium.",
          "Bynder, Klue, and Workday connector patterns via full MuleSoft are incremental purchases."
        ],
        risks: [
          "Assuming full MuleSoft entitlement can overstate near-term integration capacity.",
          "Unclear ownership of content governance can slow AI adoption even when tooling exists."
        ]
      },
      {
        heading: "Executive Stakes by Persona",
        list: [
          "CRO: Improve win-rate consistency and deal-cycle velocity.",
          "CIO/CTO: Reduce architecture sprawl and preserve governance control.",
          "RevOps: Standardize approvals, distribution, and measurement."
        ],
        decisionPrompts: [
          "Which KPIs define success for each persona in the first 90 days?",
          "What policy decisions need executive sign-off before rollout?"
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
        copy:
          "Strong recurring economics and incumbent workflows are balanced against rising pressure to reduce stack complexity and increase decision speed.",
        metrics: [
          { label: "Primary Channel", value: "Microsoft-first", note: "Sales/CS execution baseline." },
          { label: "Architecture Pressure", value: "High", note: "Need to minimize point-solution sprawl." }
        ]
      },
      {
        heading: "Future State",
        copy:
          "A unified operating model where recommendation quality, governance controls, and seller adoption are managed as one integrated system.",
        decisionPrompts: [
          "Where should centralized governance stop and field autonomy begin?",
          "How will future-state ownership be split across RevOps, Sales Enablement, and IT?"
        ]
      },
      {
        heading: "Operating Context Signals",
        copy:
          "The operating model assumes Microsoft-first execution for Sales/CS with Agentforce reasoning delivered through Teams and CRM, while preserving optionality for selective ISV overlays.",
        risks: [
          "Unmanaged exceptions for alternate channels can reintroduce fragmentation.",
          "Delayed governance decisions may block value realization from AI investments."
        ]
      },
      {
        heading: "Priority Discussion Threads",
        list: [
          "Replace point-solution fragmentation without disrupting seller productivity.",
          "Scale trustworthy AI under explicit policy controls.",
          "Prove content influence on revenue outcomes, not only activity."
        ]
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
        ],
        decisionPrompts: [
          "Which data domains must be harmonized first to improve recommendation quality?",
          "Which connector investments are phase-gated by measurable business outcomes?"
        ]
      },
      {
        heading: "Implementation Implication",
        copy:
          "SharePoint and Teams pathways are owned today; integration patterns dependent on MuleSoft Anypoint (for Bynder/Klue/Workday) should be treated as incremental scope, not already-contracted capability.",
        risks: [
          "Overcommitting to non-contracted connectors can slow early wins.",
          "Incomplete signal normalization can degrade AI recommendation trust."
        ]
      },
      {
        heading: "Decision Frame",
        copy:
          "Use this workstream to establish a resilient signal backbone first, then layer advanced workflow intelligence after reliability thresholds are met."
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
        ],
        metrics: [
          { label: "Primary Outcome", value: "Less context switching", note: "Seller time returns to customer-facing work." },
          { label: "Adoption Risk", value: "High", note: "Workflow friction is the fastest value killer." }
        ]
      },
      {
        heading: "Decision Prompts",
        decisionPrompts: [
          "Which two opportunity stages should receive AI-guided recommendations first?",
          "How will sales managers reinforce adoption behaviors in weekly operating cadence?",
          "What are the fallback paths when recommendations are low-confidence?"
        ]
      },
      {
        heading: "Dependencies and Risks",
        risks: [
          "If search/recommendation latency is high, adoption will decline quickly.",
          "If governance blocks field personalization entirely, users may bypass the system."
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
        ],
        decisionPrompts: [
          "Which content classes require strict approval before publication?",
          "How should policy differ between internal, partner, and customer-visible assets?"
        ]
      },
      {
        heading: "Implementation Implication",
        copy:
          "Broad GTM access remains viable through Experience Cloud (pipeline) and Teams distribution. Slack-based governance workflows are not assumed for Sales/CS users.",
        risks: [
          "Inconsistent access policy can create duplicate content channels and trust issues.",
          "Lack of lifecycle ownership can increase stale or conflicting collateral."
        ]
      },
      {
        heading: "Target Operating Pattern",
        copy:
          "Treat governance as a velocity enabler: clear policy tiers, transparent approval SLAs, and automated lifecycle controls."
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
      },
      {
        heading: "Decision Prompts",
        decisionPrompts: [
          "Which KPI pair defines value: cycle velocity + win-rate, or stage progression + content influence?",
          "What minimum data quality thresholds are required before executive reporting?",
          "Which attribution questions must be answered in phase one?"
        ]
      },
      {
        heading: "Dependencies and Risks",
        risks: [
          "Without aligned opportunity taxonomy, attribution outputs will be disputed.",
          "If analytics are delayed, confidence in governance decisions declines."
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
        ],
        metrics: [
          { label: "Trust Requirement", value: "Non-negotiable", note: "Adoption depends on policy clarity." },
          { label: "Change Criticality", value: "Enterprise-wide", note: "Behavior change crosses org boundaries." }
        ]
      },
      {
        heading: "Decision Prompts",
        decisionPrompts: [
          "What policy classes govern prompts, retrieval, and action orchestration?",
          "How will legal/compliance sign-off be embedded in release gates?"
        ]
      },
      {
        heading: "Dependencies and Risks",
        risks: [
          "Undefined policy boundaries can stall AI rollout at launch.",
          "Insufficient onboarding support can suppress sustained adoption."
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
          "Foundation and flow: data harmonization, integration, governed content, and recommendation trust controls.",
        metrics: [{ label: "Primary Objective", value: "Stabilize Core", note: "Reduce friction and establish trust baseline." }]
      },
      {
        heading: "Phase 2",
        copy:
          "Measurement and scale: embedded analytics, attribution, and operational optimization loops.",
        metrics: [{ label: "Primary Objective", value: "Measure and Scale", note: "Operationalize insights into governance loops." }]
      },
      {
        heading: "Phase 3",
        copy:
          "Expansion and precision: broaden controlled access and selectively close residual workflow gaps.",
        metrics: [{ label: "Primary Objective", value: "Expand with Precision", note: "Scale proven patterns only." }]
      },
      {
        heading: "Sequencing Adjustment",
        copy:
          "Treat MuleSoft-dependent workstreams as explicit investment decisions. Prioritize owned Teams/Data Cloud pathways first, then evaluate incremental integration tiers based on measured value.",
        decisionPrompts: [
          "Which milestone must be met before advancing each phase?",
          "What governance checkpoint validates readiness for phase transition?"
        ]
      }
    ],
    enablement: [
      {
        title: "Unlock Your Data with Data Cloud",
        type: "Trail",
        level: "Intermediate",
        role: "Architect",
        minutes: 606,
        whyItMatters: "Aligns data harmonization and activation with phase-one and phase-two dependencies.",
        apiName: "unlock-your-data-with-data-cloud",
        url: "https://trailhead.salesforce.com/content/learn/trails/unlock-your-data-with-data-cloud",
        verifiedAt: TRAILHEAD_VERIFIED_AT
      },
      {
        title: "Build and Administer CRM Analytics",
        type: "Trail",
        level: "Intermediate",
        role: "Data Analyst",
        minutes: 230,
        whyItMatters: "Supports measurement loops needed for phase-two optimization.",
        apiName: "wave_analytics_enable_and_produce",
        url: "https://trailhead.salesforce.com/en/content/learn/trails/wave_analytics_enable_and_produce",
        verifiedAt: TRAILHEAD_VERIFIED_AT
      }
    ]
  },
  "capability-scorecard": {
    title: "Capability Scorecard",
    path: "/scorecard",
    group: "Architecture",
    subtitle:
      "Evaluate readiness, risk, and required uplift across the capabilities needed for Blackbaud's content management rationalization.",
    blocks: [
      {
        heading: "Overall Readiness Rollup",
        copy:
          `Current average readiness is ${scorecardRollup.avgCurrent}/5 with a target of ${scorecardRollup.avgTarget}/5. Closing this ${scorecardRollup.uplift}-point gap requires disciplined sequencing and ownership accountability.`,
        metrics: [
          { label: "Current Avg", value: `${scorecardRollup.avgCurrent}/5`, note: "Across six strategic dimensions." },
          { label: "Target Avg", value: `${scorecardRollup.avgTarget}/5`, note: "Future-state operating target." },
          { label: "Readiness Index", value: `${scorecardRollup.readinessPct}%`, note: "Current score as % of full readiness." }
        ]
      },
      {
        heading: "How to Use This Scorecard",
        list: [
          "Review each dimension with assigned owners in weekly operating governance.",
          "Treat confidence labels as evidence quality indicators, not performance indicators.",
          "Promote dimensions only when evidence and adoption metrics support the change."
        ]
      }
    ],
    scoreRows: scorecardDimensions
  },
  "domain-map": {
    title: "Salesforce Domain Map",
    path: "/domain-map",
    group: "Architecture",
    subtitle:
      "Translate capability taxonomy into business meaning so teams can prioritize activation and funding decisions.",
    blocks: [
      {
        heading: "Core Domain Coverage for Blackbaud Rationalization",
        list: [
          "Data and AI: DAG, DDH, DVS, DUP, DIR, DEL, DPA, DFC.",
          "Sales and Enablement: SEM, SGS, SDS, SOP, SSA, SSP, STM.",
          "Integration and Ecosystem: IMS, IEI, IEP, IAM, IAF.",
          "Marketing and Content: MCN, MAS, MMA, MJM, MLG, MPV.",
          "Platform and Governance: PGV, PMD plus trust policy layers.",
          "Service and Experience Continuity: VSS, VKB, VAX, VCM, VCH."
        ],
        metrics: [
          { label: "Mapped Domains", value: "6", note: "Primary execution clusters for this program." },
          { label: "Referenced Capabilities", value: "35+", note: "Across Data, Sales, Integration, Marketing, and Service." },
          { label: "Priority Lens", value: "Adoption + Trust", note: "Value is gated by workflow fit and governance." }
        ]
      },
      {
        heading: "Domain-to-Outcome Mapping",
        list: [
          "Data and AI -> Improve recommendation precision, agent grounding, and trust-safe automation.",
          "Sales and Enablement -> Increase seller productivity and opportunity progression quality.",
          "Integration -> Protect execution continuity across Microsoft, CRM, and content systems.",
          "Marketing and Content -> Standardize publishing, personalization, and channel consistency.",
          "Platform and Governance -> Enforce policy, identity, auditability, and multi-org controls.",
          "Service and Experience -> Preserve downstream customer support quality and knowledge continuity."
        ],
        decisionPrompts: [
          "Which domains are required for phase-one value realization versus phase-two scale?",
          "Where do shared dependencies require joint ownership and budget alignment?"
        ]
      },
      {
        heading: "Capability Prioritization by Horizon",
        list: [
          "Near term: DDH, IMS, MCN, SEM, SGS, DEL, PGV.",
          "Mid term: DVS, DIR, DUP, ABI, SSA, ORE, MAS, MJM.",
          "Expansion: IAF, DFC, AEX, APC, ARI, advanced service and partner capabilities."
        ],
        risks: [
          "Over-indexing on expansion capabilities before core workflow adoption can dilute ROI.",
          "Domain sequencing without governance checkpoints can create architecture drift."
        ]
      },
      {
        heading: "Domain Prioritization Signal",
        copy:
          "Integration domain planning should distinguish owned pathways from incremental connector architecture, while governance and collaboration assumptions remain Microsoft-first for Sales and Customer Success.",
        risks: [
          "Treating all domains as parallel priorities can dilute execution focus.",
          "Domain ownership ambiguity can slow dependency resolution."
        ]
      }
    ],
    enablement: [
      {
        title: "Build an AI Agent with Agentforce",
        type: "Trail",
        level: "Intermediate",
        role: "Architect",
        minutes: 140,
        whyItMatters: "Supports Data and AI domain decisions around agent design and governance.",
        apiName: "build-ai-assistants-with-einstein-copilot",
        url: "https://trailhead.salesforce.com/content/learn/trails/build-ai-assistants-with-einstein-copilot",
        verifiedAt: TRAILHEAD_VERIFIED_AT
      },
      {
        title: "Drive Success with MuleSoft Anypoint Platform",
        type: "Trail",
        level: "Intermediate",
        role: "Architect",
        minutes: 360,
        whyItMatters: "Informs incremental integration architecture and connector investment planning.",
        apiName: "drive-success-with-mulesoft-anypoint-platform",
        url: "https://trailhead.salesforce.com/en/content/learn/trails/drive-success-with-mulesoft-anypoint-platform",
        verifiedAt: TRAILHEAD_VERIFIED_AT
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
        ],
        copy:
          "These entries were validated through Trailhead MCP (content_search + targeted fetch_content) and are designed to align directly to scorecard gaps."
      },
      {
        heading: "Role Tracks",
        list: [
          "Revenue Leadership: Agentforce Sales, Sales Operations, CRM Analytics",
          "Platform and Data: Data 360 modeling, MuleSoft architecture",
          "Service Operations: Agentforce Service and advanced security"
        ],
        decisionPrompts: [
          "Which track should each owner complete before phase-one sign-off?",
          "How will completion evidence be captured in operating reviews?"
        ]
      },
      {
        heading: "Scorecard-to-Enablement Mapping",
        list: [
          "Integration Readiness gap -> Platform and Data Track",
          "Seller Workflow Adoption gap -> Revenue Leadership Track",
          "AI Trust and Safety Controls gap -> Service and AI Operations Track",
          "Attribution and Measurement gap -> Revenue Leadership and Analytics modules"
        ]
      }
    ],
    enablementGroups: trailheadCatalog
  },
  "external-research": {
    title: "External Research",
    path: "/external-research",
    group: "Appendix",
    subtitle:
      "Market, financial, competitive, and strategic signals from the Blackbaud External Research Brief.",
    blocks: [
      {
        heading: "Company Overview and Strategic Position",
        copy:
          "Blackbaud is a long-standing social impact software leader serving nonprofits, education, healthcare, and foundations globally. The company has pivoted to a cloud-first recurring SaaS model and is positioning itself as an AI-powered market leader for social impact organizations."
      },
      {
        heading: "Financial and Portfolio Signals",
        list: [
          "FY2025 revenue reported at approximately $1.12B, with FY2024 at approximately $1.15B and FY2023 above $1B.",
          "Business mix remains predominantly recurring revenue (subscription + payments).",
          "EVERFI was divested on Dec 31, 2024, sharpening focus on core social impact software.",
          "FY2025 marked a return to GAAP profitability."
        ],
        metrics: [
          { label: "FY2025 Revenue", value: "~$1.12B" },
          { label: "Recurring Mix", value: "~90%+" },
          { label: "Portfolio Focus", value: "Core Social Impact" }
        ]
      },
      {
        heading: "Product and Platform Footprint",
        list: [
          "Raiser's Edge NXT, Blackbaud CRM, and Financial Edge NXT remain foundational product anchors.",
          "SKY Platform provides the integration and developer layer across the portfolio.",
          "Blackbaud Payments and related financial services continue as growth vectors.",
          "YourCause and Impact Edge remain part of the corporate impact portfolio after the EVERFI divestiture."
        ]
      },
      {
        heading: "AI and Transformation Momentum",
        list: [
          "Agents for Good introduced autonomous, supervised workflow execution in Raiser's Edge NXT and Financial Edge NXT contexts.",
          "70+ embedded AI capabilities signal a shift from systems of record toward systems of intelligent action.",
          "The AI Coalition for Social Impact expands AI literacy and change readiness in Blackbaud's core constituency."
        ],
        decisionPrompts: [
          "How should Salesforce differentiate trusted enterprise orchestration from embedded AI feature depth?",
          "Which workflow moments should be prioritized to demonstrate measurable value against incumbent AI narratives?"
        ]
      },
      {
        heading: "Competitive Landscape Implications",
        list: [
          "Blackbaud's sector-specific depth and switching costs remain material competitive moats.",
          "Salesforce and Microsoft are key platform-scale alternatives for organizations prioritizing broader ecosystem flexibility.",
          "Emerging nonprofit-focused platforms continue to pressure mid-market and ease-of-use segments."
        ],
        risks: [
          "A generic replacement narrative will underperform against Blackbaud's domain-specific positioning.",
          "Migration concerns can delay adoption if modernization pathing is not phased and low-friction."
        ]
      },
      {
        heading: "Advisory Implication",
        copy:
          "Best path is to maximize already-contracted Salesforce platform value while using overlays only for proven workflow gaps.",
        decisionPrompts: [
          "Which external pressure points should shape sequencing in the next two quarters?",
          "How should leadership communicate the rationale for stack rationalization?"
        ]
      }
    ]
  },
  "forward-looking-statement": {
    title: "Forward looking statements",
    path: "/forward-looking-statement",
    group: "Appendix",
    subtitle: "",
    blocks: [
      {
        heading: "Forward looking statements",
        copy:
          "This presentation contains forward-looking statements about, among other things, trend analyses and statements regarding future events, anticipated growth and industry prospects, and our strategies, expectation or plans regarding product releases and enhancements. The achievement or success of the matters covered by such forward-looking statements involves risks, uncertainties and assumptions. If any such risks or uncertainties materialize or if any of the assumptions prove incorrect, results or outcomes could differ materially from those expressed or implied by these forward-looking statements. The risks and uncertainties referred to above include those factors discussed in Salesforce’s reports filed from time to time with the Securities and Exchange Commission, including, but not limited to our ability to meet the expectations of our customers; uncertainties regarding Al technologies and their integration into our product offerings; the effect of evolving domestic and foreign government regulations; regulatory developments and regulatory investigations involving us or affecting our industry; our ability to successfully introduce new services and product features, including related to AI and Agentforce; our ability to execute our business plans; the pace of change and innovation and our ability to compete in the markets in which we participate; and our ability to maintain and enhance our brands."
      }
    ]
  }
};

const searchIndex = [
  { code: "DAG", name: "Agentic AI / Autonomous Agents", location: "Themes 1, 2, 4", path: "/theme-2", tags: "agentforce ai seller guidance" },
  { code: "DDH", name: "Data Harmonization", location: "Theme 1, Sequencing", path: "/theme-1", tags: "data cloud ingestion modeling" },
  { code: "MCN", name: "Content Management", location: "Theme 3", path: "/theme-3", tags: "governance publication policy" },
  { code: "ABI", name: "Embedded BI and Dashboards", location: "Theme 4", path: "/theme-4", tags: "attribution analytics measurement" },
  { code: "PGV", name: "Data Governance and Privacy", location: "Theme 5, Scorecard, Domain Map", path: "/theme-5", tags: "trust security compliance privacy governance controls" },
  { code: "ORE", name: "Recommendations and Experience", location: "Theme 3, Sequencing", path: "/capability-map", tags: "personalization experience" },
  { code: "IMS", name: "Microsoft Ecosystem Integration", location: "Theme 1, Domain Map", path: "/domain-map", tags: "teams outlook sharepoint integration" },
  { code: "IEI", name: "Enterprise Integration", location: "Theme 1, Domain Map", path: "/domain-map", tags: "orchestration integration platform" },
  { code: "DVS", name: "Vector Search and RAG Grounding", location: "Themes 2, 4, Domain Map", path: "/domain-map", tags: "rag retrieval grounding knowledge" },
  { code: "DIR", name: "Identity Resolution", location: "Domain Map", path: "/domain-map", tags: "profile unification data cloud identity" },
  { code: "DUP", name: "Unified Customer Profile", location: "Domain Map", path: "/domain-map", tags: "customer 360 profile context" },
  { code: "SEM", name: "Sales Enablement", location: "Theme 2, Domain Map", path: "/theme-2", tags: "sales content coaching" },
  { code: "SGS", name: "Guided Solution Selling", location: "Theme 2, Domain Map", path: "/theme-2", tags: "guided selling recommendations" },
  { code: "SDS", name: "Deal Support Requests", location: "Theme 3, Domain Map", path: "/theme-3", tags: "deal desk support workflows" },
  { code: "MAS", name: "Audience Segmentation and Activation", location: "Domain Map", path: "/domain-map", tags: "segmentation activation marketing" },
  { code: "MJM", name: "Journey Management", location: "Domain Map", path: "/domain-map", tags: "journey campaign orchestration" },
  {
    code: "SCORE",
    name: "Capability Scorecard",
    location: "Architecture",
    path: "/scorecard",
    tags: "readiness maturity confidence owner next action"
  },
  {
    code: "TRAIL",
    name: "Trailhead Enablement",
    location: "Enablement Roadmap",
    path: "/enablement-roadmap",
    tags: "role tracks executive pre-read phase learning"
  }
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function MetricList({ metrics = [] }) {
  if (!metrics.length) return null;
  return (
    <div className="metric-row">
      {metrics.map((metric) => (
        <div className="metric-chip" key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
          {metric.note && <small>{metric.note}</small>}
        </div>
      ))}
    </div>
  );
}

function LinkList({ links = [] }) {
  if (!links.length) return null;
  return (
    <ul>
      {links.map((entry) => (
        <li key={entry.label}>
          {entry.internal ? (
            <Link to={entry.href}>{entry.label}</Link>
          ) : (
            <a href={entry.href} target="_blank" rel="noreferrer">
              {entry.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

function DecisionPromptList({ title, prompts = [] }) {
  if (!prompts.length) return null;
  return (
    <>
      <h4>{title}</h4>
      <ul>
        {prompts.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

function ScorecardSection({ scoreRows = [] }) {
  if (!scoreRows.length) return null;
  return (
    <>
      <h2>Dimension Scorecards</h2>
      <div className="scorecard-grid">
        {scoreRows.map((row) => (
          <article className="card score-card" key={row.dimension}>
            <h3>{row.dimension}</h3>
            <div className="metric-row">
              <div className="metric-chip">
                <strong>{row.currentScore}/5</strong>
                <span>Current</span>
              </div>
              <div className="metric-chip">
                <strong>{row.targetScore}/5</strong>
                <span>Target</span>
              </div>
              <div className={`confidence-chip confidence-${row.confidence.toLowerCase()}`}>{row.confidence}</div>
            </div>
            <p>
              <strong>Owner:</strong> {row.owner}
            </p>
            <p>
              <strong>Evidence:</strong> {row.evidence}
            </p>
            <p>
              <strong>Next Action:</strong> {row.nextAction}
            </p>
            <p className="muted-note">
              <strong>Confidence Detail:</strong> {confidenceLegend[row.confidence]}
            </p>
          </article>
        ))}
      </div>
    </>
  );
}

function EnablementCard({ item }) {
  return (
    <article className="card enablement-card">
      <h3>{item.title}</h3>
      <div className="metric-row">
        <span className="meta-chip">{item.type}</span>
        <span className="meta-chip">{item.level}</span>
        <span className="meta-chip">{item.role}</span>
        <span className="meta-chip">{item.minutes} min</span>
      </div>
      <p>{item.whyItMatters}</p>
      <p className="muted-note">Verified via Trailhead MCP: {item.verifiedAt}</p>
      <p>
        <a href={item.url} target="_blank" rel="noreferrer">
          Open Trailhead Content
        </a>
      </p>
    </article>
  );
}

function EnablementGroups({ groups }) {
  if (!groups) return null;
  return (
    <>
      <h2>Trailhead Enablement Catalog</h2>
      <h3>Executive Quick Start</h3>
      <div className="card-grid">
        {groups.executiveQuickStart.map((item) => (
          <EnablementCard key={`${item.title}-exec`} item={item} />
        ))}
      </div>
      {groups.roleTracks.map((track) => (
        <div key={track.track}>
          <h3>{track.track}</h3>
          <p className="page-subtitle">
            <strong>Audience:</strong> {track.audience} | <strong>Focus:</strong> {track.focus}
          </p>
          <div className="card-grid">
            {track.items.map((item) => (
              <EnablementCard key={`${track.track}-${item.title}`} item={item} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ExportPdfButton() {
  const [status, setStatus] = useState("idle"); // "idle" | "generating" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  async function handleExportPdf() {
    if (status === "generating") return;
    setStatus("generating");
    setErrorMessage("");

    try {
      const res = await fetch("/api/pdf");
      if (!res.ok) {
        let detail = "";
        try {
          const body = await res.json();
          detail = body.error || body.detail || "";
        } catch {
          // non-JSON body
        }
        throw new Error(detail || `Server returned ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Blackbaud-Content-Executive-Briefing.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg || "PDF generation failed. Please try again.");
      setStatus("error");
    }
  }

  const isGenerating = status === "generating";

  return (
    <div className="export-pdf-wrap">
      <button
        id="export-pdf"
        type="button"
        disabled={isGenerating}
        onClick={handleExportPdf}
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="pdf-spinner" aria-hidden="true" />
            Generating… <span className="pdf-time-hint">(~25 seconds)</span>
          </>
        ) : (
          "Download PDF"
        )}
      </button>
      {status === "error" && (
        <span className="pdf-error" role="alert">
          {errorMessage}
        </span>
      )}
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

function PageView({ page }) {
  return (
    <main className="content">
      <div className="top-toolbar">
        <ToggleButton />
        <ExportPdfButton />
      </div>
      <h1 className="page-title">{page.title}</h1>
      <p className="page-subtitle">{page.subtitle}</p>
      <div className="card-grid">
        {page.blocks.map((block) => (
          <article className="card" key={block.heading}>
            <h3>{block.heading}</h3>
            {block.copy && <p>{block.copy}</p>}
            <MetricList metrics={block.metrics} />
            {block.list && (
              <ul>
                {block.list.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            )}
            <DecisionPromptList title="Decision Prompts" prompts={block.decisionPrompts} />
            <DecisionPromptList title="Dependencies and Risks" prompts={block.risks} />
            <LinkList links={block.links} />
          </article>
        ))}
      </div>
      <ScorecardSection scoreRows={page.scoreRows} />
      {page.enablement && (
        <>
          <h2>Suggested Trailhead Enablement</h2>
          <div className="card-grid">
            {page.enablement.map((item) => (
              <EnablementCard key={`${item.title}-${item.role}`} item={item} />
            ))}
          </div>
        </>
      )}
      <EnablementGroups groups={page.enablementGroups} />
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

function Sidebar() {
  const location = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return searchIndex.filter((item) =>
      `${item.code} ${item.name} ${item.location} ${item.tags || ""}`.toLowerCase().includes(q)
    );
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
          placeholder="Find capability, scorecard dimension, or enablement track..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <div className="search-results open">
            {results.length === 0 ? (
              <div className="search-item">No matches yet</div>
            ) : (
              results.map((item) => (
                <Link to={item.path} key={`${item.code}-${item.path}`} className="search-item">
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
                <Link key={page.path} className={`nav-item ${location.pathname === page.path ? "active" : ""}`} to={page.path}>
                  {page.title}
                </Link>
              ))}
          </div>
        </div>
      ))}
      <div style={{ marginTop: "auto", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
        {user?.primaryEmailAddress?.emailAddress && (
          <p style={{
            fontSize: "0.72rem",
            color: "#97bdc8",
            padding: "0 0.45rem 0.4rem",
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>
            {user.primaryEmailAddress.emailAddress}
          </p>
        )}
        <button
          type="button"
          onClick={() => signOut({ redirectUrl: "/" })}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            width: "100%",
            color: "#cde5eb",
            padding: "0.5rem 0.45rem 0.5rem 0.62rem",
            fontSize: "0.88rem",
          }}
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── Clerk auth components ───────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p>Loading…</p>
      </div>
    </div>
  );
}

function DomainGate({ children }) {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <LoadingScreen />;

  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  if (user && !isAllowedDomain(email)) return <DomainRejected />;

  return <>{children}</>;
}

function DomainRejected() {
  const { signOut } = useClerk();
  const hasSignedOutRef = useRef(false);

  useEffect(() => {
    if (hasSignedOutRef.current) return;
    hasSignedOutRef.current = true;
    const timer = window.setTimeout(() => {
      void signOut({ redirectUrl: "/" });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [signOut]);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <img src="/blackbaud-favicon.png" alt="Blackbaud" className="auth-icon" />
        <h1>Access Restricted</h1>
        <p>
          This site is available to <strong>blackbaud.com</strong> and{" "}
          <strong>salesforce.com</strong> email domains only.
          You are being signed out.
        </p>
      </div>
    </div>
  );
}

function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn) return <Navigate to="/" replace />;
  return (
    <div className="auth-shell">
      <SignIn routing="path" path="/sign-in" />
    </div>
  );
}

function SignUpPage() {
  const { isLoaded, isSignedIn } = useAuth();
  if (isLoaded && isSignedIn) return <Navigate to="/" replace />;
  return (
    <div className="auth-shell">
      <SignUp routing="path" path="/sign-up" />
    </div>
  );
}

function Landing() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <img src="/blackbaud-favicon.png" alt="Blackbaud" className="auth-icon" />
        <h1>Blackbaud Content Management Rationalization</h1>
        <p>Salesforce Executive Discussion Site</p>
        <div className="domain-pill-row">
          {ALLOWED_DOMAINS.map((domain) => (
            <span key={domain} className="domain-pill">@{domain}</span>
          ))}
        </div>
        <div className="auth-login-anchor">
          <Link to="/sign-in" className="auth-fallback-button">Sign In</Link>
          <Link to="/sign-up" className="auth-fallback-button">Request Access</Link>
        </div>
      </div>
    </div>
  );
}

function HomeRoute() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  if (isSignedIn) return <DomainGate><ProtectedApp /></DomainGate>;
  return <Landing />;
}

// ── Auth gate for deep-linked protected routes ──────────────────────────────
function AuthGate() {
  const { isLoaded, isSignedIn } = useAuth();
  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to="/sign-in" replace />;
  return <DomainGate><ProtectedApp /></DomainGate>;
}

// ── Error boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div className="auth-shell">
          <div className="auth-card">
            <h1>Something went wrong</h1>
            <pre style={{ fontSize: "0.8rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {this.state.error?.message}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Clerk router integration ────────────────────────────────────────────────
function ClerkProviderWithRoutes() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/"
      afterSignUpUrl="/"
      localization={{
        signIn: {
          start: {
            title: "Blackbaud Content",
            subtitle: "Sign in to the Executive Discussion Site",
          },
        },
        signUp: {
          start: {
            title: "Request Access",
            subtitle: "Create an account to access the site",
          },
        },
      }}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="*" element={<AuthGate />} />
      </Routes>
    </ClerkProvider>
  );
}

// ── Protected app ───────────────────────────────────────────────────────────
function ProtectedApp() {
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

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ClerkProviderWithRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
