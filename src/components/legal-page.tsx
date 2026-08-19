import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, Hammer } from 'lucide-react';

export function LegalPage({ title, summary, children }: { title: string; summary: string; children: ReactNode }) {
    return (
        <main className="min-h-screen bg-[#08090d] text-slate-100">
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.13),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.1),transparent_34%)]" />
            <div className="relative mx-auto max-w-4xl px-6 py-10 sm:py-16">
                <nav className="mb-16 flex items-center justify-between">
                    <Link href="/landing" className="flex items-center gap-3 font-semibold tracking-tight">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500">
                            <Hammer className="h-5 w-5 text-white" />
                        </span>
                        Floor Ops Pro
                    </Link>
                    <Link href="/landing" className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
                        <ArrowLeft className="h-4 w-4" />Back to site
                    </Link>
                </nav>

                <header className="mb-12 border-b border-white/10 pb-10">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-violet-400">Legal</p>
                    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-400">{summary}</p>
                    <p className="mt-5 text-sm text-slate-500">Last updated August 19, 2026</p>
                </header>

                <article className="space-y-10 text-[15px] leading-7 text-slate-300 [&_a]:text-cyan-400 [&_a]:underline-offset-4 hover:[&_a]:underline [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                    {children}
                </article>

                <footer className="mt-16 border-t border-white/10 pt-8 text-sm text-slate-500">
                    Questions can be sent to <a href="mailto:hello@floorops.pro">hello@floorops.pro</a>.
                </footer>
            </div>
        </main>
    );
}
