import React, { useState, useEffect } from 'react';
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

const Payments = () => {
  const { toast } = useToast();
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [inscriptions, setInscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [addForm, setAddForm] = useState<CreatePaiementDto>({
    inscriptionId: 0,
    montant: 0,
    modePaiement: '',
    module: ''
  });

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
        title: "Erreur",
        description: error.message || "Impossible de charger les données",
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
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive"
        });
        return;
      }

      await PaiementsService.create(addForm);
      setIsAddDialogOpen(false);
      setAddForm({
        inscriptionId: 0,
        montant: 0,
        modePaiement: '',
        module: ''
      });
      await loadData();
      
      toast({
        title: "Succès",
        description: "Paiement enregistré avec succès"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'enregistrement du paiement",
        variant: "destructive"
      });
    }
  };

  const handleDeletePayment = async (id: number) => {
    try {
      await PaiementsService.delete(id);
      await loadData();
      toast({
        title: "Succès",
        description: "Paiement supprimé avec succès"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression du paiement",
        variant: "destructive"
      });
    }
  };

  const handleEditPayment = async () => {
    try {
      if (!editForm.inscriptionId || !editForm.montant || !editForm.modePaiement || !editForm.module) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
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
        title: "Succès",
        description: "Paiement modifié avec succès"
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification du paiement",
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
              Gestion des Paiements
            </h1>
            <p className="text-muted-foreground">
              Suivez et gérez les paiements des inscriptions
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Paiement
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nouveau Paiement</DialogTitle>
                <CardDescription>
                  Remplissez les informations pour enregistrer un nouveau paiement
                </CardDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="inscription-select" className="text-right">
                    Inscription *
                  </Label>
                  <Select
                    value={addForm.inscriptionId.toString()}
                    onValueChange={(value) => setAddForm({...addForm, inscriptionId: parseInt(value)})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner une inscription" />
                    </SelectTrigger>
                    <SelectContent>
                      {inscriptions.map((inscription) => (
                        <SelectItem 
                          key={inscription.idInscription} 
                          value={inscription.idInscription.toString()}
                        >
                          Inscription #{inscription.idInscription}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payment-amount" className="text-right">
                    Montant *
                  </Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    value={addForm.montant}
                    onChange={(e) => setAddForm({...addForm, montant: parseFloat(e.target.value)})}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payment-method" className="text-right">
                    Mode de Paiement *
                  </Label>
                  <Select
                    value={addForm.modePaiement}
                    onValueChange={(value) => setAddForm({...addForm, modePaiement: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un mode de paiement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                      <SelectItem value="Virement">Virement</SelectItem>
                      <SelectItem value="Espèces">Espèces</SelectItem>
                      <SelectItem value="Chèque">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="payment-module" className="text-right">
                    Module *
                  </Label>
                  <Input
                    id="payment-module"
                    value={addForm.module}
                    onChange={(e) => setAddForm({...addForm, module: e.target.value})}
                    className="col-span-3"
                    placeholder="Ex: Module 1"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddPayment}>Enregistrer</Button>
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
                    Total des Paiements
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {totalPayments.toLocaleString()} €
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
                    Paiements du Jour
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    {totalPaymentsToday.toLocaleString()} €
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
                    Nombre de Paiements
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
            <CardTitle>Liste des Paiements</CardTitle>
            <CardDescription>
              Historique des paiements reçus
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="glass rounded-xl border border-border/30 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="text-foreground font-semibold">ID</TableHead>
                    <TableHead className="text-foreground font-semibold">Inscription</TableHead>
                    <TableHead className="text-foreground font-semibold">Date</TableHead>
                    <TableHead className="text-foreground font-semibold">Montant</TableHead>
                    <TableHead className="text-foreground font-semibold">Mode</TableHead>
                    <TableHead className="text-foreground font-semibold">Module</TableHead>
                    <TableHead className="text-foreground font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Chargement des paiements...
                      </TableCell>
                    </TableRow>
                  ) : paiements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Aucun paiement enregistré</p>
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
                          {paiement.montant.toLocaleString()} €
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
            <DialogTitle>Modifier le Paiement #{editForm.idPaiement}</DialogTitle>
            <CardDescription>
              Modifiez les informations du paiement
            </CardDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-inscription-select" className="text-right">
                Inscription *
              </Label>
              <Select
                value={editForm.inscriptionId.toString()}
                onValueChange={(value) => setEditForm({...editForm, inscriptionId: parseInt(value)})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner une inscription" />
                </SelectTrigger>
                <SelectContent>
                  {inscriptions.map((inscription) => (
                    <SelectItem 
                      key={inscription.idInscription} 
                      value={inscription.idInscription.toString()}
                    >
                      Inscription #{inscription.idInscription}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-payment-amount" className="text-right">
                Montant *
              </Label>
              <Input
                id="edit-payment-amount"
                type="number"
                value={editForm.montant}
                onChange={(e) => setEditForm({...editForm, montant: parseFloat(e.target.value)})}
                className="col-span-3"
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-payment-method" className="text-right">
                Mode de Paiement *
              </Label>
              <Select
                value={editForm.modePaiement}
                onValueChange={(value) => setEditForm({...editForm, modePaiement: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un mode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                  <SelectItem value="Virement">Virement</SelectItem>
                  <SelectItem value="Espèces">Espèces</SelectItem>
                  <SelectItem value="Chèque">Chèque</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-payment-module" className="text-right">
                Module *
              </Label>
              <Input
                id="edit-payment-module"
                value={editForm.module}
                onChange={(e) => setEditForm({...editForm, module: e.target.value})}
                className="col-span-3"
                placeholder="Ex: Module 1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditPayment}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;