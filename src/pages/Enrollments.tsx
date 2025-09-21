import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Plus,
  Edit,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Student, Enrollment, Course } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Enrollments: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'En attente' | 'Confirmé' | 'Annulé'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Add enrollment form state
  const [addForm, setAddForm] = useState({
    apprenantId: '',
    formationId: '',
    droitInscription: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Fetch enrollments from API
      const enrollmentsResponse = await fetch('http://localhost:8080/api/inscriptions');
      if (!enrollmentsResponse.ok) throw new Error('Erreur lors du chargement des inscriptions');
      const enrollmentsData = await enrollmentsResponse.json();
      
      // Fetch students (assuming you have this API)
      const studentsResponse = await fetch('http://localhost:8080/api/apprenants');
      const studentsData = studentsResponse.ok ? await studentsResponse.json() : [];
      
      // Fetch courses
      const coursesResponse = await fetch('http://localhost:8080/formations');
      const coursesData = coursesResponse.ok ? await coursesResponse.json() : [];
      
      // Enrich enrollments with student and course names
      const enrichedEnrollments = enrollmentsData.map((enrollment: Enrollment) => {
        const student = studentsData.find((s: any) => s.id === enrollment.apprenantId);
        const course = coursesData.find((c: Course) => c.id_formation === enrollment.formationId);
        
        return {
          ...enrollment,
          studentName: student ? `${student.firstName || student.prenom || ''} ${student.lastName || student.nom || ''}` : 'Unknown',
          courseName: course ? course.nom : 'Unknown Course'
        };
      });
      
      setEnrollments(enrichedEnrollments);
      setStudents(studentsData);
      setCourses(coursesData);
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnrollment = async () => {
    if (!addForm.apprenantId || !addForm.formationId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un apprenant et une formation",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/inscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apprenantId: parseInt(addForm.apprenantId),
          formationId: parseInt(addForm.formationId),
          droitInscription: addForm.droitInscription ? parseFloat(addForm.droitInscription) : 0
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la création');

      setAddForm({ apprenantId: '', formationId: '', droitInscription: '' });
      setIsAddDialogOpen(false);
      await loadData();
      
      toast({
        title: "Succès",
        description: "Inscription ajoutée avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'inscription",
        variant: "destructive"
      });
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: number, status: 'En attente' | 'Confirmé' | 'Annulé') => {
    try {
      let endpoint = `http://localhost:8080/api/inscriptions/${enrollmentId}`;
      let method = 'PUT';
      let body = JSON.stringify({ statut: status });

      // Use specific endpoints for confirm/cancel
      if (status === 'Confirmé') {
        endpoint = `http://localhost:8080/api/inscriptions/${enrollmentId}/confirm`;
        body = '';
      } else if (status === 'Annulé') {
        endpoint = `http://localhost:8080/api/inscriptions/${enrollmentId}/cancel`;
        body = '';
      }

      const response = await fetch(endpoint, {
        method,
        headers: status !== 'Confirmé' && status !== 'Annulé' ? {
          'Content-Type': 'application/json',
        } : {},
        body: body || undefined,
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      await loadData();
      toast({
        title: "Succès",
        description: `Statut mis à jour: ${status}`
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/inscriptions/${enrollmentId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      await loadData();
      toast({
        title: "Succès",
        description: "Inscription supprimée avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'inscription",
        variant: "destructive"
      });
    }
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {    
    const matchesSearch = 
      (enrollment.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (enrollment.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = statusFilter === 'all' || enrollment.statut === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalEnrollments = enrollments.length;
  const confirmedCount = enrollments.filter(e => e.statut === 'Confirmé').length;
  const pendingCount = enrollments.filter(e => e.statut === 'En attente').length;
  const cancelledCount = enrollments.filter(e => e.statut === 'Annulé').length;
  const totalRevenue = enrollments
    .filter(e => e.statut === 'Confirmé')
    .reduce((sum, e) => sum + e.montantTotalPaye, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Confirmé':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'En attente':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'Annulé':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'Confirmé': 'bg-success text-success-foreground',
      'En attente': 'bg-warning text-warning-foreground',
      'Annulé': 'bg-destructive text-destructive-foreground',
    };
    
    return (
      <Badge className={cn('flex items-center gap-1', variants[status as keyof typeof variants])}>
        {getStatusIcon(status)}
        {status}
      </Badge>
    );
  };

  const statsCards = [
    {
      title: 'Total des Inscriptions',
      value: totalEnrollments.toString(),
      icon: BookOpen,
      color: 'gradient-primary',
    },
    {
      title: 'Revenus Totaux',
      value: `${totalRevenue.toLocaleString()} €`,
      icon: DollarSign,
      color: 'gradient-accent',
    },
    {
      title: 'Confirmées',
      value: confirmedCount.toString(),
      icon: CheckCircle,
      color: 'bg-success',
    },
    {
      title: 'En Attente + Annulées',
      value: (pendingCount + cancelledCount).toString(),
      icon: AlertCircle,
      color: 'bg-warning',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 rounded-2xl"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Gestion des Inscriptions
            </h1>
            <p className="text-muted-foreground">
              Suivez les inscriptions des étudiants et gérez les paiements
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Ajouter Inscription
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle inscription</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student-select" className="text-right">
                    Apprenant *
                  </Label>
                  <Select value={addForm.apprenantId} onValueChange={(value) => setAddForm({...addForm, apprenantId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un apprenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="course-select" className="text-right">
                    Formation *
                  </Label>
                  <Select value={addForm.formationId} onValueChange={(value) => setAddForm({...addForm, formationId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner une formation" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id_formation} value={course.id_formation.toString()}>
                          {course.nom} - {course.frais}€
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fee" className="text-right">
                    Droit d'inscription (€)
                  </Label>
                  <Input
                    id="fee"
                    type="number"
                    value={addForm.droitInscription}
                    onChange={(e) => setAddForm({...addForm, droitInscription: e.target.value})}
                    className="col-span-3"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddEnrollment}>Ajouter</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card border-border/30 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground mt-2">
                        {stat.value}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Enrollments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle>Gestion des Inscriptions</CardTitle>
            <CardDescription>
              Gérez les inscriptions des étudiants et leurs statuts de paiement
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Rechercher par apprenant ou formation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 glass border-border/30"
              />
              
              <Select
                value={statusFilter}
                onValueChange={(value: 'all' | 'En attente' | 'Confirmé' | 'Annulé') => setStatusFilter(value)}
              >
                <SelectTrigger className="w-40 glass border-border/30">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="En attente">En attente</SelectItem>
                  <SelectItem value="Confirmé">Confirmé</SelectItem>
                  <SelectItem value="Annulé">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="glass rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-foreground font-semibold">Apprenant</TableHead>
                    <TableHead className="text-foreground font-semibold">Formation</TableHead>
                    <TableHead className="text-foreground font-semibold">Droit d'inscription</TableHead>
                    <TableHead className="text-foreground font-semibold">Montant payé</TableHead>
                    <TableHead className="text-foreground font-semibold">Montant restant</TableHead>
                    <TableHead className="text-foreground font-semibold">Statut</TableHead>
                    <TableHead className="text-foreground font-semibold">Date</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Chargement des inscriptions...
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <TableRow
                        key={enrollment.idInscription}
                        className="border-border/30 hover:bg-accent/20 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {enrollment.studentName?.split(' ').map(n => n[0]).join('') || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {enrollment.studentName || 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {enrollment.courseName || 'Unknown Course'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Inscrit le: {new Date(enrollment.dateInscription).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-semibold text-foreground">
                            {enrollment.droitInscription.toLocaleString()} €
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-semibold text-success">
                            {enrollment.montantTotalPaye.toLocaleString()} €
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <p className={cn(
                            "font-semibold",
                            enrollment.montantRestant > 0 ? "text-warning" : "text-success"
                          )}>
                            {enrollment.montantRestant.toLocaleString()} €
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(enrollment.statut)}
                        </TableCell>
                        
                        <TableCell>
                          <p className="text-sm text-muted-foreground">
                            {new Date(enrollment.dateInscription).toLocaleDateString()}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {enrollment.statut === 'En attente' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateEnrollmentStatus(enrollment.idInscription, 'Confirmé')}
                                  className="bg-success text-success-foreground hover:bg-success/90"
                                >
                                  Confirmer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateEnrollmentStatus(enrollment.idInscription, 'Annulé')}
                                  className="border-destructive text-destructive hover:bg-destructive/10"
                                >
                                  Annuler
                                </Button>
                              </>
                            )}
                            
                            {enrollment.statut === 'Confirmé' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateEnrollmentStatus(enrollment.idInscription, 'En attente')}
                                className="border-warning text-warning hover:bg-warning/10"
                              >
                                Remettre en attente
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteEnrollment(enrollment.idInscription)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              
              {filteredEnrollments.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Aucune inscription trouvée</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Enrollments;