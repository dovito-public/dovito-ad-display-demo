"use client";

import Navigation from "@/components/navigation";

const BASE_PATH =
  process.env.NODE_ENV === "production" ? "/dovito-ad-display-demo" : "";

const reports = [
  {
    title: "Platform Audit Report",
    href: `${BASE_PATH}/audit-reports/audit-report-2026-04-09.html`,
    description: "Full architecture, quality, security and performance review.",
  },
  {
    title: "SaaS Readiness Report",
    href: `${BASE_PATH}/audit-reports/saas-readiness-2026-04-09.html`,
    description: "SaaS commercialization readiness assessment.",
  },
];

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--dovito-deep-blue))] via-[hsl(var(--dovito-navy))] to-[hsl(var(--dovito-steel-blue))]">
      <Navigation />
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Platform Audit
          </h1>
          <p className="text-white/70 max-w-2xl">
            A third-party audit of the Dovito Ad Display codebase. The reports
            below cover architecture, code quality, security, performance, and
            SaaS readiness. This is the subject of our first public platform
            audit case study.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {reports.map((r) => (
            <div
              key={r.title}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden"
            >
              <div className="p-5 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">{r.title}</h2>
                <p className="text-sm text-white/60 mt-1">{r.description}</p>
              </div>
              <div className="bg-white">
                <iframe
                  src={r.href}
                  title={r.title}
                  className="w-full"
                  style={{ height: "70vh", border: "0" }}
                />
              </div>
              <div className="p-4 text-center">
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3fb9ff] hover:underline text-sm font-medium"
                >
                  Open in new tab
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/50 text-xs mt-8 text-center">
          Audit reports are produced by a separate automated audit agent. If an
          iframe shows a 404, reports have not yet been published.
        </p>
      </div>
    </div>
  );
}
