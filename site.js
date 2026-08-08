const NAV_STATE_KEY = "bbContentNavCollapsed";

const pages = [
  { href: "index.html", title: "Executive Summary" },
  { href: "context.html", title: "Operating Context" },
  { href: "theme-1.html", title: "1. Integration and Signal Flow" },
  { href: "theme-2.html", title: "2. In-Workflow Seller Experience" },
  { href: "theme-3.html", title: "3. Content Governance and Distribution" },
  { href: "theme-4.html", title: "4. Intelligence and Attribution" },
  { href: "theme-5.html", title: "5. Security, Trust, and Adoption" },
  { href: "capability-map.html", title: "Capability Sequencing" },
  { href: "domain-map.html", title: "Salesforce Domain Map" },
  { href: "enablement-roadmap.html", title: "Trailhead Enablement Roadmap" },
  { href: "external-research.html", title: "External Research" },
  { href: "forward-looking-statement.html", title: "Forward Looking Statement" }
];

const capabilityIndex = [
  { code: "DAG", name: "Agentic AI / Autonomous Agents", description: "Drive context-aware recommendations for content and next-best actions.", location: "Themes 2, 4", pageTitle: "In-Workflow Seller Experience", pageHref: "theme-2.html" },
  { code: "DDH", name: "Data Harmonization", description: "Unify SharePoint, CRM, and call signal metadata for retrieval and governance.", location: "Themes 1, 3", pageTitle: "Integration and Signal Flow", pageHref: "theme-1.html" },
  { code: "DVS", name: "Vector Search and RAG Grounding", description: "Power semantic retrieval with source citations and governance control.", location: "Themes 2, 4", pageTitle: "In-Workflow Seller Experience", pageHref: "theme-2.html" },
  { code: "DEL", name: "Einstein Trust Layer", description: "Enforce zero-retention controls, masking, and AI interaction auditability.", location: "Theme 5", pageTitle: "Security, Trust, and Adoption", pageHref: "theme-5.html" },
  { code: "SEM", name: "Sales Enablement", description: "Deliver stage-specific content guidance directly in seller flow.", location: "Theme 2", pageTitle: "In-Workflow Seller Experience", pageHref: "theme-2.html" },
  { code: "SGS", name: "Guided Solution Selling", description: "Standardize executive deal narratives and stage progression guidance.", location: "Theme 2", pageTitle: "In-Workflow Seller Experience", pageHref: "theme-2.html" },
  { code: "SDS", name: "Deal Support Requests", description: "Route specialized content requests and escalation loops to SMEs.", location: "Theme 3", pageTitle: "Content Governance and Distribution", pageHref: "theme-3.html" },
  { code: "MCN", name: "Content Management", description: "Operate the governed content lifecycle from intake to multichannel publishing.", location: "Theme 3", pageTitle: "Content Governance and Distribution", pageHref: "theme-3.html" },
  { code: "MMA", name: "Marketing Analytics", description: "Connect usage behavior to conversion outcomes and campaign strategy.", location: "Theme 4", pageTitle: "Intelligence and Attribution", pageHref: "theme-4.html" },
  { code: "SSA", name: "Sales Analytics", description: "Track adoption, seller behavior, and revenue influence of content decisions.", location: "Theme 4", pageTitle: "Intelligence and Attribution", pageHref: "theme-4.html" },
  { code: "ABI", name: "Embedded BI and Dashboards", description: "Embed decision-ready insight inside seller and leadership workflows.", location: "Theme 4", pageTitle: "Intelligence and Attribution", pageHref: "theme-4.html" },
  { code: "IMS", name: "Microsoft Ecosystem Integration", description: "Preserve flow-of-work value for a Teams-first operating model.", location: "Theme 1", pageTitle: "Integration and Signal Flow", pageHref: "theme-1.html" },
  { code: "IEI", name: "Enterprise Integration", description: "Create resilient connectivity across content systems and intelligence tools.", location: "Theme 1", pageTitle: "Integration and Signal Flow", pageHref: "theme-1.html" },
  { code: "IEP", name: "Enterprise Platform Connectors", description: "Accelerate integration time with reusable connector frameworks.", location: "Theme 1", pageTitle: "Integration and Signal Flow", pageHref: "theme-1.html" },
  { code: "PGV", name: "Data Governance and Privacy", description: "Ensure compliance-grade handling of content, identity, and AI data.", location: "Theme 5", pageTitle: "Security, Trust, and Adoption", pageHref: "theme-5.html" },
  { code: "VKB", name: "Knowledge Management", description: "Codify and scale institutional knowledge for reusable field execution.", location: "Theme 5", pageTitle: "Security, Trust, and Adoption", pageHref: "theme-5.html" },
  { code: "VLN", name: "Training and Onboarding", description: "Strengthen adoption with role-based enablement and reinforcement loops.", location: "Theme 5", pageTitle: "Security, Trust, and Adoption", pageHref: "theme-5.html" },
  { code: "ORE", name: "Recommendations and Experience", description: "Deliver role-tailored content to broader GTM audiences via portal models.", location: "Capability Sequencing", pageTitle: "Capability Sequencing", pageHref: "capability-map.html" },
  { code: "VSS", name: "Self Service", description: "Extend governed access to non-CRM GTM personas through controlled experiences.", location: "Capability Sequencing", pageTitle: "Capability Sequencing", pageHref: "capability-map.html" }
];

