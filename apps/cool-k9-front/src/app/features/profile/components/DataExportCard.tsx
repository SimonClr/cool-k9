import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiExportMyData } from '../api/user.api';
import { downloadDataExport } from '../utils/data-export.utils';

export function DataExportCard() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await apiExportMyData();
      downloadDataExport(data);
      toast.success('Export téléchargé !');
    } catch {
      toast.error("L'export a échoué. Veuillez réessayer.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-medium">Mes données</h2>
          <p className="text-sm text-muted-foreground">
            Téléchargez une copie de vos données personnelles : votre compte, vos chiens, vos
            séances, vos préférences d'affichage et la preuve de votre consentement. Le fichier
            est au format JSON.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={handleExport}
          disabled={exporting}
          aria-busy={exporting}
        >
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Exporter mes données
        </Button>
      </CardContent>
    </Card>
  );
}
