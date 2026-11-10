# Apartment

Apartment tracks household utility meter readings. The current stage provides Google sign-in and sign-out.

## Run locally

From this directory, run:

```sh
npm install
cp .env.example .env.local
```

In Firebase Console, select **Apartment** (`apartment-e2c69`) and open **Project settings → General → Your apps → SDK setup and configuration → Config**. Copy the registered Web App's values into `.env.local` using the mapping below.

| Vite variable | Firebase Web App field |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` |
| `VITE_FIREBASE_APP_ID` | `appId` |

The browser bundle includes these public configuration values. Keep service-account keys and Admin SDK credentials outside the frontend.

In **Authentication → Sign-in method**, verify that **Google** is enabled. If needed, enable it, select the requested project support email, and save. In **Authentication → Settings → Authorized domains**, add `localhost` if absent for local testing. When deploying to GitHub Pages, add the Pages hostname (such as `owner.github.io`) without the repository path.

Run `npm run dev` and open the localhost URL shown by Vite. Sign in, reload to confirm the session is restored, then sign out. Run `npm run lint` and `npm run build` to check the code.

[Firebase Web SDK setup](https://firebase.google.com/docs/web/setup) · [Google sign-in](https://firebase.google.com/docs/auth/web/google-signin)

## Before connecting Firestore

1. In **Firestore Database → Data**, verify the exact path `households/apartment`. If only `Hausholds` exists, inspect its contents before creating the canonical document or planning a migration.
2. Review the active rules in **Firestore Database → Rules**. Use a deny-all policy until the household rules are ready, and remove any broad test-mode or authenticated-user grants.
3. Have both intended members sign in once. In **Authentication → Users**, verify their Google accounts and copy their Firebase UIDs. As an administrator, create exactly one membership document per UID at `households/apartment/members/{firebaseUid}` using the Firebase Console. Use the UID as the document ID. When membership is based on document existence, removing that document revokes membership.
4. Grant access through explicit path-specific rules. Require authentication and check for a membership document at the requested household using `request.auth.uid`. Deny all client writes to membership documents. Restrict meter and reading writes to authorized members, validate required and allowed fields and types, and bind reading attribution to the signed-in UID. Preserve the creator and creation timestamp on updates, and verify that a referenced meter belongs to the same household.
5. Test both member and nonmember access, unauthenticated access, and attempted client membership writes before connecting the frontend. A successful Google login establishes identity. The Firestore rules determine household access.

[Firestore rule conditions](https://firebase.google.com/docs/firestore/security/rules-conditions)
