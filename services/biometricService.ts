
/**
 * Biometric Service - Monarch OS
 * Handles WebAuthn (Passkeys) for secure neural node access.
 */

export const isBiometricsAvailable = (): boolean => {
  return !!(window.PublicKeyCredential && 
            window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable);
};

export const registerBiometrics = async (userId: string, userName: string): Promise<string | null> => {
  if (!isBiometricsAvailable()) return null;

  try {
    const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    if (!isAvailable) {
      console.warn("Platform authenticator not available.");
      return null;
    }

    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const userIdBytes = new TextEncoder().encode(userId);

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: {
        name: "Monarch OS",
        id: window.location.hostname || "localhost",
      },
      user: {
        id: userIdBytes,
        name: userName,
        displayName: userName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" }, 
        { alg: -257, type: "public-key" }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
      attestation: "none",
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    }) as PublicKeyCredential;

    if (!credential) return null;

    return btoa(String.fromCharCode(...new Uint8Array(credential.rawId)));
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      console.error("Biometric registration denied by user or policy:", err.message);
    } else if (err.name === 'SecurityError') {
      console.error("Biometric registration blocked by Permissions Policy:", err.message);
    } else {
      console.error("Biometric registration failed:", err);
    }
    return null;
  }
};

export const authenticateBiometrically = async (): Promise<boolean> => {
  if (!isBiometricsAvailable()) return false;

  try {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      allowCredentials: [], // Browser will look for credentials linked to this RP
      userVerification: "required",
      timeout: 60000,
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    return !!assertion;
  } catch (err: any) {
    if (err.name === 'NotAllowedError') {
      console.error("Biometric authentication denied by user or policy:", err.message);
    } else if (err.name === 'SecurityError') {
      console.error("Biometric authentication blocked by Permissions Policy:", err.message);
    } else {
      console.error("Biometric authentication failed:", err);
    }
    return false;
  }
};
