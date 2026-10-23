import { createElement } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { LoginPage } from './pages/LoginPage';
import { MenuClientePage } from './pages/MenuClientePage';
import { AdminPage } from './pages/AdminPage';
import { POSPage } from './pages/POSPage';
import { MesasPage } from './pages/MesasPage';
import { ProductosPage } from './pages/ProductosPage';
import { InventarioPage } from './pages/InventarioPage';
import { ClientesPage } from './pages/ClientesPage';
import { ReportesPage } from './pages/ReportesPage';
import { EmpleadosPage } from './pages/EmpleadosPage';
import { RouteErrorPage } from './pages/RouteErrorPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: RootLayout,
      errorElement: createElement(RouteErrorPage),
      children: [
        // Ruta pública — login
        { index: true, Component: LoginPage },

        // Ruta pública — menú de clientes
        { path: 'menu', Component: MenuClientePage },

        // Rutas protegidas — personal
        {
          Component: StaffLayout,
          children: [
            { path: 'admin',      Component: AdminPage      },
            { path: 'pos',        Component: POSPage        },
            { path: 'mesas',      Component: MesasPage      },
            { path: 'productos',  Component: ProductosPage  },
            { path: 'inventario', Component: InventarioPage },
            { path: 'clientes',   Component: ClientesPage   },
            { path: 'reportes',   Component: ReportesPage   },
            { path: 'empleados',  Component: EmpleadosPage  },
          ],
        },
      ],
    },
  ],
);
