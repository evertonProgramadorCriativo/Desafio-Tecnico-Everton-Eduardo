import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redireciona raiz para tabs
  {
    path: '',
    redirectTo: 'tabs/home',
    pathMatch: 'full',
  },

  // Estrutura principal com tab bar
  {
    path: 'tabs',
    loadComponent: () => import('./tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      // Tab 1 — Dashboard home
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
      },

      // Tab 2 — Lista de crianças
      {
        path: 'children',
        loadComponent: () =>
          import('./children/children-list/children-list.page').then(
            (m) => m.ChildrenListPage,
          ),
      },

      // Tab 2 — Perfil individual da criança (navegando da Home ou da lista)
      {
        path: 'children/:id',
        loadComponent: () =>
          import('./children/child-profile/child-profile.page').then(
            (m) => m.ChildProfilePage,
          ),
      },

      // Tab 3 — Catálogo de vacinas
      {
        path: 'vaccines',
        loadComponent: () =>
          import('./vaccines/vaccines-list/vaccines-list.page').then(
            (m) => m.VaccinesListPage,
          ),
      },

      // Tab 3 — Detalhe de uma vacina
      {
        path: 'vaccines/:id',
        loadComponent: () =>
          import('./vaccines/vaccine-detail/vaccine-detail.page').then(
            (m) => m.VaccineDetailPage,
          ),
      },

      // Tab 4 — Campanhas de vacinação
      {
        path: 'campaigns',
        loadComponent: () =>
          import('./campaigns/campaigns-list/campaigns-list.page').then(
            (m) => m.CampaignsListPage,
          ),
      },

      // Fallback dentro das tabs
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
    ],
  },
];
