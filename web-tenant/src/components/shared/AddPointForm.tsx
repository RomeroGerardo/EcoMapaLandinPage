import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  entityType: z.enum(["Municipio", "Empresa Privada"]),
  locationType: z.enum([
    "Contenedor de Reciclaje",
    "Farmacia",
    "Dietética/Zero-Waste",
    "Centro Privado de Compra / Cooperativa",
    "Punto Oficial REP (Marca)",
  ]),
  priceDetail: z.string().optional(),
  producerId: z.string().optional(),
  latitude: z.string().refine((val) => !Number.isNaN(parseFloat(val)), {
    message: "Latitud inválida",
  }),
  longitude: z.string().refine((val) => !Number.isNaN(parseFloat(val)), {
    message: "Longitud inválida",
  }),
});

function MapSelector({ onLocationSelected }: { onLocationSelected: (lat: number, lng: number) => void, defaultLat?: number, defaultLng?: number }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelected(e.latlng.lat, e.latlng.lng);
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export function AddPointForm({ onSuccess }: { onSuccess: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [producers, setProducers] = useState<{ id: string; name: string }[]>([]);
  const activeTenant = useAuthStore((state) => state.activeTenant);

  useEffect(() => {
    supabase.from("producers").select("id, name").then(({ data }) => {
      if (data) setProducers(data);
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      entityType: "Municipio",
      locationType: "Contenedor de Reciclaje",
      priceDetail: "",
      producerId: "",
      latitude: "",
      longitude: "",
    },
  });

  const locationType = form.watch("locationType");
  const lat = form.watch("latitude");
  const lng = form.watch("longitude");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      let typeValue = "general";
      let colorValue = "verde";
      let isPrivate = false;

      if (values.locationType === "Farmacia") {
        typeValue = "farmacia";
        colorValue = "rojo";
      } else if (values.locationType === "Dietética/Zero-Waste") {
        typeValue = "organico";
        colorValue = "verde";
      } else if (values.locationType === "Centro Privado de Compra / Cooperativa") {
        typeValue = "centro_privado";
        colorValue = "naranja";
        isPrivate = true;
      } else if (values.locationType === "Punto Oficial REP (Marca)") {
        typeValue = "rep_oficial";
        colorValue = "azul";
        isPrivate = true;
      }

      const { error } = await supabase.from('recycling_points').insert([
        { 
          name: values.name, 
          type: typeValue, 
          address: values.entityType,
          latitude: parseFloat(values.latitude),
          longitude: parseFloat(values.longitude),
          is_active: true,
          is_approved: true,
          color: colorValue,
          is_private_facility: isPrivate,
          price_per_kg_detail: values.priceDetail || null,
          producer_id: values.producerId || null,
          tenant_id: activeTenant?.id || null
        }
      ]);

      if (error) {
        console.error("Error inserting point:", error);
        alert("Error al registrar el punto. Verifica la consola.");
      } else {
        onSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Punto / Sucursal</FormLabel>
              <FormControl>
                <Input placeholder="Ej. Depósito y Reciclaje Los Pinos / Duracell Oficial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="entityType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Entidad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona la entidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Municipio">Municipio</SelectItem>
                    <SelectItem value="Empresa Privada">Empresa Privada / Cooperativa</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locationType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Locación</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Contenedor de Reciclaje">Contenedor Público de Reciclaje</SelectItem>
                    <SelectItem value="Centro Privado de Compra / Cooperativa">Centro Privado / Compra por Kg</SelectItem>
                    <SelectItem value="Punto Oficial REP (Marca)">Punto Oficial REP (Marca Adherida)</SelectItem>
                    <SelectItem value="Farmacia">Farmacia (Medicamentos)</SelectItem>
                    <SelectItem value="Dietética/Zero-Waste">Dietética / Orgánicos</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Campos condicionales para Centros Privados o Marcas REP */}
        {locationType === "Centro Privado de Compra / Cooperativa" && (
          <FormField
            control={form.control}
            name="priceDetail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tarifas / Precios que Pagan por Material</FormLabel>
                <FormControl>
                  <Input placeholder="Ej. $150/kg aluminio, $50/kg cartón, $300/kg cobre" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {locationType === "Punto Oficial REP (Marca)" && (
          <FormField
            control={form.control}
            name="producerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca o Productor REP Responsable</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona el fabricante" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {producers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Ubicación en el Mapa</label>
          <div className="h-[200px] w-full rounded-md border overflow-hidden z-10">
            <MapContainer center={[-31.4201, -64.1888]} zoom={12} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapSelector 
                defaultLat={-31.4201} 
                defaultLng={-64.1888} 
                onLocationSelected={(lat, lng) => {
                  form.setValue("latitude", lat.toString());
                  form.setValue("longitude", lng.toString());
                }} 
              />
              {lat && lng && !Number.isNaN(parseFloat(lat)) && !Number.isNaN(parseFloat(lng)) && (
                <Marker position={[parseFloat(lat), parseFloat(lng)]} />
              )}
            </MapContainer>
          </div>
          <p className="text-[11px] text-muted-foreground">Haz clic en el mapa para marcar el punto exacto.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitud</FormLabel>
                <FormControl>
                  <Input placeholder="-31.4201" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitud</FormLabel>
                <FormControl>
                  <Input placeholder="-64.1888" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
            {isLoading ? "Registrando..." : "Registrar Eco-Punto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
