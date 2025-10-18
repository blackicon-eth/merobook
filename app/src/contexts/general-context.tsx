import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useCalimero } from '@calimero-network/calimero-client';
import { AbiClient, User } from '@/api/AbiClient';
import { createKvClient } from '@/features/kv/api';

interface CurrentContext {
  applicationId: string;
  contextId: string;
  nodeUrl: string;
}

interface GeneralContextType {
  currentUser: User | null;
  currentPublicKey: string | null;
  isLoadingUser: boolean;
  refreshUser: () => Promise<void>;
  checkUserRegistered: () => Promise<boolean>;
  currentContext: CurrentContext | null;
  api: AbiClient | null;
}

const GeneralContext = createContext<GeneralContextType | undefined>(undefined);

export function GeneralContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, isAuthenticated, appUrl } = useCalimero();
  const [api, setApi] = useState<AbiClient | null>(null);
  const [currentContext, setCurrentContext] = useState<CurrentContext | null>(
    null,
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPublicKey, setCurrentPublicKey] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!app || !isAuthenticated) {
      setCurrentUser(null);
      setCurrentPublicKey(null);
      setIsLoadingUser(false);
      return;
    }

    setIsLoadingUser(true);
    try {
      // Get the current context and public key
      const contexts = await app.fetchContexts();
      if (contexts.length === 0) {
        console.log('No contexts found');
        setIsLoadingUser(false);
        return;
      }

      const context = contexts[0];
      const publicKey = context.executorId;

      setCurrentContext({
        applicationId: context.applicationId,
        contextId: context.contextId,
        nodeUrl: appUrl || 'http://node1.127.0.0.1.nip.io',
      });

      setCurrentPublicKey(publicKey);

      // Try to get user by public key
      const api = await createKvClient(app);
      setApi(api);

      try {
        const user = await api.getUserByPublicKey({ public_key: publicKey });
        setCurrentUser(user);
      } catch (error) {
        console.log('User not registered yet:', error);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    } finally {
      setIsLoadingUser(false);
    }
  }, [app, isAuthenticated, appUrl]);

  const checkUserRegistered = useCallback(async (): Promise<boolean> => {
    if (!app || !currentPublicKey) return false;

    try {
      const api = await createKvClient(app);
      const isRegistered = await api.checkPublicKeyRegistered({
        public_key: currentPublicKey,
      });
      return isRegistered;
    } catch (error) {
      console.error('Error checking user registration:', error);
      return false;
    }
  }, [app, currentPublicKey]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <GeneralContext.Provider
      value={{
        currentUser,
        currentPublicKey,
        isLoadingUser,
        refreshUser,
        checkUserRegistered,
        currentContext,
        api,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
}

export function useGeneralContext() {
  const context = useContext(GeneralContext);
  if (context === undefined) {
    throw new Error(
      'useGeneralContext must be used within a GeneralContextProvider',
    );
  }
  return context;
}
