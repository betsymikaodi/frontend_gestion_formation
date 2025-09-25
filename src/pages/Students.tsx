import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthToken } from '@/config/api';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  Download,
  Upload,
  Eye,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import StudentDetailsModal from '@/components/ui/student-details-modal';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

// Interface pour la réponse paginée
interface BackendPaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    page_size: number;
    total_elements: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    first_page: boolean;
    last_page: boolean;
  };
}

// Interface pour l'API Spring Boot
interface Apprenant {
  idApprenant?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  dateNaissance?: string;
  cin: string;
  nomComplet?: string;
  inscriptions?: any[];
}

interface ImportResult {
  total: number;
  inserted: number;
  skipped: number;
  errors: {
    rowNumber: number;
    message: string;
  }[];
}

// Service API
const API_BASE_URL = 'http://localhost:8080/api';

const apiService = {
  async search(params: { [key: string]: any }): Promise<BackendPaginatedResponse<Apprenant>> {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/apprenants?${query}`, {
      headers: {
        'Accept': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Erreur lors de la récupération des apprenants');
    return response.json();
  },

  async create(apprenant: Omit<Apprenant, 'idApprenant'>): Promise<Apprenant> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/apprenants`, {
      method: 'POST',
      headers,
      body: JSON.stringify(apprenant),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la création: ${errorText}`);
    }
    return response.json();
  },

  async update(id: number, apprenant: Apprenant): Promise<Apprenant> {
    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/apprenants/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(apprenant),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la mise à jour: ${errorText}`);
    }
    return response.json();
  },

  async delete(id: number): Promise<void> {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(`${API_BASE_URL}/apprenants/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de la suppression: ${errorText}`);
    }
  },

  async exportData(format: 'csv' | 'excel', scope: 'all' | 'page', params: { [key: string]: any } = {}): Promise<{ blob: Blob, filename: string }> {
    let url = `${API_BASE_URL}/apprenants/export/${format}/${scope}`;
    if (scope === 'page') {
      const query = new URLSearchParams(params).toString();
      url += `?${query}`;
    }
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur lors de l'exportation: ${errorText}`);
    }

    const disposition = response.headers.get('Content-Disposition');
    let filename = `export.${format === 'excel' ? 'xlsx' : 'csv'}`;
    if (disposition && disposition.includes('attachment')) {
      const filenameMatch = disposition.match(/filename="(.+?)"/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    const blob = await response.blob();
    return { blob, filename };
  },

  async importData(file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}/apprenants/import`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const resultData = await response.json();

    if (!response.ok) {
      throw new Error(resultData.message || `Erreur lors de l'importation`);
    }
    
    return resultData;
  }
};

// Composant StudentForm séparé pour éviter les re-renders
interface StudentFormProps {
  formData: {
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateNaissance: string;
    adresse: string;
    cin: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    nom: string;
    prenom: string;
    email: string;
    telephone: string;
    dateNaissance: string;
    adresse: string;
    cin: string;
  }>>;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  t: (key: string) => string;
}

const StudentForm: React.FC<StudentFormProps> = React.memo(({ 
  formData, 
  setFormData, 
  loading, 
  onSubmit, 
  onCancel, 
  submitLabel, 
  t 
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="prenom">{t('firstName')} *</Label>
        <Input
          id="prenom"
          value={formData.prenom}
          onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
          className="glass border-border/30"
          disabled={loading}
          autoComplete="given-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nom">{t('lastName')} *</Label>
        <Input
          id="nom"
          value={formData.nom}
          onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
          className="glass border-border/30"
          disabled={loading}
          autoComplete="family-name"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="email">{t('email')} *</Label>
      <Input
        id="email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        className="glass border-border/30"
        disabled={loading}
        autoComplete="email"
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="telephone">{t('phone')}</Label>
        <Input
          id="telephone"
          value={formData.telephone}
          onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
          className="glass border-border/30"
          disabled={loading}
          autoComplete="tel"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateNaissance">{t('dateOfBirth')}</Label>
        <Input
          id="dateNaissance"
          type="date"
          value={formData.dateNaissance}
          onChange={(e) => setFormData(prev => ({ ...prev, dateNaissance: e.target.value }))}
          className="glass border-border/30"
          disabled={loading}
          autoComplete="bday"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="adresse">{t('address')}</Label>
      <Input
        id="adresse"
        value={formData.adresse}
        onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))}
        className="glass border-border/30"
        disabled={loading}
        autoComplete="street-address"
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="cin">{t('cin')} *</Label>
      <Input
        id="cin"
        value={formData.cin}
        onChange={(e) => setFormData(prev => ({ ...prev, cin: e.target.value }))}
        className="glass border-border/30"
        disabled={loading}
        autoComplete="off"
      />
    </div>

    <div className="flex justify-end gap-3 pt-4">
      <Button variant="outline" onClick={onCancel} disabled={loading}>
        {t('cancel')}
      </Button>
      <Button onClick={onSubmit} className="gradient-primary text-white" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  </div>
));

