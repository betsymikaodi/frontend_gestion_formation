import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { Course } from '@/types/index';
import { useToast } from '@/hooks/use-toast';
import { FormationsService } from '@/services/formations.service';
import { formatAriary } from '@/lib/format';

const Courses = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Add course form state
  const [addForm, setAddForm] = useState({
    nom: '',
    description: '',
    frais: '',
    duree: ''
  });

  // Edit course form state  
  const [editForm, setEditForm] = useState({
    nom: '',
    description: '',
    frais: '',
    duree: ''
  });

  // Fetch formations from API
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await FormationsService.getAll();
      setCourses(data);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les formations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddCourse = async () => {
    if (!addForm.nom || !addForm.description || !addForm.frais || !addForm.duree) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      await FormationsService.create({
        nom: addForm.nom,
        description: addForm.description,
        frais: parseFloat(addForm.frais),
        duree: parseInt(addForm.duree)
      });

      setAddForm({ nom: '', description: '', frais: '', duree: '' });
      setIsAddDialogOpen(false);
      await fetchCourses();
      
      toast({
        title: "Succès",
        description: "Formation ajoutée avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la formation",
        variant: "destructive"
      });
    }
  };

  const handleEditCourse = async () => {
    if (!editForm.nom || !editForm.description || !editForm.frais || !editForm.duree) {
      toast({
        title: "Erreur", 
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    if (!editingCourse) {
      console.error('Pas de formation en cours d\'édition');
      return;
    }

    const updateData = {
      nom: editForm.nom,
      description: editForm.description,
      frais: parseFloat(editForm.frais),
      duree: parseInt(editForm.duree)
    };

    try {
      console.log('Mise à jour de la formation:', {
        id: editingCourse.id_formation,
        data: updateData
      });

      await FormationsService.update(editingCourse.idFormation, updateData);

      setIsEditDialogOpen(false);
      setEditingCourse(null);
      await fetchCourses();
      
      toast({
        title: "Succès",
        description: "Formation mise à jour avec succès"
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de modifier la formation",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCourse = async (idFormation: number) => {
    if (!idFormation || isNaN(idFormation)) {
      console.error('ID de formation invalide:', idFormation);
      toast({
        title: "Erreur",
        description: "ID de formation invalide",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Suppression de la formation avec ID:', idFormation);
      await FormationsService.delete(idFormation);
      await fetchCourses();
      toast({
        title: "Succès",
        description: "Formation supprimée avec succès"
      });
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer la formation",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setEditForm({
      nom: course.nom,
      description: course.description,
      frais: course.frais.toString(),
      duree: course.duree.toString()
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Formations</h1>
          <p className="text-muted-foreground">
            Gérez vos formations et cours disponibles
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Ajouter Formation
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle formation</DialogTitle>
              <p className="text-muted-foreground">Remplissez les informations pour créer une nouvelle formation.</p>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-name" className="text-right">
                  Nom *
                </Label>
                <Input
                  id="add-name"
                  value={addForm.nom}
                  onChange={(e) => setAddForm({...addForm, nom: e.target.value})}
                  className="col-span-3"
                  placeholder="Nom de la formation"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-description" className="text-right">
                  Description *
                </Label>
                <Textarea
                  id="add-description"
                  value={addForm.description}
                  onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                  className="col-span-3"
                  placeholder="Description de la formation"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-fee" className="text-right">
                  Prix (Ar) *
                </Label>
                <Input
                  id="add-fee"
                  type="number"
                  value={addForm.frais}
                  onChange={(e) => setAddForm({...addForm, frais: e.target.value})}
                  className="col-span-3"
                  placeholder="Prix en Ariary"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="add-duration" className="text-right">
                  Durée (jours) *
                </Label>
                <Input
                  id="add-duration"
                  type="number"
                  value={addForm.duree}
                  onChange={(e) => setAddForm({...addForm, duree: e.target.value})}
                  className="col-span-3"
                  placeholder="Ex: 90, 60..."
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleAddCourse}>Ajouter</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Rechercher les formations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher par nom ou description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Formations ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Durée (jours)</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Chargement des formations...
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.idFormation}>
                    <TableCell className="font-mono">{course.idFormation}</TableCell>
                    <TableCell className="font-medium">{course.nom}</TableCell>
                    <TableCell className="max-w-xs truncate">{course.description}</TableCell>
                    <TableCell>{formatAriary(course.frais)} Ar</TableCell>
                    <TableCell>{course.duree}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(course)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.idFormation)}
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
          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune formation trouvée</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
  <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la formation</DialogTitle>
            <p className="text-muted-foreground">Modifiez les informations de la formation sélectionnée.</p>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nom *
              </Label>
              <Input
                id="edit-name"
                value={editForm.nom}
                onChange={(e) => setEditForm({...editForm, nom: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description *
              </Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-fee" className="text-right">
                Prix (€) *
              </Label>
              <Input
                id="edit-fee"
                type="number"
                value={editForm.frais}
                onChange={(e) => setEditForm({...editForm, frais: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-duration" className="text-right">
                Durée (jours) *
              </Label>
              <Input
                id="edit-duration"
                type="number"
                value={editForm.duree}
                onChange={(e) => setEditForm({...editForm, duree: e.target.value})}
                className="col-span-3"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditCourse}>Sauvegarder</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CoursesPage = Courses;
export default CoursesPage;