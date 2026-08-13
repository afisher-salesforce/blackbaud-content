import { useEffect, useMemo, useState } from "react";

const ALLOWED_DOMAINS = ["blackbaud.com", "salesforce.com"];

function ReplitAuthLogin() {
  const returnTo = encodeURIComponent(window.location.origin + window.location.pathname);

  return (
    <div className="auth-login-anchor">
      <a className="auth-fallback-button" href={`/__replauth?redirect=${returnTo}`}>
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
      const emailScopeMessage = session?.user?.missingEmailScope
        ? "Sign-in succeeded, but your app did not receive an email claim. In Replit Auth settings, enable email scope and republish, then retry."
        : `Signed in as ${session?.user?.email || "unknown user"}, but this site only allows blackbaud.com or salesforce.com domains.`;
      return (
        <AuthShell title="Access restricted" message={emailScopeMessage}>
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
