import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';

function mensajeDelError(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return `Error ${error.status}: ${error.statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un problema inesperado al mostrar esta pantalla.';
}

export function RouteErrorPage() {
  const error = useRouteError();

  return (
    <main className="grid min-h-screen place-items-center bg-background p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle aria-hidden="true" className="size-6" />
          </div>
          <CardTitle className="font-['Playfair_Display'] text-2xl">
            No pudimos mostrar esta pantalla
          </CardTitle>
          <CardDescription>
            Tus datos están seguros. Puedes volver a intentarlo o regresar al inicio.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div
            className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive"
            role="alert"
          >
            {mensajeDelError(error)}
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3 sm:flex-row">
          <Button className="w-full" onClick={() => window.location.reload()}>
            <RefreshCw aria-hidden="true" />
            Intentar nuevamente
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => window.location.assign('/')}
          >
            <Home aria-hidden="true" />
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
