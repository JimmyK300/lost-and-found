import React, { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight">
            Lost Item Identifier
          </h1>
          <span className="text-xs text-slate-400">
            MVP · Photo or Features → Quiz
          </span>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-slate-800 bg-slate-900/80">
        <div className="mx-auto max-w-3xl px-4 py-4 text-xs text-slate-500 flex justify-between">
          <span>© {new Date().getFullYear()} Lost Item Identifier</span>
          <span>For demo use only</span>
        </div>
      </footer>
    </div>
  );
}