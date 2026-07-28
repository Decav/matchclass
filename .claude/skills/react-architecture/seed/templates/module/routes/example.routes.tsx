// Template: {feature}.routes.tsx
// Renombrar "example" con el nombre de tu feature

import { Route } from 'react-router-dom';
// import { Q5ExamplePage } from '../components/q5-example-page/q5-example-page';
// import { Q5ExampleDetailPage } from '../components/q5-example-detail-page/q5-example-detail-page';

// Estas rutas se integran en src/app/router.tsx
// Uso:
//   import { exampleRoutes } from '@modules/example/routes/example.routes';
//   ...
//   { element: <ProtectedRoute />, children: [...exampleRoutes] }

export const exampleRoutes = [
  <Route
    key="examples"
    path="/examples"
    element={<div>TODO: Q5ExamplePage</div>}
    // element={<Q5ExamplePage />}
  />,
  <Route
    key="example-detail"
    path="/examples/:id"
    element={<div>TODO: Q5ExampleDetailPage</div>}
    // element={<Q5ExampleDetailPage />}
  />,
];