const Students: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [students, setStudents] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for pagination and sorting
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [sorting, setSorting] = useState({
    sortBy: 'dateNow',
    sortDirection: 'desc',
  });

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Apprenant | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    adresse: '',
    cin: '',
  });

  // Unifier les déclencheurs: page, size, sorting, searchTerm
  useEffect(() => {
    const debounce = setTimeout(() => {
      loadStudents();
    }, 250);
    return () => clearTimeout(debounce);
  }, [pagination.page, pagination.size, sorting.sortBy, sorting.sortDirection, searchTerm]);

  const loadStudents = async (search: string = searchTerm) => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: sorting.sortBy,
        sortDirection: sorting.sortDirection,
        search: search,
      };
      const response = await apiService.search(params);
      setStudents(response.data || []);
      setPagination(prev => ({
        ...prev,
        page: response.pagination.current_page,
        size: response.pagination.page_size,
        totalPages: response.pagination.total_pages,
        totalElements: response.pagination.total_elements,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: t("error"),
        description: t("errorLoadingStudents"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Réinitialiser à la première page; le useEffect déclenchera loadStudents après MAJ d'état
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      dateNaissance: '',
      adresse: '',
      cin: '',
    });
  };

  const handleAddStudent = async () => {
    if (!formData.nom || !formData.prenom || !formData.email || !formData.cin) {
      toast({
        title: t("error"),
        description: t("fillRequiredFieldsError"),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const newApprenant = await apiService.create(formData);
      
      toast({
        title: t("success"),
        description: `${formData.prenom} ${formData.nom} ${t('studentAddedSuccessMessage')}`,
      });

      resetForm();
      setIsAddDialogOpen(false);
      await loadStudents(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t('errorAddingStudent'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditStudent = async () => {
    if (!selectedStudent) return;
    if (!formData.nom || !formData.prenom || !formData.email || !formData.cin) {
      toast({
        title: t("error"),
        description: t("fillRequiredFieldsError"),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await apiService.update(selectedStudent.idApprenant!, formData);
      
      toast({
        title: t('success'),
        description: `${formData.prenom} ${formData.nom} ${t('studentUpdatedSuccessMessage')}`,
      });

      resetForm();
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      await loadStudents();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t('errorUpdatingStudent'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (student: Apprenant) => {
    if (!student.idApprenant) return;
    
    try {
      setLoading(true);
      await apiService.delete(student.idApprenant);
      
      toast({
        title: t('success'),
        description: `${student.prenom} ${student.nom} ${t('studentDeletedSuccessMessage')}`,
      });
      
      await loadStudents();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: t("error"),
        description: error instanceof Error ? error.message : t('errorDeletingStudent'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (student: Apprenant) => {
    setSelectedStudent(student);
    setFormData({
      nom: student.nom,
      prenom: student.prenom,
      email: student.email,
      telephone: student.telephone || '',
      dateNaissance: student.dateNaissance || '',
      adresse: student.adresse || '',
      cin: student.cin,
    });
    setIsEditDialogOpen(true);
  };

  const openDetailsModal = (student: Apprenant) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
  };

  const handleExport = async (format: 'csv' | 'excel', scope: 'all' | 'page') => {
    try {
      setIsExporting(true);
      toast({ title: t('exportInProgress'), description: t('generatingFile') });

      const params = scope === 'page' ? {
        page: pagination.page,
        size: pagination.size,
        sortBy: sorting.sortBy,
        sortDir: sorting.sortDirection,
        search: searchTerm,
      } : {};

      const { blob, filename } = await apiService.exportData(format, scope, params);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: t('success'), description: t('exportSuccessful') });
    } catch (error) {
      console.error("Erreur lors de l'exportation:", error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('exportFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      toast({
        title: t('importInProgress'),
        description: t('importingFile', { fileName: file.name }),
      });

      const result = await apiService.importData(file);

      if (result.errors && result.errors.length > 0) {
        const errorMessages = result.errors.map(err => `Ligne ${err.rowNumber}: ${err.message}`).join('\n');
        toast({
          title: t('importPartialSuccess'),
          description: (
            <div className="text-sm">
              <p>{t('importSummary', { inserted: result.inserted, skipped: result.skipped })}</p>
              <p className="font-bold mt-2">{t('errorsFound')}:</p>
              <pre className="mt-1 whitespace-pre-wrap text-xs bg-muted p-2 rounded-md">{errorMessages}</pre>
            </div>
          ),
          variant: 'destructive',
          duration: 15000,
        });
      } else {
        toast({
          title: t('success'),
          description: t('importSuccessful', { count: result.inserted }),
        });
      }

      if (result.inserted > 0) {
        await loadStudents(); // Recharger la liste si au moins un a été inséré
      }
    } catch (error) {
      console.error("Erreur lors de l'importation:", error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('importFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // La logique de filtrage est maintenant gérée par le backend
  const filteredStudents = students;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card border-border/30">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-2xl text-foreground">
                  {t('studentManagement')}
                </CardTitle>
                <CardDescription>
                  {t('manageStudentDatabase')}
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="glass border-border/30"
                      disabled={isExporting}
                    >
                      {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-card">
                    <DropdownMenuLabel>{t('exportOptions')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport('excel', 'page')}>
                      {t('exportCurrentPage')} (Excel)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('csv', 'page')}>
                      {t('exportCurrentPage')} (CSV)
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleExport('excel', 'all')}>
                      {t('exportAll')} (Excel)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('csv', 'all')}>
                      {t('exportAll')} (CSV)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="outline"
                  size="icon"
                  className="glass border-border/30"
                  onClick={handleImportClick}
                  disabled={isImporting}
                >
                  {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileImport}
                  className="hidden"
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                />
                
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gradient-primary text-white" onClick={() => resetForm()}>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('addStudent')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{t('addStudent')}</DialogTitle>
                      <DialogDescription>
                        {t('addNewStudentToSystem')}
                      </DialogDescription>
                    </DialogHeader>
                    <StudentForm
                      formData={formData}
                      setFormData={setFormData}
                      loading={loading}
                      onSubmit={handleAddStudent}
                      onCancel={() => setIsAddDialogOpen(false)}
                      submitLabel={t('addStudent')}
                      t={t}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10 glass border-border/30"
                />
                <Search 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer"
                  onClick={handleSearch}
                />
              </div>
              
              <Select
                value={sorting.sortBy}
                onValueChange={(value) => setSorting(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger className="w-48 glass border-border/30">
                  <SelectValue placeholder={t('sortBy')} />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="dateNow">{t('registrationDate')}</SelectItem>
                  <SelectItem value="nom">{t('lastName')}</SelectItem>
                  <SelectItem value="prenom">{t('firstName')}</SelectItem>
                  <SelectItem value="email">{t('email')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sorting.sortDirection}
                onValueChange={(value) => setSorting(prev => ({ ...prev, sortDirection: value }))}
              >
                <SelectTrigger className="w-32 glass border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="desc">{t('descending')}</SelectItem>
                  <SelectItem value="asc">{t('ascending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Students Table */}
            <div className="glass rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-foreground font-semibold">{t('student')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('contact')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('cin')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('dateOfBirth')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('enrollmentsCount')}</TableHead>
                    <TableHead className="text-foreground font-semibold text-right">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence>
                    {filteredStudents.map((student, index) => (
                      <motion.tr
                        key={student.idApprenant || index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-border/30 hover:bg-accent/20 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {student.prenom[0]}{student.nom[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {student.prenom} {student.nom}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.telephone && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {student.telephone}
                              </p>
                            )}
                            {student.adresse && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {student.adresse}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">{student.cin}</span>
                        </TableCell>
                        <TableCell>
                          {student.dateNaissance && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {new Date(student.dateNaissance).toLocaleDateString('fr-FR')}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.inscriptions?.length || 0} {t('enrollments')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-accent/50"
                              onClick={() => openDetailsModal(student)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Dialog open={isEditDialogOpen && selectedStudent?.idApprenant === student.idApprenant} onOpenChange={(isOpen) => {
                              if (!isOpen) {
                                setSelectedStudent(null);
                                resetForm();
                              }
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 hover:bg-accent/50"
                                  onClick={() => openEditDialog(student)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="glass-card max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>{t('editStudent')}</DialogTitle>
                                  <DialogDescription>
                                    {t('updateStudentInfo')}
                                  </DialogDescription>
                                </DialogHeader>
                                <StudentForm
                                  formData={formData}
                                  setFormData={setFormData}
                                  loading={loading}
                                  onSubmit={handleEditStudent}
                                  onCancel={() => {
                                    setIsEditDialogOpen(false);
                                    setSelectedStudent(null);
                                    resetForm();
                                  }}
                                  submitLabel={t('save')}
                                  t={t}
                                />
                              </DialogContent>
                            </Dialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="glass-card">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('deleteStudent')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('areYouSureDelete')} {student.prenom} {student.nom} ? 
                                    {t('thisActionIsIrreversible')}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteStudent(student)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    {t('delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
              
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  <p className="text-muted-foreground">{t('loading')}</p>
                </div>
              )}
              
              {!loading && filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">{t('noStudentFound')}</p>
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                {t('totalOf', { total: pagination.totalElements })} {t('results')}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{t('rowsPerPage')}</span>
                  <Select
                    value={pagination.size.toString()}
                    onValueChange={(value) => setPagination(p => ({ ...p, size: Number(value), page: 0 }))}
                  >
                    <SelectTrigger className="w-20 glass border-border/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card">
                      {[10, 20, 50, 100].map(size => (
                        <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm">
                  {t('page')} {pagination.page + 1} {t('of')} {pagination.totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setPagination(p => ({ ...p, page: 0 }))}
                    disabled={pagination.page === 0}
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    disabled={pagination.page === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    disabled={pagination.page >= pagination.totalPages - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="w-8 h-8"
                    onClick={() => setPagination(p => ({ ...p, page: pagination.totalPages - 1 }))}
                    disabled={pagination.page >= pagination.totalPages - 1}
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
      />
    </motion.div>
  );
};

export default Students;