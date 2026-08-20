import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const authSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type AuthFormData = z.infer<typeof authSchema>;

export function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const form = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (isSignUp) {
        // Registro de usuario en Supabase Auth
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });

        if (error) throw error;

        if (signUpData.session) {
          // Sesión iniciada automáticamente tras registrarse
          navigate(from, { replace: true });
        } else {
          setSuccessMessage(
            '¡Cuenta creada exitosamente! Revisa tu casilla de correo para confirmar tu registro o inicia sesión.'
          );
          setIsSignUp(false);
          form.reset();
        }
      } else {
        // Inicio de sesión
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Credenciales inválidas. Verifica tu correo y contraseña.');
          }
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Debes confirmar tu correo electrónico antes de ingresar.');
          }
          throw error;
        }

        // Navegar a la página previa o al dashboard
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Ocurrió un error al procesar tu solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 p-4 md:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 ring-8 ring-primary/10">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            EcoMapa Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            Plataforma de gestión ambiental y reciclaje inteligente
          </p>
        </div>

        {/* Card Form */}
        <Card className="border-border/60 shadow-xl shadow-black/5 backdrop-blur-sm bg-card/95">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">
              {isSignUp ? 'Crear cuenta de administrador' : 'Iniciar Sesión'}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? 'Ingresa tus credenciales para registrarte en la plataforma'
                : 'Ingresa tus credenciales para acceder al panel de control'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Error Alert */}
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-in fade-in-50">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Success Alert */}
            {successMessage && (
              <div className="flex items-start gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-700 dark:text-green-400 animate-in fade-in-50">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="leading-snug">{successMessage}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo electrónico</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="admin@ecomapa.org"
                            className="pl-9"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-9"
                            disabled={isLoading}
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md shadow-primary/20"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>Procesando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>{isSignUp ? 'Registrarse' : 'Ingresar al Panel'}</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col border-t pt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorMessage(null);
                setSuccessMessage(null);
                form.reset();
              }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
            >
              {isSignUp
                ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                : '¿No tienes cuenta? Regístrate como nuevo administrador'}
            </button>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-muted-foreground">
          EcoMapa V2.1 • Romero Labs
        </p>
      </div>
    </div>
  );
}
