"use client"

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Using Architect
        </h1>
        <p className="text-muted-foreground text-sm">
          A quick reference guide to deploying and configuring your projects.
        </p>
      </div>

      <hr className="border-border" />

      {/* Main Guide */}
      <div className="space-y-6 text-sm text-foreground/90 leading-relaxed">
        
        {/* Step 1 */}
        <section className="space-y-2.5">
          <h2 className="text-lg font-bold text-foreground">1. Deploy a Project</h2>
          <p>
            Go to the <span className="font-semibold">Projects</span> page and click <span className="font-semibold">New Project</span>. Connect your GitHub repository and set up the following build configurations:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-muted-foreground pl-2">
            <li>
              <span className="font-semibold text-foreground">Vite Presets:</span> Set build command to <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">npm run build</code> and output folder to <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">dist</code>.
            </li>
            <li>
              <span className="font-semibold text-foreground">Static Presets:</span> Leave build command empty and set output folder to <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">.</code>.
            </li>
          </ul>
        </section>

        {/* Step 2 */}
        <section className="space-y-2.5">
          <h2 className="text-lg font-bold text-foreground">2. Manage Environment Variables</h2>
          <p>
            Add your app configurations and secrets under the <span className="font-semibold">Environment Variables</span> tab in your project settings.
          </p>
          <p className="text-muted-foreground">
            Secrets are loaded into the build process during compilation and will be available via standard bundler environment objects (e.g., <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground text-xs">import.meta.env</code> or <code className="font-mono bg-muted px-1 py-0.5 rounded text-foreground text-xs">process.env</code>).
          </p>
        </section>

        {/* Step 3 */}
        <section className="space-y-2.5">
          <h2 className="text-lg font-bold text-foreground">3. Subdomain Assignment</h2>
          <p>
            Upon creation, every project is automatically assigned a unique subdomain. You can view or change your assigned subdomains on the <span className="font-semibold">Domains</span> tab inside your project dashboard.
          </p>
          <p className="text-muted-foreground">
            Updating the domain hostname updates the endpoint prefix. Your application is immediately accessible under the newly modified domain.
          </p>
        </section>

      </div>
    </div>
  )
}
