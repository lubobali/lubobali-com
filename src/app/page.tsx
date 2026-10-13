export default function Home() {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold tracking-tight">Hello Lubo v2</h1>
      <p className="font-mono text-sm text-muted-foreground">
        Phase 2 colour tokens — {today}
      </p>
    </main>
  );
}
