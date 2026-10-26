# SUMA — Frontend de gestion des mémoires et des soutenances

SUMA est une application web universitaire qui accompagne la gestion des sujets de mémoire, des mémoires et de leurs versions, du suivi d’encadrement, des pré-soutenances, des soutenances et des archives.

Ce dépôt contient **le frontend Angular**. Il affiche les pages, recueille les informations des utilisateurs et communique avec une API Laravel par HTTP. Il ne contient ni le backend Laravel ni sa base de données : pour utiliser les fonctionnalités qui enregistrent ou consultent des données, le frontend doit pouvoir joindre une API compatible.

Ce guide s’adresse aux personnes qui découvrent le projet et le développement web.

## 1. De quoi a-t-on besoin ?

Avant de commencer, installez :

- **Node.js et npm** : npm est installé avec Node.js. Le projet utilise Angular 17 et TypeScript 5.4.
- **Git**, si vous souhaitez récupérer le projet ou synchroniser vos modifications.
- **Le backend Laravel SUMA**, lancé séparément et configuré pour accepter les requêtes du frontend.
- Un navigateur récent, par exemple Chrome ou Edge.

La version de Node.js n’est pas fixée dans ce dépôt par un fichier `.nvmrc` ou `.node-version`. Si l’installation ou la compilation échoue, vérifiez que votre version de Node.js est compatible avec Angular CLI 17.

## 2. Installer et lancer le frontend

Ouvrez un terminal à la racine de ce dépôt, c’est-à-dire dans le dossier qui contient `package.json`, puis exécutez :

```bash
npm ci
npm start
```

- `npm ci` installe les dépendances exactes indiquées par `package-lock.json`. Cette commande est à exécuter la première fois, ou après un changement des dépendances.
- `npm start` démarre le serveur de développement Angular.

Ouvrez ensuite **http://localhost:4200/** dans le navigateur. Gardez le terminal ouvert pendant l’utilisation; pour arrêter le serveur, revenez au terminal et appuyez sur `Ctrl+C`.

Si `npm ci` échoue, notez le message affiché et vérifiez l’installation de Node.js/npm avant de supprimer ou modifier des fichiers de dépendances.

## 3. Connecter le frontend à Laravel

En mode développement, l’URL de l’API est définie dans [`src/environments/environment.ts`](./src/environments/environment.ts) :

```ts
apiUrl: 'http://localhost:8000/api'
```

Le backend doit donc être accessible à cette adresse, ou cette valeur doit être adaptée à l’adresse réelle de votre API. Le lancement et la configuration de Laravel se font **dans le projet backend**, qui est indépendant de ce dépôt.

Pour un autre environnement, utilisez la configuration prévue par Angular dans [`src/environments/environment.prod.ts`](./src/environments/environment.prod.ts). L’adresse inscrite dans ce fichier est une valeur existante du projet; elle n’a pas été vérifiée comme URL de production active. Confirmez la bonne adresse avec l’équipe backend avant de publier ou de déployer le frontend.

Le navigateur peut aussi bloquer les appels si le serveur Laravel n’autorise pas l’origine du frontend (par exemple `http://localhost:4200`). Dans ce cas, la configuration CORS doit être vérifiée côté Laravel. Ne contournez pas une erreur d’authentification ou d’autorisation en désactivant les guards de l’application.

## 4. Première utilisation

1. Démarrez le backend Laravel et vérifiez qu’il est joignable à l’adresse configurée.
2. Démarrez le frontend avec `npm start`, puis ouvrez `http://localhost:4200/`.
3. Connectez-vous avec un compte connu du backend. Le rôle associé à ce compte détermine les menus et les pages visibles.
4. Si l’inscription est activée par le backend, utilisez **Inscription** sur la page de connexion. Sinon, demandez un compte à l’administrateur de la plateforme.
5. Après connexion, le tableau de bord et le menu latéral donnent accès aux sections disponibles pour votre rôle.
6. Utilisez **Mon profil** pour consulter ou modifier vos informations, choisir une photo et changer votre mot de passe.
7. Pour vous déconnecter, utilisez la commande de déconnexion de l’application.

Les liens publics **Archives** et **Calendrier public** sont accessibles sans connexion. Les autres pages nécessitent une session.

## 5. Les rôles dans l’application

Les identifiants de rôle reconnus dans le frontend sont :

| Rôle | Accès présent dans l’interface |
| --- | --- |
| `student` (étudiant) | Mémoires, sujets, profil et parcours auxquels le backend donne accès; réunions et pré-soutenances peuvent être consultées selon les données retournées. |
| `supervisor` (encadreur) | Espace encadreur, mémoires accessibles, réunions, sujets et parcours de suivi autorisés. |
| `jury-member` (membre du jury) | Espace jury et soutenances qui lui sont accessibles. |
| `head-of-department` (chef de département) | Gestion des étudiants et accès aux fonctions de département prévues dans l’interface. |
| `administrator` (administrateur) | Administration, utilisateurs, archives administratives, imports CSV, et autres pages accessibles à ce rôle. |

