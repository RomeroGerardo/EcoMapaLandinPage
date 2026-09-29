import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

const tenantSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  type: z.enum(["municipio", "privado"]),
  subscription_tier: z.enum(["basic", "pro", "enterprise"]),
});

export function Users() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const setActiveTenant = useAuthStore((state) => state.setActiveTenant);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof tenantSchema>>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: "",
      type: "municipio",
      subscription_tier: "basic",
    },
  });

  async function fetchTenants() {
    setIsLoading(true);
    const { data, error } = await supabase.from('tenants').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error("Error fetching tenants:", error);
    }
    if (data) setTenants(data);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchTenants();
  }, []);

  async function onSubmit(values: z.infer<typeof tenantSchema>) {
    const { error } = await supabase.from('tenants').insert([
      { 
        name: values.name, 
        type: values.type, 
        subscription_tier: values.subscription_tier,
        subscription_status: 'active'
      }
    ]);
    
    if (!error) {
      setIsModalOpen(false);
      form.reset();
      fetchTenants();
    } else {
      console.error("Supabase insert error:", error);
      alert(`Error al crear la entidad: ${error.message || 'Desconocido'}`);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Entidades (Tenants)</h2>
          <p className="text-muted-foreground">Administra los municipios y empresas suscritas a EcoMapa.</p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Entidad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva Entidad</DialogTitle>
              <DialogDescription>Crea un nuevo usuario de tipo Municipio o Empresa para que puedan gestionar sus puntos.</DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Entidad</FormLabel>
                      <FormControl>
                        <Input placeholder="Ej. Municipalidad de Córdoba" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Organización</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecciona el tipo" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="municipio">Municipio (B2G)</SelectItem>
                          <SelectItem value="privado">Empresa Privada/Farmacia (B2B)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subscription_tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plan de Suscripción</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Selecciona el plan" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="basic">Plan Basic</SelectItem>
                          <SelectItem value="pro">Plan Pro</SelectItem>
                          <SelectItem value="enterprise">Plan Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full">Registrar Entidad</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">Cargando...</TableCell>
              </TableRow>
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No hay entidades registradas.</TableCell>
              </TableRow>
            ) : (
              tenants.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="capitalize">{t.type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${t.subscription_tier === 'pro' ? 'bg-purple-100 text-purple-700' : t.subscription_tier === 'enterprise' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {t.subscription_tier}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${t.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {t.subscription_status || 'active'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setActiveTenant({ id: t.id, name: t.name, type: t.type });
                        navigate('/backoffice');
                      }}
                    >
                      Acceder al Panel
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
