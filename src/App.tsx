import { useEffect, useState } from 'react'
import { FirebaseError } from 'firebase/app'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import { auth } from './firebase'

function signInErrorMessage(error: unknown) {
  const code = error instanceof FirebaseError ? error.code : undefined

  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'The sign-in window was closed. Try again when you’re ready.'
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.'
    case 'auth/unauthorized-domain':
      return 'This site’s hostname needs to be added to Firebase Authentication’s authorized domains.'
    case 'auth/operation-not-allowed':
      return 'Enable the Google provider in Firebase Authentication to sign in.'
    case 'auth/network-request-failed':
      return 'Check your internet connection and try again.'
    default:
      return code ? `Could not sign in with Google (${code}).` : 'Could not sign in with Google. Try again.'
  }
}

function GoogleSignIn({ auth }: { auth: Auth }) {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => onAuthStateChanged(auth, setUser), [auth])

  async function changeSession() {
    setPending(true)
    setError('')

    try {
      if (user) {
        await signOut(auth)
      } else {
        await signInWithPopup(auth, new GoogleAuthProvider())
      }
    } catch (error) {
      setError(user ? 'Could not sign out. Try again.' : signInErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  if (user === undefined) {
    return <p role="status">Checking your sign-in status…</p>
  }

  const action = user ? 'Sign out' : 'Sign in with Google'

  return (
    <>
      {user && <p>Signed in as {user.email ?? user.displayName ?? 'a Google user'}.</p>}
      <button type="button" disabled={pending} onClick={changeSession}>{action}</button>
      {pending && <p role="status">{user ? 'Signing out…' : 'Signing in…'}</p>}
      {error && <p role="alert">{error}</p>}
    </>
  )
}

function App() {
  return (
    <main>
      <h1>Apartment</h1>
      <p>Household utility meter tracker</p>
      {auth ? (
        <GoogleSignIn auth={auth} />
      ) : (
        <p role="status">Add your Firebase Web App configuration to <code>.env.local</code> to enable sign-in.</p>
      )}
    </main>
  )
}

export default App
