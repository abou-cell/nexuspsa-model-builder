import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, Subscription } from 'rxjs';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

interface NavGroup {
  label: string;
  items: readonly NavItem[];
}

interface WorkspaceTab {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <header class="global-topbar">
        <a class="brand" routerLink="/model-builder/hydraulic">
          <span class="brand-mark">N</span>
          <span>
            <strong>NexusPSA</strong>
            <small>Model Builder</small>
          </span>
        </a>

        <button class="project-switcher" type="button">
          <span>Project</span>
          <strong>NPP Example Project</strong>
          <span>⌄</span>
        </button>

        <button class="global-search" type="button">
          <span>⌕</span>
          <span>Search systems, components, knowledge-base classes…</span>
          <kbd>Ctrl K</kbd>
        </button>

        <div class="top-actions">
          <button type="button" class="ghost">Import</button>
          <button type="button" class="ghost">Export</button>
          <button type="button" class="save-model">Save model</button>
          <button type="button" class="run" routerLink="/generation">Generate FT</button>
          <button type="button" class="avatar" title="PRA Engineer">AR</button>
        </div>
      </header>

      <aside class="sidebar">
        <nav>
          <section *ngFor="let group of navigation">
            <h2>{{ group.label }}</h2>
            <a *ngFor="let item of group.items" [routerLink]="item.route" routerLinkActive="active">
              <span class="nav-icon">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </a>
          </section>
        </nav>
        <footer>
          <div class="cloud-status"><span></span> Model Builder workspace online</div>
          <div>Angular 22 · GoJS 4 · NextPSA-compatible UI</div>
        </footer>
      </aside>

