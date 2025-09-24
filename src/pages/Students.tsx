import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

// Service API
const API_BASE_URL = 'http://localhost:8080/api';

const apiService = {
  async getAll(): Promise<Apprenant[]> {
    const response = await fetch(`${API_BASE_URL}/apprenants`, {
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
        <Label htmlFor="prenom">Prénom *</Label>
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
        <Label htmlFor="nom">Nom *</Label>
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
      <Label htmlFor="email">Email *</Label>
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
        <Label htmlFor="telephone">Téléphone</Label>
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
        <Label htmlFor="dateNaissance">Date de naissance</Label>
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
      <Label htmlFor="adresse">Adresse</Label>
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
      <Label htmlFor="cin">CIN *</Label>
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
  
  const [students, setStudents] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Apprenant | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    dateNaissance: '',
    adresse: '',
    cin: '',
  });

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const apprenants = await apiService.getAll();
      setStudents(apprenants);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des étudiants",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, CIN)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const newApprenant = await apiService.create(formData);
      
      toast({
        title: "Succès",
        description: `${formData.prenom} ${formData.nom} a été ajouté(e) avec succès.`,
      });

      resetForm();
      setIsAddDialogOpen(false);
      await loadStudents(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de l'ajout de l'étudiant",
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
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires (Nom, Prénom, Email, CIN)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await apiService.update(selectedStudent.idApprenant!, formData);
      
      toast({
        title: t('studentUpdatedSuccess'),
        description: `${formData.prenom} ${formData.nom} a été mis(e) à jour.`,
      });

      resetForm();
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      await loadStudents();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'étudiant",
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
        title: t('studentDeletedSuccess'),
        description: `${student.prenom} ${student.nom} a été supprimé(e).`,
      });
      
      await loadStudents();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la suppression de l'étudiant",
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

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cin.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Pour la compatibilité avec le filtre de status, on considère tous comme actifs
    const matchesStatus = statusFilter === 'all' || statusFilter === 'active';
    
    return matchesSearch && matchesStatus;
  });

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
                  Manage your student database and enrollment information
                </CardDescription>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="glass border-border/30"
                >
                  <Download className="w-4 h-4" />
                </Button>
                
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
                        Add a new student to the system
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass border-border/30"
                />
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
              >
                <SelectTrigger className="w-40 glass border-border/30">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Students Table */}
            <div className="glass rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-foreground font-semibold">Étudiant</TableHead>
                    <TableHead className="text-foreground font-semibold">Contact</TableHead>
                    <TableHead className="text-foreground font-semibold">CIN</TableHead>
                    <TableHead className="text-foreground font-semibold">Date de naissance</TableHead>
                    <TableHead className="text-foreground font-semibold">Inscriptions</TableHead>
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
                            {student.inscriptions?.length || 0} inscription(s)
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 hover:bg-accent/50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            
                            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                                    Update student information
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
                                    Êtes-vous sûr de vouloir supprimer {student.prenom} {student.nom} ? 
                                    Cette action ne peut pas être annulée.
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
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              )}
              
              {!loading && filteredStudents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucun étudiant trouvé</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Students;