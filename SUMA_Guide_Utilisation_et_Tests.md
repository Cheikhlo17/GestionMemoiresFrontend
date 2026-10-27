# SUMA — Guide complet d'utilisation et de test fonctionnel

> **Périmètre de ce guide :** le dépôt actuellement accessible contient le frontend Angular uniquement. Le backend Laravel, sa base de données, ses migrations, ses policies et ses journaux ne sont pas présents dans ce workspace. Les routes API décrites ici sont celles appelées par les services Angular et les contrats communiqués pour cette intégration; elles n'ont pas été vérifiées contre une instance Laravel en fonctionnement. Un écran compilable ne prouve ni que son endpoint est disponible ni que le scénario fonctionne de bout en bout.

Les exemples de données explicitement signalés comme **fictifs** sont destinés à un environnement de test isolé. N'effectuez aucune création, suppression, import ou action irréversible sur une base de production.

## Sommaire

- [Partie I — Préparation de l'environnement](#partie-i--préparation-de-lenvironnement)
- [Partie II — Comptes de test et rôles](#partie-ii--comptes-de-test-et-rôles)
- [Partie III — Ordre général des tests](#partie-iii--ordre-général-des-tests)
- [Partie IV — Procédures détaillées par module](#partie-iv--procédures-détaillées-par-module)
- [Partie V — Scénario de bout en bout](#partie-v--scénario-de-bout-en-bout)
- [Partie VI — Autorisations et sécurité](#partie-vi--autorisations-et-sécurité)
- [Partie VII — Fonctions intelligentes](#partie-vii--fonctions-intelligentes)
- [Partie VIII — Notifications, PDF et archives](#partie-viii--notifications-pdf-et-archives)
- [Partie IX — Tests automatisés](#partie-ix--tests-automatisés)
- [Partie X — Fiches de suivi](#partie-x--fiches-de-suivi)
- [Partie XI — Diagnostic des problèmes courants](#partie-xi--diagnostic-des-problèmes-courants)
- [Limites et informations manquantes](#limites-et-informations-manquantes)

---

## Partie I — Préparation de l'environnement

### I.1 Ce qui est nécessaire

- Node.js et npm, compatibles avec Angular 17.
- Un navigateur récent.
- Le backend Laravel SUMA dans son propre dossier, démarré selon la documentation de ce projet.
- Une base de données de **développement/test**, initialisée avec les données nécessaires au workflow.
- Des comptes de test appartenant aux rôles effectivement configurés côté Laravel.

Le dépôt frontend ne fixe pas la version de Node.js avec `.nvmrc`/`.node-version`. Il ne contient pas non plus le projet Laravel ni la configuration de sa base de données. Les versions précises, le moteur SQL, le nom de base, les commandes Laravel, les migrations et la procédure de création des comptes sont donc **à vérifier dans la configuration du projet backend**. N'inventez pas de secrets ou de valeurs de connexion.

### I.2 Démarrer le backend et la base

1. Ouvrez le dossier backend Laravel dans un terminal distinct.
2. Suivez son README et sa configuration locale pour démarrer la base de données, appliquer les migrations et démarrer Laravel.
3. Ne lancez pas de migration, de seed ou de commande destructive sur une base de production.
4. Vérifiez, à l'adresse locale définie par le backend, qu'une route de santé ou un endpoint documenté répond. **Aucune route de santé n'est identifiée dans le frontend**; ne supposez pas qu'elle existe.
5. Vérifiez la configuration CORS Laravel afin que l'origine Angular, généralement `http://localhost:4200`, soit autorisée.

Les commandes exactes pour la base et Laravel ne peuvent pas être fournies sans accès au backend. Recherchez-les dans le README backend et ses fichiers de configuration. Pour la base, utilisez uniquement des identifiants conservés dans la configuration locale sécurisée, jamais dans un ticket ou une capture d'écran.

### I.3 Installer et démarrer Angular

Depuis la racine `GestionMemoiresFrontend`, dans un terminal :

```bash
npm ci
npm start
```

`npm ci` installe les paquets selon `package-lock.json`. `npm start` exécute le script `ng serve`. Ouvrez ensuite :

- Frontend : `http://localhost:4200/`
- API de développement configurée : `http://localhost:8000/api`

Pour arrêter le serveur Angular, faites `Ctrl+C` dans le terminal où `npm start` est en cours.

### I.4 Configuration des URLs

Le frontend n'utilise pas de fichier `.env` pour son URL d'API dans le dépôt inspecté. Les valeurs sont définies dans :

- [`src/environments/environment.ts`](./src/environments/environment.ts) — `http://localhost:8000/api` en développement.
- [`src/environments/environment.prod.ts`](./src/environments/environment.prod.ts) — URL de production présente dans le fichier, mais dont l'accessibilité et l'exactitude ne sont pas vérifiées.

Si votre backend écoute ailleurs, faites confirmer l'adresse exacte et utilisez le mécanisme d'environnement Angular du projet. Ne publiez pas une adresse de production non vérifiée. Aucun secret ne doit être ajouté au code livré au navigateur.

### I.5 Vérifier la communication

1. Confirmez que le terminal Angular indique que le serveur a démarré sans erreur.
2. Ouvrez `http://localhost:4200/` et vérifiez que l'application s'affiche.
3. Essayez d'ouvrir la page de connexion et connectez-vous avec un compte de test valide.
4. Dans les outils développeur du navigateur, onglet **Réseau/Network**, observez les requêtes vers l'URL `apiUrl` configurée. Ne copiez ni jeton ni en-tête d'autorisation dans une preuve partagée.
5. Une erreur réseau ou CORS indique que la communication n'est pas établie; un statut HTTP d'erreur indique que le serveur a répondu, mais pas que l'opération métier est valide.
6. Faites vérifier côté backend que les données attendues sont bien enregistrées et que les requêtes correspondent aux routes et permissions Laravel.

---

## Partie II — Comptes de test et rôles

### II.1 Rôles repérés dans le frontend

Les slugs employés par les guards et l'interface sont `student`, `supervisor`, `jury-member`, `head-of-department` et `administrator`. Ils sont lus dans le rôle de l'utilisateur retourné par l'API. Leur existence et leurs permissions effectives doivent être confirmées côté Laravel.

| Rôle identifié | Responsabilité et accès visibles | Actions présentées par l'interface | Vérifications d'accès |
|---|---|---|---|
| `student` — étudiant | Profil, mémoires, sujets; les données de réunions/pré-soutenances sont limitées par le serveur. | Créer un mémoire brouillon, soumettre son mémoire, déposer une version, proposer/soumettre/choisir un sujet, suivre/corriger les corrections qui lui sont accessibles. | Tester qu'il ne peut lire ou modifier le dossier d'un autre étudiant. |
| `supervisor` — encadreur | Espace encadreur, mémoires accessibles, sujets, réunions et parcours de pré-soutenance visibles selon rôle et relation. | Commenter ou suivre ses mémoires; créer des corrections pour les mémoires dont il est l'encadreur; gérer les réunions selon les règles backend. | Un encadreur ne doit pas accéder aux mémoires d'un autre encadreur sans autorisation. |
| `jury-member` — membre du jury | Espace « Mes soutenances » et détails des soutenances qui lui sont attribuées. | Consulter une soutenance et envoyer une évaluation si la page et les conditions le permettent. | Vérifier qu'il n'accède pas aux soutenances d'un autre jury. |
| `head-of-department` — chef de département | Gestion des étudiants et accès aux opérations de département dans l'interface. | Créer/modifier les dossiers étudiants, gérer les mémoires selon les permissions serveur, publier/examiner des sujets, gérer le calendrier selon droits. | Tester la limite au département autorisé. |
| `administrator` — administrateur | Administration, étudiants, utilisateurs, mémoires, soutenances, archives et imports CSV. | Gérer les références d'administration, activer/désactiver des utilisateurs, gérer les archives, importer les types supportés. | Vérifier toute action privilégiée directement côté serveur. |

Ces intitulés ne constituent pas une politique d'autorisation officielle. La politique Laravel est la référence.

### II.2 Matrice à renseigner avant les essais

Aucun identifiant ni mot de passe de test n'est livré dans le frontend inspecté. Préparez les comptes dans une base de test selon la procédure approuvée du backend, ou demandez à l'administrateur de test. Ne réutilisez pas de compte de production.

| Compte de test | Rôle | Utilisation | Compte disponible ? |
|---|---|---|---|
| À renseigner localement | Étudiant (`student`) | Parcours sujet, mémoire, dépôt et corrections | ☐ Oui ☐ Non |
| À renseigner localement | Encadreur (`supervisor`) | Réunions, retours et corrections | ☐ Oui ☐ Non |
| À renseigner localement | Membre du jury (`jury-member`) | Consultation et évaluation d'une soutenance | ☐ Oui ☐ Non |
| À renseigner localement | Chef de département (`head-of-department`) | Étudiants et opérations de département | ☐ Oui ☐ Non |
| À renseigner localement | Administrateur (`administrator`) | Administration, imports et archives | ☐ Oui ☐ Non |

L'inscription frontend existe, mais le rôle attribué à une inscription, les validations serveur et la possibilité de créer des utilisateurs par ce moyen ne peuvent pas être confirmés ici. **N'utilisez pas l'inscription pour obtenir un rôle privilégié.** Pour les essais, utilisez les mécanismes backend contrôlés et autorisés.

---

## Partie III — Ordre général des tests

L'ordre proposé limite les dépendances entre données. Si une étape n'est pas disponible dans votre environnement, notez-la « Bloqué » au lieu de simuler un succès.

| Ordre | Module/scénario | Pré-requis |
|---:|---|---|
| 1 | Démarrage frontend, API, base de test | Installation, configuration locale et backend disponibles |
| 2 | Authentification, session et profil | Un compte étudiant de test |
| 3 | Référentiels (départements, formations, années, salles, jury, encadreurs) | Données de référence existantes dans la base de test |
| 4 | Gestion des étudiants | Compte administrateur ou chef autorisé; département, formation et année |
| 5 | Sujets de mémoire | Compte étudiant et sujet test; rôle autorisé à publier/examiner |
| 6 | Création, soumission et examen d'un mémoire | Étudiant, département, formation et année |
| 7 | Attribution d'encadreur, commentaires et versions | Mémoire visible et encadreur admissible |
| 8 | Réunions d'encadrement et actions | Mémoire et participants autorisés |
| 9 | Pré-soutenances et passages | Département et mémoires accessibles |
| 10 | Planification, jury, évaluations et résultat de soutenance | Mémoire approuvé, salle, jury admissibles |
| 11 | Archivage administratif et consultation publique | Mémoire éligible selon les règles Laravel |
| 12 | Imports CSV étudiants/membres du jury | Administrateur, fichier de test conforme et données isolées |
| 13 | Tests d'accès et erreurs | Comptes de rôles différents et ressources de test |
| 14 | Build et tests automatisés | Dépendances installées et Chrome compatible pour Karma |

**Hors du parcours confirmé :** notifications, rapports/statistiques détaillés, similarité, suggestion algorithmique, planification automatique, QR code et journal d'audit ne sont pas démontrés comme fonctionnalités dans le frontend inspecté. Voir les parties VII et VIII.

---

## Partie IV — Procédures détaillées par module

Pour les tests API ou base de données, utilisez uniquement un environnement autorisé. Les routes listées ci-dessous sont les URLs construites par les services Angular; la réponse réelle et la persistance doivent être vérifiées auprès du backend.

### IV.1 Accueil, navigation et tableau de bord

**A. Objectif.** Vérifier le chargement du shell, les raccourcis en fonction du rôle et les pages accessibles.

**B. Prérequis.** Frontend lancé. Pour les raccourcis authentifiés, un compte de test connecté.

**C. Procédure.**
1. Ouvrez `/`. Vérifiez la redirection vers `/dashboard` et l'affichage de la page.
2. Vérifiez le menu latéral et les raccourcis pour le rôle connecté.
3. Ouvrez un lien autorisé; vérifiez l'affichage et la réponse API.
4. Copiez une URL protégée, déconnectez-vous, puis collez cette URL. Le guard frontend doit renvoyer vers la connexion.
5. Ouvrez les pages publiques `/archives` et `/public-defense-calendar` en navigation privée.

**D. Attendu.** Les pages publiques restent consultables sans session; les pages protégées sont redirigées ou refusées selon l'état d'authentification. Le contenu métier vient du backend.

**E. Erreurs à vérifier.** API indisponible, compte sans rôle connu, rôle sans accès, liste vide. Ne concluez pas que l'API est protégée uniquement parce qu'un guard bloque la route Angular.

**F. Réussite.** Navigation cohérente, aucune page privée accessible via une session absente, pages publiques accessibles.

**G. Preuves.** Captures sans données personnelles, URL de page, code HTTP expurgé des jetons.

### IV.2 Authentification et profil

**A. Objectif.** Tester connexion, inscription si autorisée, récupération/réinitialisation de mot de passe, déconnexion, profil et changement de mot de passe.

**B. Prérequis.** Compte de test existant. Pour la récupération d'accès, boîte mail de test et service email configuré côté backend.

**C. Procédure.**
1. Ouvrez `/auth/login`; envoyez le formulaire vide et vérifiez les validations locales.
2. Connectez-vous avec le compte de test; vérifiez l'accès au tableau de bord et le menu correspondant au rôle.
3. Ouvrez `/profile`; attendez le chargement de `/auth/me`. Vérifiez que le nom et le rôle correspondent au compte.
4. Modifiez un seul champ avec une valeur fictive valide (par exemple téléphone `+221700000000`), enregistrez, rechargez la page et vérifiez la persistance. La valeur est illustrative, à valider selon le format accepté par Laravel.
5. Sélectionnez une image de test de moins de 2 Mo et enregistrez. Pour contrôler le refus frontend, essayez une image supérieure à 2 Mo; ne l'envoyez pas si l'interface refuse.
6. Testez les champs trop longs (prénom/nom > 100, e-mail > 255, téléphone > 30) et vérifiez que l'interface empêche l'envoi.
7. Dans la section mot de passe, saisissez le mot de passe actuel du compte de test, un mot de passe conforme aux règles affichées et sa confirmation. Vérifiez le succès en vous reconnectant après déconnexion.
8. Cliquez sur déconnexion, puis tentez de recharger `/profile`.
9. Testez `/auth/forgot-password` et `/auth/reset-password` uniquement si le backend et la boîte de test rendent ce parcours opérationnel. Le jeton de réinitialisation ne doit pas être partagé.

**D. Attendu.** La réponse de profil met à jour l'utilisateur en mémoire/cache; une session déconnectée ne doit plus accéder aux pages privées.

**E. Erreurs à vérifier.** Identifiants erronés, e-mail déjà utilisé, erreur de validation `422`, session expirée (`401`), image non conforme, erreur réseau. Vérifiez aussi que le frontend affiche les messages backend disponibles.

**F. Réussite.** Les champs modifiés réapparaissent après rechargement; l'ancien mot de passe n'est plus accepté après un changement réussi et le nouveau permet la connexion.

**G. Preuves.** Captures anonymisées, message backend et vérification de persistance par l'équipe backend. Ne capturez jamais mot de passe, jeton ou contenu d'email sensible.

### IV.3 Départements, formations, années académiques et listes de référence

**A. Objectif.** S'assurer que les valeurs de référence chargées dans les formulaires sont disponibles et cohérentes.

**B. Prérequis.** Administrateur pour leur administration; base de test contenant des références. Les lookups du frontend appellent `/lookups/departments`, `/lookups/programs`, `/lookups/academic-years`, `/lookups/defense-rooms`, `/lookups/jury-members` et `/lookups/supervisors`.

**C. Procédure.**
1. En tant qu'administrateur, ouvrez `/admin/departments`, `/admin/programs` et `/admin/academic-years`.
2. Consultez les listes existantes et notez leurs identifiants via une interface ou un outil backend autorisé.
3. Dans un environnement jetable uniquement, créez une entrée fictive conforme aux champs affichés, vérifiez qu'elle apparaît et qu'elle est sélectionnable dans un formulaire étudiant/mémoire.
4. Si l'écran offre modification ou suppression, ne les testez que sur l'entrée que vous venez de créer.
5. Vérifiez qu'un programme affiché après sélection d'un département appartient bien à ce département.

**D. Attendu.** Les listes de référence sont cohérentes avec les données renvoyées par l'API.

**E. Erreurs à vérifier.** Liste vide, identifiant invalide, code en doublon, suppression d'une référence liée à des dossiers. Le comportement attendu de ces règles dépend du backend.

**F. Réussite.** Création/mise à jour visible après rechargement; les formulaires consomment les bons choix.

**G. Preuves.** Identifiant de donnée de test, capture de liste et réponse API expurgée.

### IV.4 Gestion des étudiants

**A. Objectif.** Vérifier consultation, recherche/filtrage, création, modification et suppression si autorisée.

**B. Prérequis.** Compte `administrator` ou `head-of-department`; département, programme et année présents.

**C. Procédure.**
1. Ouvrez `/students`; vérifiez la liste et les contrôles de recherche/filtres disponibles.
2. Cliquez **Nouvel étudiant** (`/students/create`).
3. Dans la base de test seulement, saisissez des données **fictives** : prénom `Awa Test`, nom `SUMA QA`, e-mail `awa.suma.qa@example.test`, téléphone de test, numéro étudiant unique (par exemple `QA-2026-001`), et choisissez département, programme, année et date d'inscription réellement disponibles.
4. Enregistrez; vérifiez l'apparition dans la liste et ouvrez le dossier.
5. Modifiez un champ non identifiant et vérifiez la persistance.
6. Si la suppression est exposée dans la liste, supprimez uniquement le dossier de test puis vérifiez qu'il n'apparaît plus.

Le service Angular appelle `/students` pour lister/créer, `/students/{id}` pour lire/modifier/supprimer. Les champs exacts acceptés et contraintes sont à confirmer avec Laravel.

**D. Attendu.** La liste reflète les changements serveur et respecte le périmètre départemental du compte.

**E. Erreurs à vérifier.** Champ requis absent, e-mail ou numéro doublonné, référence inexistante, rôle étudiant tentant d'ouvrir `/students`, API indisponible.

**F. Réussite.** Le dossier de test est créé puis modifié avec données persistantes; l'accès non autorisé est refusé côté serveur.

**G. Preuves.** Capture et identifiant QA; vérification serveur/DB. Ne partagez pas d'informations personnelles réelles.

### IV.5 Sujets de mémoire

**A. Objectif.** Tester proposition, soumission, publication, examen, décision et sélection selon le rôle.

**B. Prérequis.** Comptes étudiant et administrateur/chef autorisé; département de test.

**C. Procédure.**
1. Étudiant : ouvrez `/subjects`, puis **Proposer un sujet**.
2. Saisissez un sujet fictif comme « Outil de suivi des dossiers universitaires », avec problématique, objectifs et mots-clés fictifs; enregistrez.
3. Vérifiez son apparition avec le statut renvoyé. Si brouillon, cliquez **Soumettre**.
4. Administrateur/chef : filtrez la liste par `submitted`, ouvrez l'examen, choisissez `under_review` ou `accepted`. Pour tester un rejet, fournissez un motif.
5. Testez la publication d'un sujet en sélectionnant un département de test.
6. Étudiant : filtrez par `published`, puis tentez **Choisir ce sujet** avec un seul sujet de test.
7. Rechargez la page et vérifiez le statut/rattachement décidé par Laravel.

Routes intégrées selon contrat fourni : `/thesis-subjects`, `/thesis-subjects/published`, `/{id}`, `/{id}/submit`, `/{id}/select`, `/{id}/review`.

**D. Attendu.** Le serveur confirme les changements et limite les listes/actions suivant l'utilisateur.

**E. Erreurs à vérifier.** Titre absent, motifs de rejet vides, département interdit, soumission d'un état incompatible, sujet déjà choisi, sélection par rôle non étudiant.

**F. Réussite.** Aucun changement de statut n'est affiché comme réussi sans réponse serveur; statut et historique vérifiables par l'API ou la base.

**G. Preuves.** Captures avant/après, identifiant sujet, réponse API expurgée.

### IV.6 Mémoires et dépôt de versions

**A. Objectif.** Tester création de mémoire, soumission, examen, attribution d'encadreur, versions, commentaires et transitions.

**B. Prérequis.** Étudiant de test, références de département/programme/année, encadreur de test; les rôles de gestion appropriés.

**C. Procédure.**
1. Étudiant : ouvrez `/theses`, puis `/theses/create`.
2. Choisissez un titre fictif, résumé optionnel, département, programme de ce département et année académique. Enregistrez.
3. Vérifiez que le détail du mémoire s'ouvre et que son statut est un brouillon.
4. Dans l'onglet **Versions**, déposez un document de test non confidentiel au format affiché (`.pdf`, `.docx` ou `.zip`) et vérifiez la nouvelle version.
5. Téléchargez cette version et comparez le fichier obtenu avec le fichier de test.
6. Soumettez le mémoire pour examen. Un rôle de gestion consulte le dossier et utilise les transitions affichées.
7. Un administrateur/chef autorisé attribue un encadreur depuis le dialogue d'affectation; vérifiez le nom de l'encadreur au rechargement.
8. Ajoutez un commentaire de test, vérifiez qu'il apparaît avec son auteur et sa date.
9. Vérifiez l'historique des statuts.

Service frontend : `/theses`, `/theses/{id}`, `/theses/{id}/submit`, `/theses/{id}/assign-supervisor`, `/theses/{id}/status`, `/theses/{id}/versions`, `/theses/{id}/versions/{versionId}/download`, `/theses/{id}/comments`.

**D. Attendu.** Le propriétaire peut déposer et soumettre son propre mémoire; l'équipe de gestion peut traiter les transitions autorisées.

**E. Erreurs à vérifier.** Titre vide, référence incohérente, fichier interdit/trop grand, soumission répétée, accès à un mémoire d'un autre étudiant, transition illégale, commentaire vide ou trop long.

**F. Réussite.** Versions, statut, affectation et commentaire persistent après rechargement et sont associés au bon mémoire.

**G. Preuves.** ID mémoire/version; capture avant/après; empreinte locale du fichier de test si utile (sans publier le document).

### IV.7 Corrections versionnées

**A. Objectif.** Vérifier qu'une correction reste reliée au mémoire et à la version ciblés et que les transitions suivent le workflow.

**B. Prérequis.** Mémoire de test avec au moins une version; étudiant propriétaire et encadreur effectivement associé.

**C. Procédure.**
1. Encadreur : ouvrez le détail du mémoire et l'onglet **Corrections**.
2. Choisissez exactement la version déposée au test, saisissez une remarque fictive, priorité et éventuellement page/section; ajoutez.
3. Vérifiez que la correction affiche le bon numéro/nom de version.
4. Étudiant propriétaire : marquez cette correction **corrigée**.
5. Encadreur : validez-la ou renvoyez-la à corriger.
6. Vérifiez la réponse backend et rechargez la page après chaque transition.

Routes utilisées : `GET/POST /theses/{thesis}/corrections`, `POST /theses/{thesis}/corrections/{correction}/status`.

**D. Attendu.** Transitions observées selon le contrat : `to_correct → corrected → validated`, ou retour `corrected → to_correct`.

**E. Erreurs à vérifier.** Sans version, remarque vide, page invalide, correction d'un autre mémoire, utilisateur non participant, transition non permise.

**F. Réussite.** L'identifiant `thesis_version_id` appartient au mémoire et le statut survit au rechargement.

**G. Preuves.** Capture de correction indiquant version et statut; confirmation d'association vérifiée par l'API/backend.

### IV.8 Réunions d'encadrement

**A. Objectif.** Tester consultation, création, édition et suivi des actions.

**B. Prérequis.** Étudiant ou encadreur participant à un mémoire existant; connaître les identifiants de test réels.

**C. Procédure.**
1. Ouvrez `/supervision-meetings` ou le lien depuis le détail du mémoire.
2. Créez une réunion avec l'identifiant du mémoire, date/heure, mode (ex. valeur fictive `présentiel`) et informations facultatives.
3. Vérifiez que la réunion est visible pour le participant autorisé.
4. Ouvrez le détail, modifiez agenda ou compte rendu et enregistrez.
5. Ajoutez une action avec identifiant d'assigné, description et date d'échéance.
6. Passez son statut de `pending` à `in_progress`, puis `completed`, en vérifiant la réponse du serveur.

Routes appelées : `GET /supervision-meetings`, `POST /theses/{thesis}/supervision-meetings`, `GET/PUT /supervision-meetings/{meeting}`, actions sous `/supervision-meetings/{meeting}/actions`.

**D. Attendu.** Seuls les participants ont accès; l'association au bon mémoire et à la bonne personne est vérifiée par le backend.

**E. Erreurs à vérifier.** Mémoire non accessible, date invalide, mode vide, assigné non participant, statut inconnu, erreur réseau.

**F. Réussite.** Réunion et action apparaissent après rechargement avec bon mémoire, échéance et statut.

**G. Preuves.** ID réunion/action et vue détail anonymisée.

### IV.9 Pré-soutenances

**A. Objectif.** Tester gestion des séances, passages et clôture.

**B. Prérequis.** Rôle autorisé, département et mémoire disponibles; le compte créateur devient responsable dans le formulaire actuel.

**C. Procédure.**
1. Ouvrez `/defenses/pre-sessions`; consultez les séances visibles.
2. Si autorisé, créez une séance avec département de test, lieu et date/heure future; laissez la durée à sa valeur proposée ou renseignez une durée entre 1 et 480 minutes.
3. Ouvrez le détail puis ajoutez un passage : ID mémoire existant du même département, position, date/heure et durée (1–240 minutes).
4. Vérifiez que le passage s'affiche sous la séance et sous le mémoire attendu.
5. Définissez les résultats `ready` ou `needs_revision`; vérifiez la persistance.
6. Essayez de clôturer une séance contenant un passage `pending` : le frontend doit bloquer la demande. Renseignez le résultat de tous les passages puis tentez à nouveau.
7. Testez l'annulation uniquement sur une séance de test et confirmez la boîte de dialogue.

Routes : `/pre-defense-sessions`, `/pre-defense-sessions/{session}`, `/status`, `/passages` et `/passages/{passage}`.

**D. Attendu.** Une séance terminée ne contient plus de passage pending, conformément au contrat communiqué; le backend reste l'autorité.

**E. Erreurs à vérifier.** Département non autorisé, mémoire hors département, position/date incorrecte, durée hors bornes, ressource enfant d'une autre session, clôture prématurée.

**F. Réussite.** Les passages et résultats sont persistants, liés à la bonne séance et au bon mémoire.

**G. Preuves.** Identifiants séance/passage/mémoire et captures des résultats.

### IV.10 Soutenances, jury, évaluations et résultat

**A. Objectif.** Tester le calendrier privé, la planification, l'attribution du jury, évaluations, résultat final et procès-verbal téléchargé.

**B. Prérequis.** Mémoire de test approuvé, salle disponible, membres jury test; administrateur/chef pour gestion et compte jury pour évaluation.

**C. Procédure.**
1. Ouvrez `/defenses`; naviguez dans le calendrier et testez les filtres de salle/période.
2. Ouvrez `/defenses/schedule`; choisissez un mémoire approuvé, une salle, une date/heure et une durée entre 30 et 240 minutes.
3. Planifiez une soutenance sur une date future de test.
4. Ouvrez son détail. Attribuez les membres du jury avec leurs rôles si le bouton est disponible.
5. Connectez-vous avec un compte membre du jury réellement affecté; ouvrez la soutenance puis soumettez une évaluation avec une note entre 0 et 20, verdict et remarques de test.
6. Revenez avec le rôle de gestion et vérifiez les évaluations affichées.
7. Renseignez la décision finale avec note/verdict/remarques selon les règles backend.
8. Téléchargez le procès-verbal; ouvrez-le et vérifiez date, mémoire, salle et résultat. Le téléchargement dans l'interface ne garantit pas à lui seul l'exactitude du document.
9. Testez un conflit de salle/heure sur un second dossier jetable et consignez la réponse réelle du backend.
10. Testez l'annulation uniquement sur une soutenance de test au statut autorisé et vérifiez l'effet sur le calendrier.

Routes frontend : `/defense-schedules/calendar`, `/mine`, `/defense-schedules/{id}`, création/modification, `/{id}/assign-jury`, `/{id}/cancel`, `/{id}/evaluations`, `/{id}/result` et `/{id}/report`.

**D. Attendu.** Les membres du jury voient uniquement les soutenances qui leur sont attribuées; les conflits et transitions sont contrôlés par Laravel.

**E. Erreurs à vérifier.** Mémoire non approuvé, salle déjà prise, durée hors limites, jury doublonné ou non admissible, note hors 0–20, double évaluation, soutenance annulée, rapport inaccessible.

**F. Réussite.** Planification, jury, évaluations et décision persistent; le rapport téléchargé contient les données confirmées.

**G. Preuves.** ID soutenance, réponse API anonymisée, capture des évaluations et procès-verbal expurgé.

### IV.11 Archives publiques et administratives

**A. Objectif.** Tester éligibilité et archivage administratif, recherche/consultation publique et téléchargement.

**B. Prérequis.** Administrateur ou rôle explicitement autorisé; mémoire répondant aux critères backend; ne pas archiver un vrai dossier.

**C. Procédure.**
1. En administrateur, ouvrez `/admin/archives` et recherchez l'archive ou le mémoire de test.
2. Pour un mémoire de test, lancez la vérification d'éligibilité dans le dialogue d'archivage depuis son détail.
3. Si l'API confirme l'éligibilité et le contrat de test autorise l'opération, archivez ce mémoire avec métadonnées fictives.
4. Vérifiez sa présence dans la liste d'archives administratives après rechargement.
5. Ouvrez `/archives` sans connexion, recherchez l'archive de test, ouvrez sa fiche et testez le téléchargement si proposé.
6. Vérifiez qu'un dossier non public ou sous embargo n'est pas exposé publiquement; la confidentialité doit être appliquée côté serveur.
7. Testez modification/suppression uniquement sur archive jetable et si le backend autorise ces actions.

Services connus : endpoints `/admin/archives`, `/admin/theses/{id}/archive-eligibility`, `/admin/theses/{id}/archive`, `/admin/archives/{id}`; lecture publique `/archives`, `/archives/{id}` et téléchargement.

**D. Attendu.** Une archive publique ne révèle que les champs autorisés par le backend.

**E. Erreurs à vérifier.** Mémoire inéligible, archive inexistante, accès public à une archive privée, suppression d'archive liée, téléchargement refusé.

**F. Réussite.** Éligibilité, publication et téléchargement correspondent aux décisions du serveur, sans divulgation de données privées.

**G. Preuves.** État admin, page publique déconnectée, réponse backend et contrôle du fichier téléchargé.

### IV.12 Imports CSV

**A. Objectif.** Vérifier le téléchargement du modèle, l'analyse serveur et la confirmation explicite d'import.

**B. Prérequis.** Administrateur de test, type `students` ou `jury-members`, fichier synthétique conforme au modèle et base jetable.

**C. Procédure.**
1. Ouvrez `/admin/imports`; choisissez le type et téléchargez son modèle.
2. Copiez le fichier localement et remplissez quelques lignes **fictives**, en respectant les en-têtes et leur ordre du modèle.
3. Sélectionnez le fichier et cliquez **Prévisualiser**.
4. Vérifiez compteurs et détail des lignes valides, doublons et erreurs; ne confirmez pas si les résultats sont inattendus.
5. Testez une prévisualisation avec doublon et une ligne invalide en utilisant uniquement des données jetables.
6. Pour un jeu propre, cliquez **Confirmer l'import définitif**, confirmez le dialogue, puis vérifiez dans la liste admin que seules les lignes valides prévues ont été importées.
7. Vérifiez que le serveur refuse un fichier de plus de 5 Mo ou plus de 5 000 lignes si ces limites sont celles du contrat actif.
8. Pour tester l'intégrité du hash, modifiez une copie du fichier entre prévisualisation et confirmation dans une session dédiée; le backend doit refuser un hash qui ne correspond pas. Ne faites pas ce test sur un fichier réel.

Routes : `GET /admin/imports/{type}/template`, `POST .../preview`, `POST .../confirm`. La confirmation renvoie le même fichier avec `preview_hash`.

**D. Attendu.** Aucun enregistrement définitif avant clic de confirmation explicite et validation du hash côté serveur.

**E. Erreurs à vérifier.** Type non supporté, entête manquant/mal ordonné, doublon, ligne invalide, format/taille invalide, utilisateur non admin, hash différent, serveur indisponible.

**F. Réussite.** Les résultats de prévisualisation concordent avec les lignes persistées après confirmation et les doublons ne produisent pas une seconde création.

**G. Preuves.** Modèle vierge, CSV synthétique sans donnée personnelle, preview, confirmation et liste backend post-import.

### IV.13 Profil, dashboard et espaces métier par rôle

**A. Objectif.** Vérifier que les raccourcis et listes ne mélangent pas les données d'autres utilisateurs.

**B. Prérequis.** Un compte de chaque rôle identifié et des données liées spécifiquement à chacun.

**C. Procédure.**
1. Connectez-vous successivement avec chacun des rôles disponibles.
2. Notez les actions affichées sur `/dashboard`.
3. Pour `supervisor`, ouvrez `/supervisor`; comparez les étudiants/mémoires affichés avec les affectations de test.
4. Pour `jury-member`, ouvrez `/jury`; comparez les soutenances avec les affectations de jury.
5. Pour `student`, ouvrez `/theses` et confirmez les droits de lecture/écriture sur son dossier.
6. Vérifiez qu'un autre rôle ou utilisateur ne voit pas les données privées lors d'accès autorisé au serveur.

**D. Attendu.** Les raccourcis de tableau de bord varient par rôle; la donnée métier est filtrée par API.

**E. Erreurs à vérifier.** Rôle absent/inconnu, liste vide normale, erreur de service, donnée d'un autre compte.

**F. Réussite.** Chaque rôle voit son périmètre attendu et le backend refuse les lectures non autorisées.

**G. Preuves.** Captures par rôle anonymisées et résultat backend correspondant.

---

## Partie V — Scénario de bout en bout

Ce parcours est un **scénario de test proposé**, pas un compte ni un workflow déjà présent dans la base. Les libellés `Étudiant Test SUMA`, `Encadreur Test SUMA`, `Jury Test 1/2/3` et « Gestion des documents universitaires » sont des données fictives. Préparez-les seulement en environnement isolé et attribuez-leur les IDs réellement retournés par l'API.

| Étape | Rôle qui agit | Action | État initial → état à vérifier | Intervenant suivant | Preuve |
|---:|---|---|---|---|---|
| 1 | Administrateur | Vérifier département, formation, année, comptes et données de référence | Références présentes | Étudiant | IDs de test disponibles |
| 2 | Étudiant Test SUMA | Proposer un sujet fictif « Gestion des documents universitaires », puis soumettre | Sujet absent → proposition créée puis soumise (statut serveur) | Gestion départementale | Sujet visible et statut vérifié |
| 3 | Chef/admin autorisé | Examiner la proposition, la rejeter avec motif ou l'accepter selon scénario | Soumis → décision enregistrée | Étudiant | Réponse et statut après rechargement |
| 4 | Administrateur/chef autorisé | Publier un sujet pour le département, si le cas testé l'exige | Non publié → publié | Étudiant | Sujet public visible selon les règles |
| 5 | Étudiant | Choisir le sujet publié, si autorisé; créer séparément le mémoire si requis | Sujet publié → sélection confirmée; création mémoire séparée | Gestion | IDs de sujet et mémoire; ne pas supposer création automatique |
| 6 | Étudiant | Créer un mémoire avec département, programme et année; déposer une version de test | Pas de mémoire → brouillon avec version 1 | Chef/encadreur | ID mémoire/version et fichier |
| 7 | Étudiant | Soumettre le mémoire | Brouillon → statut reçu de l'API | Chef de département | Historique de statut |
| 8 | Chef/admin autorisé | Examiner, effectuer les transitions proposées, affecter Encadreur Test SUMA | En examen → statut approprié; encadreur associé | Encadreur | Détail après rechargement |
| 9 | Encadreur | Ajouter une correction liée à la version 1 | Pas de correction → `to_correct` | Étudiant | Correction et version correspondante |
| 10 | Étudiant | Déposer la version corrigée, puis marquer la correction comme corrigée | `to_correct` → `corrected` | Encadreur | Nouvelle version et correction |
| 11 | Encadreur | Valider ou renvoyer la correction selon le résultat | `corrected` → `validated` ou `to_correct` | Étudiant/encadreur | Transition confirmée par Laravel |
| 12 | Étudiant + encadreur | Planifier réunion et clôturer les actions de suivi | Réunion absente → planifiée; actions `pending` → terminées | Responsable de séance | Réunion/actions associées au bon mémoire |
| 13 | Responsable autorisé | Créer la pré-séance et ajouter le mémoire comme passage | Séance/passage absents → passage avec résultat | Encadreur/gestion | ID séance/passage, résultat |
| 14 | Gestion | Vérifier éligibilité à la soutenance, choisir une salle et planifier | Mémoire approuvé → soutenance planifiée (si API l'autorise) | Jury | Détail et créneau persistants |
| 15 | Gestion | Attribuer Jury Test 1/2/3 | Jury vide → membres assignés | Membres du jury | Composition visible sur le détail |
| 16 | Chaque membre assigné | Soumettre son évaluation | Évaluation absente → évaluation enregistrée | Gestion | Résultats distincts pour chaque membre |
| 17 | Gestion | Enregistrer la décision finale et télécharger le procès-verbal | Soutenance planifiée → résultat selon transitions serveur | Administrateur | Résultat exact et document lisible |
| 18 | Gestion | Vérifier l'éligibilité puis archiver si autorisé | Non archivé → archive créée | Public | Archive dans liste admin |
| 19 | Visiteur déconnecté | Rechercher et ouvrir l'archive / calendrier public | Ressource privée → ne doit pas être exposée; ressource publique → visible | Aucun | Page publique et réponse sans données privées |

### Points d'arrêt du scénario

- La sélection d'un sujet n'est pas documentée comme créant automatiquement un mémoire. Vérifiez le lien avec Laravel; si l'API ne crée pas ce lien, le scénario s'arrête là et le manque est consigné.
- Le statut et les transitions effectifs du mémoire, les conditions d'approbation, les critères d'archivage et les prérequis de soutenance dépendent du contrat backend.
- Si un endpoint est absent, renvoie une erreur non documentée ou ne permet pas le passage, marquez l'étape **Bloquée**. Ne changez pas manuellement la base pour contourner le workflow.

---

## Partie VI — Autorisations et sécurité

Exécutez ces contrôles uniquement dans une instance de test explicitement autorisée, avec des comptes et données jetables.

1. Avec un utilisateur déconnecté, ouvrez directement `/students`, `/admin`, `/jury`, `/supervisor`, `/subjects` et `/profile`; notez la réponse frontend.
2. Avec un étudiant, tentez d'ouvrir `/admin/imports`, `/students` et un mémoire dont il n'est pas propriétaire.
3. Avec un administrateur, vérifiez les pages protégées par rôle, sans supposer qu'une permission Angular équivaut à la politique serveur.
4. Avec un encadreur, demandez une réunion ou une correction sur un mémoire qui ne lui est pas attribué.
5. Avec un membre de jury, tentez d'accéder à une soutenance à laquelle il n'est pas assigné.
6. Pour chaque refus UI, demandez à l'équipe backend de tester la même permission sur l'endpoint documenté à l'aide d'outils de test autorisés. Vérifiez une réponse de refus et l'absence de modification en base.
7. Vérifiez les tentatives de lecture d'un enfant rattaché à un autre parent : correction d'un autre mémoire, passage d'une autre séance, action d'une autre réunion.
8. Vérifiez qu'aucune information privée n'est rendue publique par les endpoints d'archives ou de calendrier.

Ne testez pas de charge, ne lancez pas de scans, et ne modifiez pas de données hors de l'environnement autorisé. Les guards et masquages de boutons Angular ne sont pas une protection d'accès serveur.

---

## Partie VII — Fonctions intelligentes

Dans les pages, routes et services frontend inspectés, aucune interface ou API dédiée n'a été identifiée pour les trois fonctions intelligentes ci-dessous.

| Fonction | État dans le frontend inspecté | Ce qui manque pour la tester |
|---|---|---|
| Similarité des sujets | Absente / non démontrée | Page ou service de comparaison, endpoint, définition des scores et jeu d'essai backend |
| Suggestion d'encadreur | Absente / non démontrée | Fonction de recommandation, critères/algorithme, endpoint et données de charge/spécialité |
| Planification automatique | Absente / non démontrée | Algorithme de créneaux, contraintes de salle/jury et endpoint; le formulaire actuel planifie une date/salle choisie manuellement |

Les listes de salles, encadreurs et jury sont des lookups, pas une preuve d'algorithme de recommandation ou d'affectation automatique. Aucun score ne doit être inventé ou interprété.

---

## Partie VIII — Notifications, PDF et archives

### Notifications

Aucun centre de notifications ni service de notification n'a été identifié dans le frontend inspecté. Il n'est donc pas possible de tester le compteur non lu, le marquage comme lu, les rappels J-3/J-1 ou le scheduler depuis ce dépôt. La présence éventuelle d'une table ou migration Laravel ne prouve pas l'existence d'une interface ou d'une route utilisable.

### PDF et procès-verbal

Le détail d'une soutenance propose le téléchargement du rapport via `/defense-schedules/{id}/report`. Pour le tester, utilisez le cas **IV.10**. Vérifiez le code de réponse, le type/fichier téléchargé et son contenu contre la soutenance et le résultat persistés. Le frontend ne montre pas de vérification QR identifiée. La génération PDF, son modèle et les données proviennent du backend, qui n'a pas été inspecté ici.

### Archives

La partie frontend comporte une bibliothèque publique (`/archives`) avec liste, détail et téléchargement, et un espace admin pour vérification d'éligibilité, archivage et gestion. Testez impérativement le parcours **IV.11** en environnement de test. L'embargo et les permissions de lecture/téléchargement doivent être garantis par Laravel, non par un simple masquage visuel.

---

## Partie IX — Tests automatisés

Exécutez ces commandes depuis la racine du frontend (`GestionMemoiresFrontend`) après installation des dépendances.

| Vérification | Commande | Résultat attendu / portée |
|---|---|---|
| Compilation Angular | `npm run build` | Code compilé dans `dist/gestion-memoires-frontend`; un avertissement de budget initial peut apparaître. |
| Tests unitaires frontend | `npm test -- --watch=false` | Exécution Karma avec ChromeHeadless puis fin de commande. Un échec doit être corrigé ou documenté. |
| Vérification TypeScript des tests | `npx tsc --noEmit -p tsconfig.spec.json` | Pas d'erreur TypeScript dans le périmètre du tsconfig de tests. |

Les tests présents sont `app.component.spec.ts`, `token-storage.service.spec.ts`, `auth.service.spec.ts`, `thesis-detail.component.spec.ts` et `backend-contracts.service.spec.ts`. Ils vérifient notamment les services HTTP à l'aide de réponses simulées par les tests; ils ne contactent pas un backend Laravel et ne prouvent pas l'intégration en production.

La dernière exécution observée pendant la préparation de ce guide avait **14 tests réussis**, build réussi avec avertissement budget, et vérification TypeScript réussie. Rejouez les commandes dans votre environnement avant de déclarer un résultat actuel.

Aucun outil ni script e2e n'est configuré dans `package.json`/`angular.json`. N'utilisez pas `ng e2e` en supposant qu'une suite existe. Aucun test backend, test d'intégration réel avec Laravel ou test de base de données n'est disponible dans ce dépôt.

### Lire un échec

- `ChromeHeadless` absent ou non démarré : vérifiez l'installation/configuration du navigateur et l'erreur Karma.
- `Expected one matching request` : comparez l'URL/méthode attendue dans le test et celles reçues; c'est souvent une assertion de test Angular.
- `ERROR` Angular avec un chemin et une ligne : ouvrez le fichier signalé et le template du composant.
- `npm run build` échoue : relevez le premier diagnostic TypeScript/template; ne vous arrêtez pas au seul avertissement budget.
- Échec sur appel HTTP réel : notez code et message; confirmez la route, la validation, CORS et les logs côté backend.

---

## Partie X — Fiches de suivi

### X.1 Checklist d'exécution

Statuts autorisés : **Non testé**, **Réussi**, **Échoué**, **Bloqué**, **Non applicable**.

| N° | Module | Scénario | Rôle utilisé | Résultat attendu | Résultat obtenu | Statut | Preuve | Anomalie |
|---:|---|---|---|---|---|---|---|---|
| 1 | Environnement | Frontend/API démarrés | — | Pages servies et API joignable |  | Non testé |  |  |
| 2 | Authentification | Connexion/déconnexion | Étudiant | Session créée puis supprimée |  | Non testé |  |  |
| 3 | Profil | Modification champ/avatar | Étudiant | Valeur persistée |  | Non testé |  |  |
| 4 | Référentiels | Consultations | Administrateur | Options cohérentes |  | Non testé |  |  |
| 5 | Étudiants | Créer/modifier dossier QA | Administrateur | Dossier persistant |  | Non testé |  |  |
| 6 | Sujets | Proposer/soumettre/examiner | Étudiant + chef | Statut vérifié côté API |  | Non testé |  |  |
| 7 | Mémoire | Créer/soumettre/déposer version | Étudiant | Mémoire et version persistants |  | Non testé |  |  |
| 8 | Encadrement | Affecter encadreur/commenter | Chef + encadreur | Relation correcte |  | Non testé |  |  |
| 9 | Corrections | Créer/valider transition | Encadreur + étudiant | Version correcte et statut attendu |  | Non testé |  |  |
| 10 | Réunions | Créer action et la terminer | Participant | Réunion/action liées au mémoire |  | Non testé |  |  |
| 11 | Pré-soutenance | Créer séance/passage/clôturer | Responsable | Passage et statut persistants |  | Non testé |  |  |
| 12 | Soutenance | Planifier/attribuer jury | Gestion | Créneau/jury persistants |  | Non testé |  |  |
| 13 | Évaluation | Évaluer et saisir résultat | Jury + gestion | Notes/verdict vérifiés |  | Non testé |  |  |
| 14 | Procès-verbal | Télécharger et comparer PDF | Gestion | Fichier lisible et exact |  | Non testé |  |  |
| 15 | Archives | Archiver puis consulter public | Admin + visiteur | Accès/publication corrects |  | Non testé |  |  |
| 16 | Import CSV | Preview puis confirmation | Administrateur | Seulement les lignes confirmées sont importées |  | Non testé |  |  |
| 17 | Sécurité | Ressource d'un autre compte | Tous rôles concernés | Refus par Laravel, aucune fuite |  | Non testé |  |  |
| 18 | Tests frontend | Build/unit tests/types | Développeur | Commandes terminent sans erreur |  | Non testé |  |  |

Ajoutez des lignes si votre déploiement comprend d'autres fonctionnalités vérifiées. Utilisez « Non applicable » pour un test explicitement hors périmètre, et « Bloqué » lorsqu'un prérequis manque.

### X.2 Fiche de suivi d'anomalie

Copiez cette fiche pour chaque problème :

| Champ | Détail |
|---|---|
| Identifiant | QA-AAAA-NNN |
| Description |  |
| Environnement / build |  |
| Étapes de reproduction | 1.  2.  3. |
| Rôle et données de test |  |
| Résultat attendu |  |
| Résultat obtenu |  |
| Gravité | Bloquante / Haute / Moyenne / Faible |
| Fichiers potentiellement concernés |  |
| Code HTTP / message (sans secret) |  |
| Preuve |  |
| État de correction | Ouverte / En cours / Corrigée / Non reproduite |
| Résultat du nouveau test |  |

---

## Partie XI — Diagnostic des problèmes courants

Les causes ci-dessous sont des pistes, pas des diagnostics confirmés. Vérifiez les journaux côté serveur avec les responsables de l'environnement.

| Symptôme | Causes possibles compatibles | Vérifications sûres |
|---|---|---|
| Frontend inaccessible | `npm ci` incomplet, mauvais dossier, port occupé, erreur de compilation | Terminal `npm start`; `npm run build`; ouvrir `http://localhost:4200/`; lire le premier message d'erreur. |
| Backend inaccessible | Laravel arrêté, mauvaise `apiUrl`, port/adresse différente | Vérifier `src/environments/environment.ts`, serveur backend et réponse d'une route documentée. Ne pas inventer d'endpoint ping. |
| Erreur CORS | Origine Angular absente de la configuration CORS Laravel | Examiner l'onglet Network/Console et faire vérifier la config CORS côté backend; ne pas désactiver la sécurité du navigateur. |
| `401` | Session expirée/absente, authentification non jointe ou rejetée | Se reconnecter; vérifier la requête sans exposer son token; confirmer le middleware et le mécanisme d'auth backend. |
| `403` | Rôle ou relation non autorisés | Confirmer le compte, le rôle, le département et l'affectation; vérifier policy Laravel. Ne contournez pas le contrôle. |
| `404` | ID absent, route backend différente, enfant appartenant à une autre ressource ou ressource volontairement masquée | Vérifier l'ID de test, le contrat de routes et les journaux backend. |
| `419` | Non identifié comme comportement attendu par le client API observé; peut dépendre de la configuration session/CSRF Laravel | Vérifier la réponse Laravel, les cookies, le mode d'authentification réellement configuré et CORS. Ne supposez pas Sanctum sans confirmation. |
| `422` | Validation serveur, champ manquant, format, transition ou relation invalide | Lire `message` et `errors` renvoyés; corriger les données du test; confirmer les Form Requests côté backend. |
| `500` | Exception backend, base inaccessible, données ou service externe en erreur | Transmettre l'heure, route et identifiant QA à l'équipe backend; consulter ses logs. Ne pas relancer en boucle une opération destructive. |
| Erreur base de données | Configuration de connexion invalide, service DB arrêté, schéma/migration incorrects | À vérifier exclusivement dans le projet backend et ses logs; moteur, nom DB et commandes ne sont pas présents dans ce dépôt. |
| Authentification/Sanctum | Le frontend stocke une session côté navigateur; le mécanisme précis et la configuration Sanctum du backend ne peuvent pas être confirmés ici | Comparer les requêtes/authentification attendues au contrat backend, inspecter les en-têtes sans publier les secrets et faire vérifier les middlewares Laravel. |
| Téléversement refusé | Extension/MIME/taille, limite serveur, validation du formulaire ou proxy | Tester un fichier synthétique permis; lire la réponse `422`/`413` si présente; comparer les limites frontend et backend. L'avatar frontend est limité à 2 Mo; autres limites sont à vérifier. |
| Import sans résultat ou lignes en erreur | En-têtes CSV non conformes, mauvais type, doublons, hash différent ou permissions | Retélécharger le modèle; examiner la prévisualisation serveur; ne confirmer qu'après vérification. |
| Notification absente | Aucune interface/service de notification identifié dans ce frontend | Vérifier si le backend fournit effectivement routes, scheduler et événements; cette fonction ne peut pas être validée depuis ce dépôt seul. |
| PDF/rapport échoue | Endpoint indisponible, autorisation, génération backend, données manquantes | Vérifier l'appel `/defense-schedules/{id}/report`, son statut et les logs Laravel; comparer le fichier au résultat persisté. |
| Migrations | Backend non inspecté; schéma manquant ou migration non appliquée possible | Ne lancez aucune migration depuis le dossier frontend. Demandez au responsable backend la procédure d'environnement de test. |
| Tests Karma échouent | ChromeHeadless, configuration Karma ou assertion/test | Lancer `npm test -- --watch=false`; lire le premier test en échec et le fichier spec; distinguer problème de navigateur et échec d'assertion. |
| Avertissement de budget Angular | Bundle initial supérieur au seuil d'avertissement de `angular.json` | Le build peut réussir avec cet avertissement; vérifier le code de sortie et distinguer avertissement/erreur. Ne changez pas le budget uniquement pour cacher le signal. |

---

## Limites et informations manquantes

Pour compléter les tests réellement intégrés, il faut disposer d'un accès autorisé aux éléments suivants :

1. Le dépôt backend ou son guide d'installation, ses routes, contrôleurs, Form Requests, policies, modèles, migrations, seeders et tests.
2. Le moteur de base de données, sa configuration locale et la méthode officielle pour initialiser une base jetable.
3. L'URL locale réelle de Laravel, la configuration CORS, la configuration d'authentification (Sanctum ou autre) et les comptes de test prévus.
4. Les règles exactes des transitions de mémoires, sujets, corrections, pré-séances, soutenances et archives.
5. Les réponses réelles des endpoints, les limites de téléversement/CSV et les formats d'erreurs observés.
6. La confirmation de l'URL de production.

Non démontrés par le frontend actuellement accessible : similarité, recommandations automatiques, planification automatique, centre/rappels de notifications, journal d'audit, QR code et tests e2e. N'en concluez pas qu'ils n'existent pas dans Laravel; ils ne sont simplement pas vérifiables dans ce dépôt.

### Pour commencer

1. Préparez une base de test et les cinq rôles de test selon la procédure du backend.
2. Démarrez Laravel et Angular, puis confirmez la communication à l'aide de l'onglet Network.
3. Exécutez les tests unitaires de la Partie IX.
4. Commencez la checklist par **authentification/profil**, puis créez un dossier étudiant fictif et suivez le scénario de bout en bout de la Partie V, en marquant immédiatement toute étape bloquée.