      <div class="workspace-tabs">
        <button
          *ngFor="let tab of openTabs"
          type="button"
          class="workspace-tab"
          [class.active]="isTabActive(tab)"
          (click)="activateTab(tab)">
          <span class="tab-icon">{{ tab.icon }}</span>
          <span>{{ tab.label }}</span>
          <span class="tab-close" *ngIf="openTabs.length > 1" (click)="closeTab($event, tab)">×</span>
        </button>
        <button type="button" class="new-tab" title="Open another workspace">+</button>
        <span class="workspace-tabs-spacer"></span>
        <span class="workspace-state"><i></i> Workspace online</span>
      </div>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    :host { display:block; height:100%; }
    .app-shell { height:100%; display:grid; grid-template-columns:216px minmax(0,1fr); grid-template-rows:58px 34px minmax(0,1fr); background:var(--nps-app-bg); }
    .global-topbar { grid-column:1/-1; grid-row:1; background:var(--nps-topbar); color:#fff; display:flex; align-items:center; gap:14px; padding:0 14px; box-shadow:0 1px 0 rgba(255,255,255,.06); z-index:20; }
    .brand { width:202px; display:flex; align-items:center; gap:9px; color:#fff; text-decoration:none; }
    .brand-mark { width:30px; height:30px; display:grid; place-items:center; border-radius:9px; background:linear-gradient(135deg,#38bdf8,#2563eb); font-weight:900; }
    .brand strong,.brand small { display:block; }
    .brand strong { font-size:14px; }
    .brand small { margin-top:1px; color:#a9c3df; font-size:8px; letter-spacing:.04em; }
    .project-switcher,.global-search,.top-actions button { height:36px; border:1px solid rgba(255,255,255,.1); border-radius:9px; color:#e8f2ff; background:#173454; font:inherit; }
    .project-switcher { width:240px; display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:7px; padding:0 11px; text-align:left; cursor:pointer; }
    .project-switcher span { color:#9db7d2; font-size:8px; }
    .project-switcher strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:10px; }
    .global-search { flex:1; max-width:620px; display:flex; align-items:center; gap:9px; padding:0 11px; color:#a9c3df; font-size:10px; }
    .global-search kbd { margin-left:auto; border:1px solid #42627e; border-radius:5px; padding:2px 5px; background:#102945; color:#cfe0f2; font:8px Inter,sans-serif; }
    .top-actions { margin-left:auto; display:flex; align-items:center; gap:6px; }
    .top-actions button { padding:0 10px; cursor:pointer; font-size:9px; }
    .top-actions .ghost { background:transparent; }
    .top-actions .save-model { background:#173454; color:#fff; font-weight:700; }
    .top-actions .run { background:var(--nps-blue); border-color:var(--nps-blue); color:#fff; font-weight:700; }
    .top-actions .avatar { width:36px; padding:0; border-radius:50%; background:#e0ecff; color:#173454; font-weight:800; }

    .sidebar { grid-column:1; grid-row:2/4; min-height:0; display:flex; flex-direction:column; background:var(--nps-sidebar); color:#dceaff; border-right:1px solid #173454; }
    .sidebar nav { flex:1; overflow:auto; padding:12px 9px; }
    .sidebar section { margin-bottom:14px; }
    .sidebar h2 { margin:0 9px 5px; font-size:8px; letter-spacing:.1em; color:#809ab7; font-weight:800; }
    .sidebar a { height:31px; display:flex; align-items:center; gap:9px; padding:0 10px; border-radius:7px; color:#c5d7eb; text-decoration:none; font-size:10px; }
    .sidebar a:hover { background:#102945; }
    .sidebar a.active { background:#1d4ed8; color:#fff; font-weight:700; box-shadow:inset 0 0 0 1px rgba(255,255,255,.08); }
    .nav-icon { width:16px; text-align:center; font-size:11px; }
    .sidebar footer { padding:11px 13px; border-top:1px solid #173454; color:#7892ae; font-size:8px; line-height:1.6; }
    .cloud-status { color:#b5cbe1; }
    .cloud-status span { display:inline-block; width:6px; height:6px; margin-right:5px; border-radius:50%; background:#22c55e; }

    .workspace-tabs { grid-column:2; grid-row:2; min-width:0; display:flex; align-items:end; gap:2px; padding:3px 10px 0; background:#edf3f9; border-bottom:1px solid var(--nps-border); overflow:hidden; }
    .workspace-tab { max-width:190px; height:30px; display:flex; align-items:center; gap:6px; padding:0 10px; border:1px solid transparent; border-bottom:0; border-radius:6px 6px 0 0; background:transparent; color:#64748b; font:600 8px Inter,sans-serif; cursor:pointer; white-space:nowrap; }
    .workspace-tab:hover { background:#f8fbff; color:#334155; }
    .workspace-tab.active { background:#fff; color:#1d4ed8; border-color:var(--nps-border); box-shadow:0 -2px 0 #2563eb inset; }
    .tab-icon { width:13px; text-align:center; }
    .tab-close { margin-left:3px; color:#94a3b8; font-size:12px; line-height:1; }
    .tab-close:hover { color:#dc2626; }
    .new-tab { width:28px; height:27px; margin-bottom:1px; border:1px solid var(--nps-border); border-radius:5px; background:#f8fbff; color:#64748b; cursor:pointer; }
    .workspace-tabs-spacer { flex:1; }
    .workspace-state { align-self:center; margin-right:4px; color:#64748b; font-size:7px; white-space:nowrap; }
    .workspace-state i { display:inline-block; width:6px; height:6px; margin-right:5px; border-radius:50%; background:#22c55e; }

    .content { grid-column:2; grid-row:3; min-width:0; min-height:0; overflow:hidden; }

    @media (max-width:1300px) {
      .project-switcher { width:190px; }
      .global-search { max-width:420px; }
      .top-actions button { padding:0 7px; }
    }
  `]
})
export class AppComponent implements OnDestroy {
  readonly navigation: readonly NavGroup[] = [
    {
      label: 'MODEL BUILDERS',
      items: [
        { label: 'Hydraulic', route: '/model-builder/hydraulic', icon: '≈' },
        { label: 'Electrical', route: '/model-builder/electrical', icon: 'ϟ' },
        { label: 'I&C', route: '/model-builder/ic', icon: '⌁' },
        { label: 'HVAC', route: '/model-builder/hvac', icon: '◌' }
      ]
    },
    {
      label: 'FAULT TREE',
      items: [
        { label: 'FT Generation', route: '/generation', icon: '⚙' },
        { label: 'Generated FT', route: '/generated-ft', icon: '⌘' }
      ]
    },
    {
      label: 'KNOWLEDGE BASE',
      items: [
        { label: 'Component Classes', route: '/knowledge-base', icon: '▦' },
        { label: 'Rules & Failure Modes', route: '/knowledge-base/rules', icon: 'ƒ' }
      ]
    }
  ];

  openTabs: WorkspaceTab[] = [];
  private readonly subscription: Subscription;

  constructor(private readonly router: Router) {
    this.ensureTabForUrl(this.router.url);
    this.subscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.ensureTabForUrl(event.urlAfterRedirects));
  }

  isTabActive(tab: WorkspaceTab): boolean {
    return this.router.url === tab.route || this.router.url.startsWith(`${tab.route}/`);
  }

  activateTab(tab: WorkspaceTab): void {
    void this.router.navigateByUrl(tab.route);
  }

  closeTab(event: MouseEvent, tab: WorkspaceTab): void {
    event.stopPropagation();
    if (this.openTabs.length <= 1) return;
    const wasActive = this.isTabActive(tab);
    const index = this.openTabs.findIndex(candidate => candidate.route === tab.route);
    this.openTabs = this.openTabs.filter(candidate => candidate.route !== tab.route);
    if (wasActive) {
      const next = this.openTabs[Math.max(0, index - 1)] ?? this.openTabs[0];
      if (next) void this.router.navigateByUrl(next.route);
    }
  }

  private ensureTabForUrl(url: string): void {
    const tab = this.tabFromUrl(url);
    if (!tab) return;
    if (!this.openTabs.some(existing => existing.route === tab.route)) {
      this.openTabs = [...this.openTabs, tab];
    }
  }

  private tabFromUrl(url: string): WorkspaceTab | undefined {
    if (url.startsWith('/model-builder/hydraulic')) return { label: 'Hydraulic Workspace', route: '/model-builder/hydraulic', icon: '≈' };
    if (url.startsWith('/model-builder/electrical')) return { label: 'Electrical Workspace', route: '/model-builder/electrical', icon: 'ϟ' };
    if (url.startsWith('/model-builder/ic')) return { label: 'I&C Workspace', route: '/model-builder/ic', icon: '⌁' };
    if (url.startsWith('/model-builder/hvac')) return { label: 'HVAC Workspace', route: '/model-builder/hvac', icon: '◌' };
    if (url.startsWith('/generation')) return { label: 'FT Generation', route: '/generation', icon: '⚙' };
    if (url.startsWith('/generated-ft')) return { label: 'Generated FT', route: '/generated-ft', icon: '⌘' };
    if (url.startsWith('/knowledge-base/rules')) return { label: 'Rules & Failure Modes', route: '/knowledge-base/rules', icon: 'ƒ' };
    if (url.startsWith('/knowledge-base')) return { label: 'Knowledge Base', route: '/knowledge-base', icon: '▦' };
    return undefined;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