Les guards Angular servent à contrôler l’affichage et la navigation côté navigateur. **Ils ne sécurisent pas l’API** : Laravel doit vérifier chaque permission et chaque ressource. Une page visible dans le frontend ne garantit donc pas qu’une action sera autorisée par le serveur.

## 6. Parcours d’utilisation de bout en bout

Les étapes ci-dessous décrivent les écrans présents et leur usage. Les règles métier, les validations finales, les transitions de statut et l’enregistrement des données sont décidés par Laravel. Certaines actions dépendent de la configuration et des autorisations du backend.

### 6.1 Sujets de mémoire

1. Connectez-vous avec un rôle auquel l’accès aux sujets est accordé.
2. Ouvrez **Sujets de mémoire** (`/subjects`).
3. Consultez la liste paginée et filtrez-la par statut.
4. Un étudiant peut créer une proposition, modifier un brouillon ou une proposition rejetée, puis la soumettre.
5. Un étudiant peut demander à choisir un sujet publié.
6. Un administrateur ou un chef de département peut publier un sujet en choisissant un département, ou examiner une proposition. En cas de rejet, un motif est demandé.
7. En cas d’erreur, lisez le message du serveur affiché dans la page. La liste peut être limitée par rôle côté API.

Les statuts utilisés dans l’interface sont `draft`, `submitted`, `under_review`, `accepted`, `rejected` et `published`. Le backend décide si l’utilisateur peut effectuer la transition demandée.

### 6.2 Mémoires, dépôts et corrections

1. Ouvrez **Mémoires** (`/theses`) et consultez la liste renvoyée par l’API.
2. Ouvrez un mémoire pour voir ses informations, ses versions, ses commentaires et l’historique des statuts.
3. Le propriétaire étudiant peut déposer une nouvelle version et télécharger une version existante lorsque l’API l’autorise.
4. L’encadreur associé au mémoire peut ajouter une correction en sélectionnant précisément une version, en écrivant la remarque et, si nécessaire, en indiquant la page, la section, un repère et la priorité.
5. L’étudiant peut marquer une correction « corrigée »; l’encadreur peut la valider ou la renvoyer à corriger. Le serveur confirme que la correction et la version correspondent bien au mémoire.
6. Les commentaires et les changements de statut sont visibles dans leurs onglets respectifs.

Les contrôles du navigateur ne remplacent pas les limites de taille, les contrôles de fichiers ou l’autorisation du backend.

### 6.3 Réunions d’encadrement

1. Ouvrez **Réunions d’encadrement** (`/supervision-meetings`), ou suivez le lien depuis la page d’un mémoire.
2. Pour planifier une réunion, indiquez l’identifiant du mémoire, la date et l’heure, le mode, et les informations facultatives disponibles.
3. Ouvrez une réunion pour consulter ses détails, modifier les champs disponibles ou créer une action de suivi.
4. Pour chaque action, indiquez l’identifiant de la personne assignée, une description et une échéance. Son statut peut être suivi (`pending`, `in_progress`, `completed`).

Le backend limite la consultation aux participants concernés. L’interface ne fournit pas ici de sélecteur de mémoire ou d’annuaire des personnes; elle demande leurs identifiants et Laravel doit valider les associations.

### 6.4 Pré-soutenances

1. Ouvrez **Pré-soutenances** (`/defenses/pre-sessions`).
2. Les utilisateurs autorisés peuvent créer une séance en indiquant le département, le lieu et la date/heure. Le compte connecté devient le responsable dans le parcours de création actuel.
3. Ouvrez une séance pour voir ses détails, modifier les informations prévues ou ajouter un passage avec le mémoire, la position, l’horaire et la durée.
4. Le responsable ou les rôles de gestion autorisés peuvent renseigner un résultat de passage : `pending`, `ready` ou `needs_revision`.
5. Une séance peut être annulée ou clôturée. L’interface empêche la demande de clôture tant qu’un passage est encore `pending`; le backend applique également sa propre règle.

Le backend filtre les séances et les passages selon le compte connecté. L’interface ne remplace pas cette vérification.

### 6.5 Soutenances

- **Calendrier connecté** : `/defenses` affiche le calendrier des soutenances accessible à la session. Les utilisateurs ayant les droits de planification peuvent ouvrir le formulaire correspondant.
- **Détail d’une soutenance** : sélectionnez un élément du calendrier pour consulter son détail et les actions permises par le rôle.
- **Calendrier public** : `/public-defense-calendar` est accessible sans connexion. Choisissez une période, puis lancez la recherche. Le calendrier public utilise un endpoint distinct; il ne doit afficher que les soutenances explicitement publiées par le backend.

