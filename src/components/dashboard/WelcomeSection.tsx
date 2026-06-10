export function WelcomeSection({ name }: { name: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        Welcome back, {name}! <span aria-hidden>👋</span>
      </h1>
      <p className="mt-1 text-muted-foreground">
        Here&apos;s what&apos;s happening in your organization today.
      </p>
    </div>
  );
}
