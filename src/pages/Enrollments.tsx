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
import { Student, Course } from '@/types';
import { Inscription, InscriptionsService, CreateInscriptionDto } from '@/services/inscriptions.service';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { formatAriary } from '@/lib/format';

const Enrollments: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Inscription[]>([]);
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
      
      // Utiliser le service pour récupérer les inscriptions
      console.log('Chargement des inscriptions...');
      const enrollmentsData = await InscriptionsService.getAll();
      console.log('Inscriptions reçues:', enrollmentsData);
      
      // Fetch students
      console.log('Chargement des apprenants...');
      const studentsResponse = await fetch('http://localhost:8080/api/apprenants?size=1000'); // Fetch a large number to get all students
      const studentsPaginatedData = studentsResponse.ok ? await studentsResponse.json() : { data: [] };
      const studentsData = studentsPaginatedData.data || [];
      console.log('Apprenants reçus:', studentsData);
      
      // Fetch courses
      console.log('Chargement des formations...');
      const coursesResponse = await fetch('http://localhost:8080/api/formations');
      const coursesData = coursesResponse.ok ? await coursesResponse.json() : [];
      console.log('Formations reçues:', coursesData);
      
      setEnrollments(enrollmentsData);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setCourses(coursesData);
      
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('cannotLoadData'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEnrollment = async () => {
    if (!addForm.apprenantId || !addForm.formationId) {
      toast({
        title: t('error'),
        description: t('selectStudentAndCourseError'),
        variant: "destructive"
      });
      return;
    }

    try {
      const enrollmentData: CreateInscriptionDto = {
        apprenantId: parseInt(addForm.apprenantId),
        formationId: parseInt(addForm.formationId),
        droitInscription: addForm.droitInscription ? parseFloat(addForm.droitInscription) : undefined
      };

      await InscriptionsService.create(enrollmentData);

      setAddForm({ apprenantId: '', formationId: '', droitInscription: '' });
      setIsAddDialogOpen(false);
      await loadData();
      
      toast({
        title: t('success'),
        description: t('enrollmentAddedSuccess')
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('cannotAddEnrollment'),
        variant: "destructive"
      });
    }
  };

  const updateEnrollmentStatus = async (enrollmentId: number, status: 'En attente' | 'Confirmé' | 'Annulé') => {
    try {
      if (status === 'Confirmé') {
        await InscriptionsService.confirm(enrollmentId);
      } else if (status === 'Annulé') {
        await InscriptionsService.cancel(enrollmentId);
      } else {
        await InscriptionsService.update(enrollmentId, { statut: status });
      }

      await loadData();
      toast({
        title: t('success'),
        description: `${t('statusUpdated')}: ${status}`
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('cannotUpdateStatus'),
        variant: "destructive"
      });
    }
  };

  const handleDeleteEnrollment = async (enrollmentId: number) => {
    try {
      await InscriptionsService.delete(enrollmentId);
      await loadData();
      toast({
        title: t('success'),
        description: t('enrollmentDeletedSuccess')
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('cannotDeleteEnrollment'),
        variant: "destructive"
      });
    }
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {    
    // Pour l'instant, on filtre juste sur le statut car nous n'avons pas encore les noms
    const matchesStatus = statusFilter === 'all' || enrollment.statut === statusFilter;
    return matchesStatus;
  });

  // Calculate statistics
  const totalEnrollments = enrollments.length;
  const confirmedCount = enrollments.filter(e => e.statut === 'Confirmé').length;
  const pendingCount = enrollments.filter(e => e.statut === 'En attente').length;
  const cancelledCount = enrollments.filter(e => e.statut === 'Annulé').length;
  const totalRevenue = enrollments
    .filter(e => e.statut === 'Confirmé')
    .reduce((sum, e) => sum + (e.montantTotalPaye || 0), 0);

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
        {t(status.toLowerCase().replace(' ', ''))}
      </Badge>
    );
  };

  const statsCards = [
    {
      title: t('totalEnrollmentsTitle'),
      value: totalEnrollments.toString(),
      icon: BookOpen,
      color: 'gradient-primary',
    },
    {
      title: t('totalRevenueTitle'),
      value: `${formatAriary(totalRevenue)} Ar`,
      icon: DollarSign,
      color: 'gradient-accent',
    },
    {
      title: t('confirmed'),
      value: confirmedCount.toString(),
      icon: CheckCircle,
      color: 'bg-success',
    },
    {
      title: t('pendingAndCancelled'),
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
              {t('enrollmentManagement')}
            </h1>
            <p className="text-muted-foreground">
              {t('trackEnrollments')}
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                {t('addEnrollment')}
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="sm:max-w-[600px]"
              description={t('addNewEnrollment')}
            >
              <DialogHeader>
                <DialogTitle>{t('addNewEnrollment')}</DialogTitle>
                <p className="text-muted-foreground">
                  {t('selectStudentAndCourse')}
                </p>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="student-select" className="text-right">
                    {t('student')} *
                  </Label>
                  <Select value={addForm.apprenantId} onValueChange={(value) => setAddForm({...addForm, apprenantId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('selectStudent')} />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.idApprenant} value={student.idApprenant.toString()}>
                          {student.prenom} {student.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="course-select" className="text-right">
                    {t('course')} *
                  </Label>
                  <Select value={addForm.formationId} onValueChange={(value) => setAddForm({...addForm, formationId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('selectCourse')} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.idFormation} value={course.idFormation.toString()}>
                          {course.nom} - {formatAriary(course.frais)} Ar
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="fee" className="text-right">
                    {t('registrationFee')}
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
                  {t('cancel')}
                </Button>
                <Button onClick={handleAddEnrollment}>{t('add')}</Button>
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
            <CardTitle>{t('enrollmentList')}</CardTitle>
            <CardDescription>
              {t('manageEnrollmentsAndPayments')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder={t('searchByStudentOrCourse')}
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
                  <SelectItem value="all">{t('allStatuses')}</SelectItem>
                  <SelectItem value="En attente">{t('pending')}</SelectItem>
                  <SelectItem value="Confirmé">{t('confirmed')}</SelectItem>
                  <SelectItem value="Annulé">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="glass rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-foreground font-semibold">{t('studentColumn')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('courseColumn')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('registrationFeeColumn')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('amountPaid')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('amountRemaining')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('status')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('date')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        {t('loading')}
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
                                {enrollment.idInscription}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {t('enrollmentId')}: {enrollment.idInscription}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {t('enrollment')} #{enrollment.idInscription}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t('enrolledOn')}: {new Date(enrollment.dateInscription).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-semibold text-foreground">
                            {formatAriary(enrollment.droitInscription)} Ar
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-semibold text-success">
                            {formatAriary(enrollment.montantTotalPaye)} Ar
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <p className={cn(
                            "font-semibold",
                            enrollment.montantRestant > 0 ? "text-warning" : "text-success"
                          )}>
                            {formatAriary(enrollment.montantRestant)} Ar
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
                                  {t('confirm')}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateEnrollmentStatus(enrollment.idInscription, 'Annulé')}
                                  className="border-destructive text-destructive hover:bg-destructive/10"
                                >
                                  {t('cancelEnrollment')}
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
                                {t('revertToPending')}
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
                  <p className="text-muted-foreground">{t('noEnrollmentFound')}</p>
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