L’interface ne peut pas garantir qu’un événement est réellement public : Laravel doit exclure les soutenances non publiées et les données privées de la réponse.

### 6.6 Imports CSV (administrateurs)

1. Connectez-vous comme administrateur et ouvrez **Administration → Imports CSV** (`/admin/imports`).
2. Choisissez **Étudiants** ou **Membres du jury**.
3. Téléchargez le modèle et respectez ses en-têtes ainsi que leur ordre exact.
4. Sélectionnez un fichier CSV. La taille maximale indiquée est 5 Mo; la limite de 5 000 lignes et le contenu sont contrôlés par le serveur.
5. Cliquez sur **Prévisualiser**. L’API renvoie les lignes valides, les doublons et les erreurs.
6. Vérifiez attentivement la prévisualisation. Aucune importation définitive n’est déclenchée à cette étape.
7. Cliquez sur **Confirmer l’import définitif** et confirmez dans la boîte de dialogue. La confirmation renvoie le même fichier et le hash fourni par l’API.

Ne modifiez pas le fichier entre la prévisualisation et la confirmation. L’API vérifie le hash et reste responsable de l’autorisation administrateur et de l’import final.

### 6.7 Archives et administration

- **Archives publiques** (`/archives`) : consultez les mémoires que le backend met à disposition du public et ouvrez leur page de détail.
- **Administration** (`/admin`) : selon les fonctions visibles, l’administrateur peut gérer les départements, les formations, les années académiques, les utilisateurs, les archives et les imports.
- **Profil** (`/profile`) : modifiez les informations du compte ou changez le mot de passe. La photo doit être une image; le frontend limite sa sélection à 2 Mo, mais le serveur doit aussi vérifier le fichier.

## 7. Comprendre les messages d’erreur

Si une action échoue :

1. Vérifiez le message affiché dans la page ou la notification.
2. Vérifiez que le backend Laravel fonctionne et que son URL correspond à celle de l’environnement Angular.
3. Vérifiez votre connexion, votre rôle et les données saisies.
4. En cas d’erreur de validation, corrigez les champs signalés par le serveur.
5. Si l’erreur persiste, transmettez à l’équipe technique le message exact, la page et l’action effectuée. N’envoyez pas de mot de passe, de jeton de connexion ni de fichier confidentiel.

Une erreur `401` indique généralement une session absente ou expirée; `403` indique que l’accès a été refusé; `404` que la ressource demandée n’a pas été trouvée ou n’est pas accessible; `422` indique généralement des données rejetées par la validation. Les règles exactes dépendent du backend.

## 8. Organisation du code

Le code de l’application se trouve dans `src/app` :

- `core/` : modèles TypeScript, services HTTP, guards et mécanismes communs.
- `features/` : écrans regroupés par domaine (authentification, mémoires, soutenances, administration, etc.).
- `layout/` : structure de navigation privée et mise en page publique.
- `shared/` : éléments réutilisés, comme les pipes et validateurs.
- `src/environments/` : URL et indicateur de production pour les configurations Angular.

Les pages utilisent Angular 17, TypeScript, Angular Material et les formulaires Angular. La navigation se fait avec Angular Router; certaines pages sont chargées à la demande.

## 9. Vérifier le projet et lancer les tests

```bash
npm run build
npm test -- --watch=false
npx tsc --noEmit -p tsconfig.spec.json
```

- `npm run build` compile l’application pour la production; les fichiers générés vont dans `dist/`.
- `npm test -- --watch=false` exécute les tests unitaires avec Karma et ChromeHeadless, puis termine sans rester en mode surveillance.
- `npx tsc --noEmit -p tsconfig.spec.json` vérifie les types TypeScript de la configuration de tests sans générer de fichiers.

Le projet ne configure pas de commande de tests end-to-end prête à l’emploi. Il ne faut donc pas compter sur `ng e2e` tant qu’un outil e2e n’a pas été installé et configuré. Le build peut afficher un avertissement de taille du bundle initial; cela ne signifie pas à lui seul que la compilation a échoué.

## 10. Limites à connaître

- Ce dépôt est le frontend uniquement; le backend et la base de données doivent être installés et maintenus séparément.
- Un build réussi confirme que le frontend compile, pas que le serveur Laravel est disponible ni que toute l’application fonctionne de bout en bout.
- Les droits visibles dans Angular ne sont pas une autorisation serveur.
- Certaines pages utilisent des identifiants saisis manuellement faute de sélecteur ou de route de recherche documentés dans le contrat disponible.
- La configuration d’API de production doit être confirmée avant déploiement.
- Les contrats API utilisés par les services doivent rester cohérents avec les routes et validations réellement déployées sur Laravel.

## Ressources utiles

- Documentation [Angular](https://angular.dev/)
- Documentation [Angular CLI](https://angular.dev/tools/cli)
- Guide des commandes Angular disponibles : `npx ng help`