function buildNav(currentPage) {
  const nav = document.getElementById("nav-content");
  if (!nav) return;
  const overview = pages.slice(0, 2);
  const vignettes = pages.slice(2, 7);
  const architecture = pages.slice(7, 10);
  const appendix = pages.slice(10);

  const section = (title, items) => `
    <div class="group-label">${title}</div>
    <div class="nav-list">
      ${items
        .map(
          (item) =>
            `<a class="nav-item ${item.href === currentPage ? "active" : ""}" href="${item.href}">${item.title}</a>`
        )
        .join("")}
    </div>
  `;

  nav.innerHTML = `
    <div class="group-label">Search</div>
    <div class="search-wrap">
      <input id="capability-search" type="search" placeholder="Find capability, code, or location..." />
      <div id="search-results" class="search-results" role="listbox" aria-label="Capability search results"></div>
    </div>
    ${section("Overview", overview)}
    ${section("Vignettes", vignettes)}
    ${section("Architecture", architecture)}
    ${section("Appendix", appendix)}
  `;
}

function applyNavState() {
  const collapsed = localStorage.getItem(NAV_STATE_KEY) === "1";
  document.body.classList.toggle("nav-collapsed", collapsed);
  const button = document.getElementById("nav-toggle");
  if (button) button.textContent = collapsed ? "Show Navigation" : "Hide Navigation";
}

function setupToggle() {
  const button = document.getElementById("nav-toggle");
  if (!button) return;
  button.addEventListener("click", () => {
    const collapsed = document.body.classList.toggle("nav-collapsed");
    localStorage.setItem(NAV_STATE_KEY, collapsed ? "1" : "0");
    button.textContent = collapsed ? "Show Navigation" : "Hide Navigation";
  });
}

function setupSearch() {
  const input = document.getElementById("capability-search");
  const shell = document.getElementById("search-results");
  if (!input || !shell) return;
  let selectedIndex = -1;
  let filtered = [];

  const close = () => shell.classList.remove("open");
  const open = () => shell.classList.add("open");

  function render() {
    if (filtered.length === 0) {
      shell.innerHTML = `<div class="search-header"><span>No matches yet</span><button id="close-search" type="button">Close</button></div>`;
      open();
      document.getElementById("close-search").onclick = close;
      return;
    }
    shell.innerHTML = `
      <div class="search-header">
        <span>${filtered.length} result(s)</span>
        <button id="close-search" type="button">Close</button>
      </div>
      <div class="search-list">
      ${filtered
        .map(
          (item, idx) => `
          <div class="search-item ${idx === selectedIndex ? "active" : ""}" data-index="${idx}">
            <strong>${item.code}: ${item.name}</strong>
            <span>${item.description}</span>
            <span>${item.location} -> ${item.pageTitle}</span>
          </div>`
        )
        .join("")}
      </div>
    `;
    document.getElementById("close-search").onclick = close;
    Array.from(shell.querySelectorAll(".search-item")).forEach((element) => {
      element.addEventListener("click", () => {
        const item = filtered[Number(element.dataset.index)];
        location.href = item.pageHref;
      });
    });
    open();
  }

  function filter() {
    const value = input.value.trim().toLowerCase();
    selectedIndex = -1;
    if (!value) {
      shell.classList.remove("open");
      return;
    }
    filtered = capabilityIndex.filter((entry) =>
      `${entry.code} ${entry.name} ${entry.description} ${entry.location} ${entry.pageTitle}`.toLowerCase().includes(value)
    );
    render();
  }

  input.addEventListener("input", filter);
  input.addEventListener("focus", () => {
    if (input.value.trim()) filter();
  });
  input.addEventListener("keydown", (event) => {
    if (!shell.classList.contains("open")) return;
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, filtered.length - 1);
      render();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      render();
    } else if (event.key === "Enter" && selectedIndex >= 0) {
      location.href = filtered[selectedIndex].pageHref;
    }
  });

  document.addEventListener("click", (event) => {
    if (!shell.contains(event.target) && event.target !== input) close();
  });
}

function init() {
  const currentPage = location.pathname.split("/").pop() || "index.html";
  buildNav(currentPage);
  applyNavState();
  setupToggle();
  setupSearch();
}

document.addEventListener("DOMContentLoaded", init);
