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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Student, Enrollment } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Enrollments: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const storedStudents = JSON.parse(localStorage.getItem('students') || '[]');
    const storedEnrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
    
    setStudents(storedStudents);
    setEnrollments(storedEnrollments);
  };

  const updatePaymentStatus = (enrollmentId: string, status: 'paid' | 'pending' | 'overdue') => {
    const updatedEnrollments = enrollments.map(enrollment =>
      enrollment.id === enrollmentId
        ? {
            ...enrollment,
            paymentStatus: status,
            paidDate: status === 'paid' ? new Date().toISOString() : undefined,
          }
        : enrollment
    );

    localStorage.setItem('enrollments', JSON.stringify(updatedEnrollments));
    setEnrollments(updatedEnrollments);

    toast({
      title: "Payment Status Updated",
      description: `Payment status changed to ${status}`,
    });
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = students.find(s => s.id === enrollment.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : '';
    
    const matchesSearch = 
      studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || enrollment.paymentStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalEnrollments = enrollments.length;
  const paidCount = enrollments.filter(e => e.paymentStatus === 'paid').length;
  const pendingCount = enrollments.filter(e => e.paymentStatus === 'pending').length;
  const overdueCount = enrollments.filter(e => e.paymentStatus === 'overdue').length;
  const totalRevenue = enrollments
    .filter(e => e.paymentStatus === 'paid')
    .reduce((sum, e) => sum + e.fee, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-warning" />;
      case 'overdue':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-success text-success-foreground',
      pending: 'bg-warning text-warning-foreground',
      overdue: 'bg-destructive text-destructive-foreground',
    };
    
    return (
      <Badge className={cn('flex items-center gap-1', variants[status as keyof typeof variants])}>
        {getStatusIcon(status)}
        {t(status)}
      </Badge>
    );
  };

  const statsCards = [
    {
      title: t('totalEnrollments'),
      value: totalEnrollments.toString(),
      icon: BookOpen,
      color: 'gradient-primary',
    },
    {
      title: t('totalRevenue'),
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'gradient-accent',
    },
    {
      title: t('paid'),
      value: paidCount.toString(),
      icon: CheckCircle,
      color: 'bg-success',
    },
    {
      title: t('pending') + ' + ' + t('overdue'),
      value: (pendingCount + overdueCount).toString(),
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
              {t('enrollments')}
            </h1>
            <p className="text-muted-foreground">
              Track student enrollments and manage fee payments
            </p>
          </div>
          
          <Button className="gradient-primary text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Enrollment
          </Button>
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
            <CardTitle>Enrollment Management</CardTitle>
            <CardDescription>
              Manage student enrollments and payment status
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                placeholder="Search students or courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 glass border-border/30"
              />
              
              <Select
                value={statusFilter}
                onValueChange={(value: 'all' | 'paid' | 'pending' | 'overdue') => setStatusFilter(value)}
              >
                <SelectTrigger className="w-40 glass border-border/30">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">{t('paid')}</SelectItem>
                  <SelectItem value="pending">{t('pending')}</SelectItem>
                  <SelectItem value="overdue">{t('overdue')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="glass rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-foreground font-semibold">Student</TableHead>
                    <TableHead className="text-foreground font-semibold">Course</TableHead>
                    <TableHead className="text-foreground font-semibold">Fee</TableHead>
                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                    <TableHead className="text-foreground font-semibold">Due Date</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.map((enrollment) => {
                    const student = students.find(s => s.id === enrollment.studentId);
                    const isOverdue = new Date(enrollment.dueDate) < new Date() && enrollment.paymentStatus !== 'paid';
                    
                    return (
                      <TableRow
                        key={enrollment.id}
                        className="border-border/30 hover:bg-accent/20 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {student?.firstName[0]}{student?.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {student?.firstName} {student?.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {student?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {enrollment.courseName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <p className="font-semibold text-foreground">
                            ${enrollment.fee.toLocaleString()}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          {getStatusBadge(isOverdue && enrollment.paymentStatus !== 'paid' ? 'overdue' : enrollment.paymentStatus)}
                        </TableCell>
                        
                        <TableCell>
                          <p className={cn(
                            "text-sm",
                            isOverdue && enrollment.paymentStatus !== 'paid'
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          )}>
                            {new Date(enrollment.dueDate).toLocaleDateString()}
                          </p>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {enrollment.paymentStatus !== 'paid' && (
                              <Button
                                size="sm"
                                onClick={() => updatePaymentStatus(enrollment.id, 'paid')}
                                className="bg-success text-success-foreground hover:bg-success/90"
                              >
                                Mark Paid
                              </Button>
                            )}
                            
                            {enrollment.paymentStatus === 'paid' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updatePaymentStatus(enrollment.id, 'pending')}
                                className="border-warning text-warning hover:bg-warning/10"
                              >
                                Mark Pending
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {filteredEnrollments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No enrollments found</p>
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