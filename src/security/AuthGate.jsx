import { useEffect, useMemo, useState } from "react";

const ALLOWED_DOMAINS = ["blackbaud.com", "salesforce.com"];

function ReplitAuthLogin() {
  useEffect(() => {
    const existing = document.querySelector("script[data-replit-auth]");
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://auth.util.repl.co/script.js";
    script.setAttribute("authed", "window.location.reload()");
    script.setAttribute("data-replit-auth", "true");
    document.body.appendChild(script);
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div className="auth-login-anchor">
      <div className="replit-auth-button" data-theme="light" />
      <a className="auth-fallback-button" href="/__replauth">
        Sign in with Replit
      </a>
    </div>
  );
}

function AuthShell({ title, message, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <img src="/blackbaud-favicon.png" alt="Blackbaud" className="auth-icon" />
        <h1>{title}</h1>
        <p>{message}</p>
        <div className="domain-pill-row" aria-label="Allowed domains">
          {ALLOWED_DOMAINS.map((domain) => (
            <span key={domain} className="domain-pill">
              {domain}
            </span>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}

export function AuthGate({ children }) {
  const [session, setSession] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", { credentials: "include" });
        const payload = await response.json();
        if (cancelled) return;
        if (response.ok && payload.allowed) {
          setSession({ status: "allowed", user: payload });
        } else if (response.status === 401) {
          setSession({ status: "unauthenticated" });
        } else {
          setSession({ status: "forbidden", user: payload });
        }
      } catch (_error) {
        if (!cancelled) {
          setSession({ status: "error" });
        }
      }
    }
    loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const content = useMemo(() => {
    if (session.status === "loading") {
      return <AuthShell title="Loading access" message="Checking your secure session..." />;
    }
    if (session.status === "unauthenticated") {
      return (
        <AuthShell
          title="Sign in required"
          message="Use Replit Auth to continue. Access is limited to users with blackbaud.com or salesforce.com email domains."
        >
          <ReplitAuthLogin />
        </AuthShell>
      );
    }
    if (session.status === "forbidden") {
      return (
        <AuthShell
          title="Access restricted"
          message={`Signed in as ${session?.user?.email || "unknown user"}, but this site only allows blackbaud.com or salesforce.com domains.`}
        >
          <ReplitAuthLogin />
        </AuthShell>
      );
    }
    if (session.status === "error") {
      return (
        <AuthShell
          title="Authentication error"
          message="Unable to validate your session. Please retry login in Replit or contact the site owner."
        />
      );
    }
    return children;
  }, [session, children]);

  return content;
}
