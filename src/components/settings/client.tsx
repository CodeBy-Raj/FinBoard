
'use client';

import { useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { selectWidgets, setWidgets } from '@/lib/redux/slices/widgetsSlice';
import { Upload, Download } from 'lucide-react';
import { useTheme } from 'next-themes';

const settingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  theme: z.enum(["light", "dark", "system"]),
  notifications: z.object({
    marketOpen: z.boolean(),
    priceAlerts: z.boolean(),
    newsletter: z.boolean(),
  }),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function SettingsClient() {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const widgets = useAppSelector(selectWidgets);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: "John Doe",
      email: "john.doe@example.com",
      theme: theme as "light" | "dark" | "system" || "dark",
      notifications: {
        marketOpen: true,
        priceAlerts: false,
        newsletter: true,
      },
    },
  });

  useEffect(() => {
    form.setValue("theme", theme as "light" | "dark" | "system");
  }, [theme, form]);

  function onSubmit(data: SettingsFormValues) {
    setTheme(data.theme);
    toast({
        title: "Settings Saved!",
        description: "Your application settings have been updated.",
    });
  }

  const handleExport = () => {
    const stateToExport = { widgets };
    const jsonString = JSON.stringify(stateToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finboard-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Configuration Exported',
      description: 'Your dashboard layout has been saved to a JSON file.',
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
            throw new Error("File content is not a string");
        }
        const importedState = JSON.parse(text);

        // Basic validation
        if (importedState && Array.isArray(importedState.widgets)) {
          dispatch(setWidgets(importedState.widgets));
          toast({
            title: 'Configuration Imported',
            description: 'Your dashboard has been restored successfully.',
          });
        } else {
            throw new Error("Invalid configuration file format.");
        }
      } catch (error) {
        console.error("Failed to import configuration:", error);
        toast({
          variant: 'destructive',
          title: 'Import Failed',
          description: 'The selected file is not a valid configuration file.',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-headline">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences.</p>
      </div>

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your Email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the app.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a theme" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage your notification preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="notifications.marketOpen"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Market Open</FormLabel>
                                <FormDescription>
                                    Receive a notification when the market opens.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="notifications.priceAlerts"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Price Alerts</FormLabel>
                                <FormDescription>
                                    Get notified when a stock hits your price target.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="notifications.newsletter"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <FormLabel>Newsletter</FormLabel>
                                <FormDescription>
                                    Subscribe to our weekly market analysis newsletter.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Export your current dashboard layout or import a previous one.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <Button type="button" variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Configuration
               </Button>
               <Button type="button" variant="outline" onClick={handleImportClick}>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Configuration
               </Button>
               <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="application/json"
                onChange={handleFileChange}
              />
            </CardContent>
          </Card>


          <div className="flex justify-end">
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
