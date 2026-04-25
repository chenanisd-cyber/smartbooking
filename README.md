# SmartBooking — Plateforme de réservation de spectacles

Application web de réservation de spectacles culturels développée en Java/Spring Boot pour le backend et React/TypeScript pour le frontend. Projet réalisé dans le cadre d'une formation.

---

## Stack technique

| Côté | Technologies |
|------|-------------|
| Backend | Java 21, Spring Boot 3.3.4, Spring Security 6, Spring Data JPA, Hibernate |
| Base de données | MySQL 8, Flyway (migrations V1→V10) |
| Frontend | React 18, TypeScript, Vite 5, React Router v6 |
| Paiement | Stripe (mode test) |
| Email | JavaMailSender + MailTrap (environnement de dev) |
| Autres | Spring HATEOAS, OpenCSV 5.9, Stripe Java 25.1.0 |
| Build | Maven, npm |

---

## Prérequis

- Java 21+
- Maven 3.8+
- MySQL 8
- Node.js 18+ / npm
- Un compte **MailTrap** (gratuit) → pour recevoir les emails de test
- Un compte **Stripe** (gratuit) → pour tester les paiements

---

## Installation

### 1. Base de données

```sql
CREATE DATABASE smartbooking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

> Les tables et données de démonstration sont créées automatiquement par Flyway au démarrage.

### 2. Configuration locale

Créer le fichier `src/main/resources/application-local.properties` (ce fichier est ignoré par git) :

```properties
# Base de données
spring.datasource.url=jdbc:mysql://localhost:3306/smartbooking?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Europe/Brussels
spring.datasource.username=root
spring.datasource.password=root

# Stripe — https://dashboard.stripe.com/test/apikeys
stripe.secret.key=sk_test_VOTRE_CLE_SECRETE
stripe.publishable.key=pk_test_VOTRE_CLE_PUBLIQUE

