# SmartBooking — Plateforme de réservation de spectacles

Application web de réservation de spectacles culturels développée avec **Spring Boot 3** (backend) et **React 18 + TypeScript** (frontend).

---

## Stack technique

| Côté | Technologies |
|------|-------------|
| Backend | Java 21, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA, Hibernate |
| Base de données | MySQL 8, Flyway (migrations) |
| Frontend | React 18, TypeScript, Vite 5, React Router v6 |
| Build | Maven, npm |

---

## Prérequis

- Java 21
- Maven 3.8+
- MySQL 8
- Node.js 18+ / npm

---

## Installation & démarrage

### 1. Base de données

Créer la base de données MySQL :

```sql
CREATE DATABASE smartbooking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Les tables et le jeu de données sont créés automatiquement par Flyway au démarrage.

### 2. Backend (Spring Boot)

```bash
# À la racine du projet
mvn spring-boot:run
```

Le serveur démarre sur **http://localhost:8080**

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:3000**

---

## Configuration

Fichier : `src/main/resources/application.properties`

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/smartbooking
spring.datasource.username=root
spring.datasource.password=root
```

Adapter selon votre environnement MySQL.

---

## Comptes de test

| Login | Mot de passe | Rôle |
|-------|-------------|------|
| `admin` | `admin123` | Administrateur |
| `alice` | `pass123` | Membre |
| `bob` | `pass123` | Membre |
| `claire` | `pass123` | Membre |
| `david` | `pass123` | Membre |
| `emma` | `pass123` | Membre |
| `producer1` | `pass123` | Producteur (approuvé) |
| `producer2` | `pass123` | Producteur (en attente d'approbation) |

---

## Fonctionnalités

### Visiteur (non connecté)
- Consulter le catalogue des spectacles confirmés
- Voir la fiche détaillée d'un spectacle (dates, lieux, tarifs, avis)
- S'inscrire en tant que membre ou producteur

### Membre connecté
- Réserver des places (choix du tarif et de la quantité)
- Consulter ses réservations
- Laisser un avis sur un spectacle déjà assisté

### Administrateur
- Gérer les spectacles (créer, modifier, confirmer, révoquer, supprimer)
- Gérer les représentations (ajouter des dates, tarifs, lieux)
- Gérer les artistes et leurs types
- Gérer les lieux et localités
- Gérer les utilisateurs (activer, désactiver, approuver)
- Valider ou supprimer les avis en attente

---

## Structure du projet

```
smartbooking/
├── src/
│   └── main/
│       ├── java/be/event/smartbooking/
│       │   ├── api/controller/      # Contrôleurs REST
│       │   ├── config/              # Sécurité, WebConfig
│       │   ├── dto/                 # Objets de transfert
│       │   ├── model/               # Entités JPA
│       │   ├── repository/          # Repositories Spring Data
│       │   └── service/             # Logique métier
│       └── resources/
│           └── db/migration/        # Migrations Flyway (V1–V6)
├── frontend/
│   └── src/
│       ├── components/              # Header, Footer, ShowCard, StarRating…
│       ├── context/                 # AuthContext
│       ├── pages/                   # Pages React (publiques + admin)
│       ├── services/                # Appels API
│       └── types/                   # Types TypeScript
└── uploads/                         # Images uploadées
```

---

## API REST — Principaux endpoints

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| POST | `/api/users/register` | Public | Inscription |
| POST | `/api/users/login` | Public | Connexion |
| GET | `/api/shows` | Public | Liste des spectacles confirmés |
| GET | `/api/shows/slug/{slug}` | Public | Détail d'un spectacle |
| GET | `/api/reviews/show/{id}` | Public | Avis validés d'un spectacle |
| POST | `/api/reservations` | Membre | Créer une réservation |
| GET | `/api/reservations/my-bookings` | Membre | Mes réservations |
| POST | `/api/reviews` | Membre | Soumettre un avis |
| GET | `/api/shows/admin` | Admin | Tous les spectacles |
| POST | `/api/shows` | Admin | Créer un spectacle |
| PUT | `/api/shows/{id}/confirm` | Admin | Confirmer un spectacle |
| GET | `/api/reviews/pending` | Admin | Avis en attente |
| PUT | `/api/reviews/{id}/validate` | Admin | Valider un avis |

---

## Jeu de données

Le projet est livré avec un jeu de données complet (migration **V6**) :

- **8 spectacles** : Stromae, Angèle, Le Misanthrope, Lac des Cygnes, La Traviata, Gad Elmaleh, Jazz Collective, Lost Frequencies
- **8 artistes** avec types artistiques
- **10 lieux** en Belgique
- **25 localités** (Belgique + Europe)
- **40 représentations** entre 2024 et 2026
- **15 réservations** et **16 avis** (13 validés, 3 en attente)

---

## Migrations Flyway

| Version | Description |
|---------|-------------|
| V1 | Schéma utilisateurs et rôles |
| V2 | Schéma domaine (artistes, lieux, spectacles, représentations, prix) |
| V3 | Table réservations |
| V4 | Table avis |
| V5 | Localités belges et européennes |
| V6 | Jeu de données complet |
