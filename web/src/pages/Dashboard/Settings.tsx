import { Save, Server, Shield, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Settings() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configuración del Sistema</h2>
        <p className="text-muted-foreground">Administra las integraciones, claves API y ajustes globales de la plataforma.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <CardTitle>Integración de Inteligencia Artificial (Groq)</CardTitle>
            </div>
            <CardDescription>
              Configura el modelo y la clave API de Groq que da vida al chat inteligente de la app móvil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="groq-api-key">Groq API Key</Label>
              <Input id="groq-api-key" type="password" defaultValue="gsk_**************************************" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="groq-model">Modelo por Defecto</Label>
              <Input id="groq-model" defaultValue="llama3-70b-8192" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <CardTitle>Base de Datos (Supabase)</CardTitle>
            </div>
            <CardDescription>
              Conexión actual con el backend y las políticas de retención.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Supabase URL</Label>
              <Input disabled defaultValue="https://uuagrhbdgyvopezoakia.supabase.co" />
            </div>
            <div className="space-y-1">
              <Label>Supabase Anon Key</Label>
              <Input disabled type="password" defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline">Verificar Conexión</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Seguridad y Permisos</CardTitle>
            </div>
            <CardDescription>
              Ajustes de privacidad y creación de nuevas entidades.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Permitir Registro Libre</Label>
                <p className="text-sm text-muted-foreground">
                  Cualquier persona puede registrar una farmacia sin aprobación previa.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
