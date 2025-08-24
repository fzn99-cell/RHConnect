# 📘 RHConnect – Role-Based Dashboards & Features

## 1. Roles and Their Names

| English Role Name | System Role Key       |
|-------------------|------------------------|
| Employee          | `Employé`              |
| Team Leader       | `Team_leader` / `TL`   |
| Nurse             | `Infirmière`           |
| HR Admin          | `Admin_rh` / HR        |

---

## 2. Dashboards and Sidebar Structure

### 🧑‍💼 Employee Dashboard

**Sidebar Menu:**
- Dashboard  
- Submit a Request  
- My Requests  
- Profile  

**Main Responsibilities:**
- Submit requests for:
  - Leave (`Congé`)
  - Work Certificate (`Attestation de Travail`)
  - Medical File Update (`Demande MAJ Dossier Médical`)
  - Payslip (`Fiche de Paie`)
  - Complaint (`Réclamation`)
  - Sick Leave (`Arrêt Maladie`)
- Upload supporting documents:
  - ✅ Required for Sick Leave
  - ⚠️ Optional for Complaint (based on case)
- Track the status of each request
- Resubmit if rejected, based on comments left by approvers

---

### 👨‍💼 Team Leader Dashboard

**Sidebar Menu:**
- Dashboard (Pending Requests)  
- Requests to Approve  
- Request History  
- Profile  

**Main Responsibilities:**
- Approve or reject:
  - Leave (`Congé`)
  - Sick Leave (`Arrêt Maladie`)
- Provide comments on rejections

---

### 👩‍⚕️ Nurse Dashboard

**Sidebar Menu:**
- Dashboard (Pending Medical Requests)  
- History  
- Profile  

**Main Responsibilities:**
- Update Medical Files
- Request missing information or files via comments
- Leave a comment explaining the reason for rejection, if applicable

---

### 👔 HR Admin Dashboard

**Sidebar Menu:**
- Global Dashboard (All Requests):
  - Work Certificate *(pick-up required)*
  - Complaints
  - Payslips *(downloadable)*
- History  
- Profile  

**Main Responsibilities:**
- Process:
  - Work Certificate requests
  - Payslip requests
  - Complaints
- Finalize request statuses and define delivery method
- Leave relevant comments on processed requests

---

## 3. UI Color Theme

**Official Color Palette:**

| Use Case   | Color Code    | Description         |
|------------|---------------|---------------------|
| Primary    | `#2C3E50`     | Dark Blue           |
| Accent     | `#3498DB`     | Sky Blue            |
| Background | `#F5F7FA`     | Light Gray          |
| Highlights | `#667EEA`     | Used for icons only |

> ❌ **Do not use any purple tones**

---

## 4. Mockup Verification

✅ The provided mockup accurately reflects:
- All defined role-based dashboards  
- Sidebar layout  
- Dynamic forms  
- Status tracking  
- Profile editing  

🔗 **Mockup Preview:**  
[RHConnect UI Mockups](https://project-rhconnect-hr-management-ui-mockups-868.magicpatterns.app)
