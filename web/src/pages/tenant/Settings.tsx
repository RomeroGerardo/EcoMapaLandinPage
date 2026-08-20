import { Building, CreditCard, Bell } from "lucide-react";
import { SectionHeader } from "../../components/shared/SectionHeader";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function Settings() {
  const activeTenant = useAuthStore((state) => state.activeTenant);

  return (
    <div className="p-6 md:p-8 space-y-6 h-full">
      <SectionHeader
        title="Configuración de la Entidad"
        subtitle="Administra el perfil y los ajustes de tu organización en EcoMapa."
        icon={Building}
        iconBgColorClass="bg-green-600/10"
        iconColorClass="text-green-600"
      />

      <div className="grid gap-6">
        {/* Perfil de la Organización */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-green-600" />
              <CardTitle>Perfil de la Organización</CardTitle>
            </div>
            <CardDescription>
              Información pública que verán los usuarios en la app móvil.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="org-name">Nombre de la Entidad</Label>
                <Input id="org-name" defaultValue={activeTenant?.name || ""} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="org-type">Tipo</Label>
                <Input id="org-type" defaultValue={activeTenant?.type || ""} disabled className="capitalize" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="org-email">Email de Contacto</Label>
                <Input id="org-email" defaultValue={`${activeTenant?.name?.toLowerCase().replace(/\s+/g, '') || 'contacto'}@ejemplo.com`} />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="bg-green-600 hover:bg-green-700">Guardar Cambios</Button>
          </CardFooter>
        </Card>

        {/* Plan y Facturación */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-600" />
              <CardTitle>Suscripción y Facturación</CardTitle>
            </div>
            <CardDescription>
              Gestiona tu nivel de acceso y cuotas mensuales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border bg-green-50 border-green-200">
              <h4 className="font-semibold text-green-800">Plan Actual: Básico</h4>
              <p className="text-sm text-green-700 mt-1">
                Tienes acceso al registro de puntos ilimitados. Para obtener estadísticas avanzadas y destacar tus puntos en el mapa, actualiza tu plan.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
              Mejorar Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-green-600" />
              <CardTitle>Preferencias de Notificación</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Resumen Semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe un correo con las métricas de uso de tus puntos.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-green-600 focus:ring-green-600 border-gray-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