# MailTrap — https://mailtrap.io → Inboxes → SMTP Settings
spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=VOTRE_USERNAME_MAILTRAP
spring.mail.password=VOTRE_PASSWORD_MAILTRAP
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# URL du frontend
app.frontend.url=http://localhost:5173
```

### 3. Backend

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

Le serveur démarre sur **http://localhost:8080**

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:5173**

---

## Comptes de test

| Login | Mot de passe | Rôle |
|-------|-------------|------|
| `admin` | `admin123` | Administrateur |
| `alice` | `pass123` | Membre |
| `bob` | `pass123` | Membre |
| `claire` | `pass123` | Membre |
| `producer1` | `pass123` | Producteur (approuvé) |
| `producer2` | `pass123` | Producteur (non approuvé) |

> Pour tester le rôle **critique de presse**, assigner manuellement le rôle via MySQL :
> ```sql
> INSERT INTO user_roles (user_id, role_id) VALUES (<user_id>, 5);
> ```

---

## Fonctionnalités

### Visiteur (non connecté)
- Catalogue paginé avec recherche, filtres par localité/lieu et tri
- Fiche détaillée d'un spectacle (dates, tarifs, avis, partage social)
- Inscription en tant que membre ou producteur
- Récupération de mot de passe par email

### Membre connecté
- Réservation de places avec paiement Stripe (mode test)
- Historique des réservations
- Laisser un avis sur un spectacle réservé
- Suppression du compte

### Critique de presse
- Soumettre une critique sans avoir réservé
- Lier un article externe à la critique

### Producteur
- Tableau de bord : statistiques par spectacle (places vendues, recettes, taux de remplissage)
- Modération des avis en attente (valider / supprimer)

### Administrateur
- Gestion complète : spectacles, artistes, lieux, utilisateurs, représentations
- Gérer les artistes collaborateurs par spectacle
- Valider les avis en attente
- Import de spectacles via fichier CSV
- Export des réservations en CSV

### API publique (HATEOAS)
- `GET /api/public/shows` — liste des spectacles avec liens HATEOAS
- `GET /api/public/artists` — liste des artistes avec liens HATEOAS
- Compatible HTTP Basic auth pour les clients API externes

---

## Structure du projet

```
smartbooking/
├── src/main/java/be/event/smartbooking/
│   ├── api/controller/      # Contrôleurs REST
│   ├── config/              # Sécurité, WebConfig
│   ├── dto/                 # Objets de transfert (requête / réponse)
│   ├── model/               # Entités JPA
│   ├── repository/          # Repositories Spring Data
│   └── service/             # Logique métier
├── src/main/resources/
│   ├── db/migration/        # Migrations Flyway (V1–V10)
│   ├── application.properties          # Config de base (placeholders)
│   └── application-local.properties   # Config locale (ignoré par git)
├── frontend/src/
│   ├── components/          # Header, Footer, ShowCard, ShareButtons…
│   ├── context/             # AuthContext (session + rôles)
│   ├── pages/               # Pages React (public, admin, producteur)
│   ├── services/            # api.ts — tous les appels API
│   └── types/               # Interfaces TypeScript
└── uploads/                 # Images des spectacles
```

---

## Migrations Flyway

| Version | Description |
|---------|-------------|
| V1 | Schéma utilisateurs et rôles |
| V2 | Schéma domaine (artistes, lieux, spectacles, représentations, prix) |
| V3 | Table réservations |
| V4 | Table avis |
| V5 | Localités belges |
| V6 | Jeu de données complet (8 spectacles, 7 utilisateurs, 40 représentations…) |
| V7 | Tokens de réinitialisation de mot de passe |
| V8 | Colonne Stripe PaymentIntent sur réservations |
| V9 | Type et URL article sur les avis (rôle presse) |
| V10 | Table many-to-many artistes collaborateurs par spectacle |

---

## API — Principaux endpoints

| Méthode | URL | Accès | Description |
|---------|-----|-------|-------------|
| POST | `/api/users/register` | Public | Inscription |
| POST | `/api/users/login` | Public | Connexion |
| POST | `/api/users/forgot-password` | Public | Demande de reset |
| POST | `/api/users/reset-password` | Public | Reset mot de passe |
| GET | `/api/shows` | Public | Catalogue paginé + filtres |
| GET | `/api/shows/slug/{slug}` | Public | Détail d'un spectacle |
| GET | `/api/public/shows` | Public | Spectacles (HATEOAS) |
| GET | `/api/payments/config` | Public | Clé publique Stripe |
| POST | `/api/payments/create-intent` | Membre | Créer intention de paiement |
| POST | `/api/payments/confirm/{id}` | Membre | Confirmer la réservation |
| GET | `/api/reservations/my-bookings` | Membre | Mes réservations |
| POST | `/api/reviews` | Membre | Soumettre un avis |
| GET | `/api/producer/stats` | Producteur | Statistiques |
| GET | `/api/reviews/pending` | Producteur + Admin | Avis en attente |
| GET | `/api/admin/csv/export/reservations` | Admin | Export CSV |
| POST | `/api/admin/csv/import/shows` | Admin | Import CSV |

---

## Format d'import CSV (spectacles)

Le fichier doit avoir une ligne d'en-tête. Chaque ligne = une représentation.

```
title,description,artistName,locationName,dateTime,priceType,priceAmount,availableSeats
"Le Roi Lion","Spectacle musical","Jean Dupont","Théâtre Royal","15/06/2026 20:00","STANDARD","25.00","200"
```

Formats de date acceptés : `dd/MM/yyyy HH:mm` ou `yyyy-MM-dd'T'HH:mm`  
Types de prix : `STANDARD`, `VIP`, `REDUIT`, `PREMIUM`

---

## Jeu de données (seed V6)

- 8 spectacles avec images : Stromae, Angèle, Le Misanthrope, Lac des Cygnes, La Traviata, Gad Elmaleh, Jazz Collective, Lost Frequencies
- 8 artistes avec types artistiques
- 10 lieux en Belgique
- 25 localités
- 40 représentations (2025–2026)
- 15 réservations et 16 avis
