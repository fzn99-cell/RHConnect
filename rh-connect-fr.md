# 📘 RHConnect – Dashboards par Rôle / Role-Based Dashboards

## 1. Rôles et leurs noms / Roles and Their Names

| English Role Name | System Role Key       |
|-------------------|------------------------|
| Employee          | `Employé`              |
| Team Leader       | `Team_leader` / `TL`   |
| Nurse             | `Infirmière`           |
| HR Admin          | `Admin_rh`             |

---

## 2. Tableaux de Bord et Menus / Dashboards and Sidebar Structure

### 🧑‍💼 Tableau de bord Employé / Employee Dashboard

**Menu latéral (Sidebar):**
- Dashboard  
- Submit a Request *(Soumettre une demande)*  
- My Requests *(Mes demandes)*  
- Profile *(Profil)*

**Responsabilités:**
- Soumettre des demandes pour :
  - Congé *(Leave)*
  - Attestation de Travail *(Work Certificate)*
  - MAJ Dossier Médical *(Medical File Update)*
  - Fiche de Paie *(Payslip)*
  - Réclamation *(Complaint)*
  - Arrêt Maladie *(Sick Leave)*
- Upload des justificatifs :
  - ✅ Requis pour l'Arrêt Maladie
  - ⚠️ Optionnel pour Réclamation (selon le cas)
- Suivre le statut des demandes
- Ré-soumettre selon les commentaires reçus

---

### 👨‍💼 Tableau de bord Chef d’équipe / Team Leader Dashboard

**Menu latéral (Sidebar):**
- Dashboard *(Demandes à traiter)*  
- Requests to Approve *(Demandes à approuver)*  
- Request History *(Historique des demandes)*  
- Profile *(Profil)*

**Responsabilités:**
- Approuver ou rejeter :
  - Congé *(Leave)*
  - Arrêt Maladie *(Sick Leave)*
- Laisser des commentaires en cas de rejet

---

### 👩‍⚕️ Tableau de bord Infirmière / Nurse Dashboard

**Menu latéral (Sidebar):**
- Dashboard *(Demandes médicales à traiter)*  
- History *(Historique)*  
- Profile *(Profil)*

**Responsabilités:**
- Mettre à jour les Dossiers Médicaux
- Demander des informations ou fichiers manquants via commentaires
- Expliquer les raisons d’un rejet via commentaire

---

### 👔 Tableau de bord RH Admin / HR Admin Dashboard

**Menu latéral (Sidebar):**
- Dashboard *(Toutes les demandes)* :
  - Attestation de Travail *(à récupérer sur place)*
  - Réclamations *(Complaints)*
  - Fiches de Paie *(téléchargeables)*
- History *(Historique)*  
- Profile *(Profil)*

**Responsabilités:**
- Traiter les demandes :
  - Attestation
  - Fiche de Paie
  - Réclamation
- Finaliser les statuts et définir le mode de livraison
- Laisser des commentaires adaptés

---

## 3. Thème Couleur UI / UI Color Theme

**Palette Officielle:**

| Usage        | Code Couleur | Description         |
|--------------|--------------|---------------------|
| Primary      | `#2C3E50`    | Bleu Foncé / Dark Blue  
| Accent       | `#3498DB`    | Bleu Ciel / Sky Blue  
| Background   | `#F5F7FA`    | Gris Clair / Light Gray  
| Highlights   | `#667EEA`    | Pour icônes uniquement / Icons only  

> ❌ **Ne pas utiliser de tons violets / No purple tones allowed**

---

## 4. Validation de la Maquette / Mockup Verification

✅ La maquette fournie correspond parfaitement :
- Aux dashboards selon les rôles  
- À la structure du menu latéral  
- Aux formulaires dynamiques  
- Au suivi des statuts  
- À l'édition de profil  

🔗 **Aperçu de la maquette / Mockup Preview :**  
[RHConnect UI Mockups](https://project-rhconnect-hr-management-ui-mockups-868.magicpatterns.app)
