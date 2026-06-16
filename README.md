# IT BUSINESS - Gestion de Réparations

Système complet de gestion des commandes et demandes de réparation des clients. 
Application Web professionnelle construite avec **Next.js 15, Prisma, PostgreSQL, et Tailwind CSS**.

## Lancer le projet

1. **Installer les dépendances**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configurer la base de données PostgreSQL**
   Assurez-vous d'avoir une instance PostgreSQL (ex: Vercel Postgres, Supabase, Neon).
   Renommez \`.env.example\` en \`.env\` et modifiez la variable \`DATABASE_URL\` :
   \`\`\`env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   AUTH_SECRET="une_chaine_de_caracteres_secrete_123456"
   \`\`\`

3. **Initialiser la Base de données**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   \`\`\`
   *(Cette commande appliquera le schéma à votre base de données et va insérer l'administrateur par défaut)*

4. **Lancer le serveur de développement**
   \`\`\`bash
   npm run dev
   \`\`\`

## Connexion par défaut
- **Email:** admin@itbusiness.com
- **Mot de passe:** password123

## Déploiement sur Vercel

1. Poussez votre code sur GitHub.
2. Créez un nouveau projet sur Vercel et importez le dépôt.
3. Allez dans l'onglet **Storage** sur Vercel, et créez une base de données **Postgres**. Cela liera automatiquement et injectera les variables d'environnement (`POSTGRES_URL`, etc.). 
4. Assurez-vous de définir le `DATABASE_URL` pour qu'il corresponde à l'environnement Postgres fourni.
5. Définissez la variable d'environnement `AUTH_SECRET` dans les "Environment Variables".
6. Définissez la commande de build dans Vercel : \`npx prisma generate && npx prisma db push && next build\` (si vous n'utilisez pas de système de migrations avancé).
7. Cliquez sur Deploy.

## Organisation du projet
- **/app**: Pages Next.js App Router et API Routes (REST)
- **/components**: Composants réutilisables d'UI (librairie shadcn)
- **/prisma**: Schéma de la base de données PostgreSQL et script de seeding
- **/lib**: Utilitaires, db client, configurations d'authentification

## Sécurité intégrée
- Hashage des mots de passe: \`bcryptjs\`
- Validation rigoureuse côté serveur: \`Zod\`
- Authentification protégée par sessions JWT HTTP-only: \`next-auth\`
- Protection contre CSRF/XSS gérée nativement par le framework Next.js et React.
