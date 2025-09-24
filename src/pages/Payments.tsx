import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  Calendar,
  Plus,
  Edit,
  Trash2,
  Filter,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { PaiementsService, Paiement, CreatePaiementDto } from '@/services/paiements.service';
import { InscriptionsService } from '@/services/inscriptions.service';

// Fonction pour formater les montants en Ariary
const formatAriary = (amount: number) => {
  return new Intl.NumberFormat('fr-MG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Payments = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const initialAddForm: CreatePaiementDto = {
    inscriptionId: 0,
    montant: 0,
    modePaiement: '',
    module: ''
  };

  const [addForm, setAddForm] = useState<CreatePaiementDto>(initialAddForm);

  const [editForm, setEditForm] = useState<Paiement>({
    idPaiement: 0,
    inscriptionId: 0,
    montant: 0,
    modePaiement: '',
    module: '',
    datePaiement: new Date().toISOString()
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paiementsData, inscriptionsData] = await Promise.all([
        PaiementsService.getAll(),
        InscriptionsService.getAll()
      ]);
      setPaiements(paiementsData);
      setInscriptions(inscriptionsData);
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

  const handleAddPayment = async () => {
    try {
      if (!addForm.inscriptionId || !addForm.montant || !addForm.modePaiement || !addForm.module) {
        toast({
          title: t('error'),
          description: t('fillAllFields'),
          variant: "destructive"
        });
        return;
      }

      await PaiementsService.create(addForm);
      setIsAddDialogOpen(false);
      setAddForm(initialAddForm);
      await loadData();
      
      toast({
        title: t('success'),
        description: t('paymentRecordedSuccess')
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('errorRecordingPayment'),
        variant: "destructive"
      });
    }
  };

  const handleDeletePayment = async (id: number) => {
    try {
      await PaiementsService.delete(id);
      await loadData();
      toast({
        title: t('success'),
        description: t('paymentDeletedSuccess')
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('errorDeletingPayment'),
        variant: "destructive"
      });
    }
  };

  const handleEditPayment = async () => {
    try {
      if (!editForm.inscriptionId || !editForm.montant || !editForm.modePaiement || !editForm.module) {
        toast({
          title: t('error'),
          description: t('fillAllFields'),
          variant: "destructive"
        });
        return;
      }

      await PaiementsService.update(editForm.idPaiement, {
        inscriptionId: editForm.inscriptionId,
        montant: editForm.montant,
        modePaiement: editForm.modePaiement,
        module: editForm.module
      });
      
      setIsEditDialogOpen(false);
      await loadData();
      
      toast({
        title: t('success'),
        description: t('paymentUpdatedSuccess')
      });
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('errorUpdatingPayment'),
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (paiement: Paiement) => {
    setEditForm({
      ...paiement,
      montant: Number(paiement.montant),
      inscriptionId: Number(paiement.inscriptionId)
    });
    setIsEditDialogOpen(true);
  };

  // Calculate total payments
  const totalPayments = paiements.reduce((sum, p) => sum + p.montant, 0);
  const totalPaymentsToday = paiements
    .filter(p => new Date(p.datePaiement).toDateString() === new Date().toDateString())
    .reduce((sum, p) => sum + p.montant, 0);

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
              {t('paymentManagement')}
            </h1>
            <p className="text-muted-foreground">
              {t('trackAndManagePayments')}
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                {t('newPayment')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{t('newPayment')}</DialogTitle>
                <CardDescription>
                  {t('fillPaymentInfo')}
                </CardDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="inscription-select" className="text-right">
                    {t('enrollment')} *
                  </Label>
                  <div className="col-span-3">
                    {addForm.inscriptionId > 0 && (
                      <div className="text-sm text-muted-foreground mb-2">
                        {t('selectedEnrollment')} : #{addForm.inscriptionId}
                      </div>
                    )}
                    <Select
                      value={addForm.inscriptionId > 0 ? addForm.inscriptionId.toString() : undefined}
                      onValueChange={(value) => setAddForm({...addForm, inscriptionId: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectEnrollment')} />
                      </SelectTrigger>
                      <SelectContent>
                        {inscriptions.map((inscription) => {
                          const selectedInscription = inscription.idInscription === addForm.inscriptionId;
                          return (
                            <SelectItem 
                              key={inscription.idInscription} 
                              value={inscription.idInscription.toString()}
                            >
                              {selectedInscription ? 
                                `${t('enrollment')} #${inscription.idInscription} (${t('selected')})` :
                                `${t('enrollment')} #${inscription.idInscription}`
                              }
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payment-amount" className="text-right">
                    {t('amount')} *
                  </Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={addForm.montant}
                    onChange={(e) => setAddForm({...addForm, montant: parseFloat(e.target.value)})}
                    className="col-span-3"
                    placeholder="0 Ar"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payment-method" className="text-right">
                    {t('paymentMethod')} *
                  </Label>
                  <Select
                    value={addForm.modePaiement}
                    onValueChange={(value) => setAddForm({...addForm, modePaiement: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('selectPaymentMethod')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mobile Money">{t('mobileMoney')}</SelectItem>
                      <SelectItem value="Virement">{t('transfer')}</SelectItem>
                      <SelectItem value="Espèces">{t('cash')}</SelectItem>
                      <SelectItem value="Chèque">{t('check')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payment-module" className="text-right">
                    {t('module')} *
                  </Label>
                  <Select
                    value={addForm.module}
                    onValueChange={(value) => setAddForm({...addForm, module: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder={t('selectModule')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Module 1">{t('module1')}</SelectItem>
                      <SelectItem value="Module 2">{t('module2')}</SelectItem>
                      <SelectItem value="Module 3">{t('module3')}</SelectItem>
                      <SelectItem value="Module 4">{t('module4')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleAddPayment}>{t('save')}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-border/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('totalPaymentsTitle')}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {formatAriary(totalPayments)} Ar
                  </p>
                </div>
                <div className="gradient-primary w-12 h-12 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card border-border/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('paymentsToday')}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {formatAriary(totalPaymentsToday)} Ar
                  </p>
                </div>
                <div className="bg-success w-12 h-12 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass-card border-border/30 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t('numberOfPayments')}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {paiements.length}
                  </p>
                </div>
                <div className="bg-warning w-12 h-12 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle>{t('paymentList')}</CardTitle>
            <CardDescription>
              {t('paymentHistory')}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="glass rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-foreground font-semibold">{t('id')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('enrollment')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('date')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('amount')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('mode')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('module')}</TableHead>
                    <TableHead className="text-foreground font-semibold">{t('actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        {t('loadingPayments')}
                      </TableCell>
                    </TableRow>
                  ) : paiements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">{t('noPaymentFound')}</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paiements.map((paiement) => (
                      <TableRow 
                        key={paiement.idPaiement}
                        className="border-border/30 hover:bg-accent/20 transition-colors"
                      >
                        <TableCell className="font-medium">#{paiement.idPaiement}</TableCell>
                        <TableCell>#{paiement.inscriptionId}</TableCell>
                        <TableCell>
                          {new Date(paiement.datePaiement).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold text-success">
                          {formatAriary(paiement.montant)} Ar
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4" />
                            {paiement.modePaiement}
                          </div>
                        </TableCell>
                        <TableCell>{paiement.module}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(paiement)}
                              className="mr-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePayment(paiement.idPaiement)}
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
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t('editPaymentTitle')} #{editForm.idPaiement}</DialogTitle>
            <CardDescription>
              {t('editPaymentInfo')}
            </CardDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-inscription-select" className="text-right">
                {t('enrollment')} *
              </Label>
              <div className="col-span-3">
                <div className="text-sm text-muted-foreground mb-2">
                  {t('currentEnrollment')} : #{editForm.inscriptionId}
                </div>
                <Select
                  value={editForm.inscriptionId.toString()}
                  onValueChange={(value) => setEditForm({...editForm, inscriptionId: parseInt(value)})}
                  defaultValue={editForm.inscriptionId.toString()}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      key={editForm.inscriptionId} 
                      value={editForm.inscriptionId.toString()}
                    >
                      {t('enrollment')} #{editForm.inscriptionId} ({t('current')})
                    </SelectItem>
                    {inscriptions
                      .filter(inscription => inscription.idInscription !== editForm.inscriptionId)
                      .map((inscription) => (
                        <SelectItem 
                          key={inscription.idInscription} 
                          value={inscription.idInscription.toString()}
                        >
                          {t('enrollment')} #{inscription.idInscription}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-payment-amount" className="text-right">
                {t('amount')} *
              </Label>
              <Input
                id="edit-payment-amount"
                type="number"
                value={editForm.montant}
                onChange={(e) => setEditForm({...editForm, montant: parseFloat(e.target.value)})}
                className="col-span-3"
                placeholder="0 Ar"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-payment-method" className="text-right">
                {t('paymentMethod')} *
              </Label>
              <Select
                value={editForm.modePaiement}
                onValueChange={(value) => setEditForm({...editForm, modePaiement: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectPaymentMethod')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile Money">{t('mobileMoney')}</SelectItem>
                  <SelectItem value="Virement">{t('transfer')}</SelectItem>
                  <SelectItem value="Espèces">{t('cash')}</SelectItem>
                  <SelectItem value="Chèque">{t('check')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-payment-module" className="text-right">
                {t('module')} *
              </Label>
              <Select
                value={editForm.module}
                onValueChange={(value) => setEditForm({...editForm, module: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectModule')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Module 1">{t('module1')}</SelectItem>
                  <SelectItem value="Module 2">{t('module2')}</SelectItem>
                  <SelectItem value="Module 3">{t('module3')}</SelectItem>
                  <SelectItem value="Module 4">{t('module4')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleEditPayment}>{t('save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;