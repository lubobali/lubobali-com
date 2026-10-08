export default function Home() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white font-mono gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Hello Lubo v2</h1>
      <p className="text-sm text-zinc-500">
        Phase 1 foundation — {today}
      </p>
    </main>
  );
}
