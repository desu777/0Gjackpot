import { useState, useEffect } from 'react';
import { createWalletClient, http, custom, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { JACKPOT_ABI } from '../config/contractConfig';
import { getContractAddresses, getChainConfig } from '../config/envConfig';

export const useAdminWallet = () => {
  const [adminWallet, setAdminWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Get contract addresses and chain config
  const { jackpotContract: jackpotAddress } = getContractAddresses();
  const chainConfig = getChainConfig();
  
  // Initialize admin wallet once
  useEffect(() => {
    let isMounted = true;
    
    const initializeWallet = async () => {
      // Prevent multiple initializations
      if (isInitialized || adminWallet) return;
      
      try {
        // Get admin private key from environment variables
        const adminPrivateKey = process.env.REACT_APP_ADMIN_PRIVATE_KEY;
        
        if (!adminPrivateKey) {
          console.error('Admin private key not found in environment variables! Automatic round completion will not work!');
          if (isMounted) {
            setError('Admin private key not configured');
            setIsLoading(false);
            setIsInitialized(true);
          }
          return;
        }
        
        // Create account from private key
        const account = privateKeyToAccount(`0x${adminPrivateKey.replace(/^0x/, '')}`);
        
        // Create wallet client
        const client = createWalletClient({
          account,
          chain: {
            id: chainConfig.chainId,
            name: chainConfig.chainName,
            rpcUrls: { default: { http: [chainConfig.rpcUrl] } }
          },
          transport: http()
        });
        
        if (isMounted) {
          setAdminWallet({ client, account });
          setIsLoading(false);
          setIsInitialized(true);
          console.log('Admin wallet initialized successfully:', account.address);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error initializing admin wallet:', err);
          setError(err.message);
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };
    
    if (!isInitialized && isLoading) {
      initializeWallet();
    }
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - initialize only once
  
  // Function to complete round with admin wallet
  const completeRoundWithAdmin = async () => {
    if (!adminWallet || !jackpotAddress) {
      console.error('Admin wallet or contract address not initialized');
      return { success: false, error: 'Admin wallet not initialized' };
    }
    
    try {
      const { client, account } = adminWallet;
      
      console.log('Attempting to complete round with admin wallet:', account.address);
      
      // Send transaction to complete round
      const hash = await client.writeContract({
        address: jackpotAddress,
        abi: JACKPOT_ABI,
        functionName: 'completeRound',
        account
      });
      
      console.log('Round completed by admin wallet, tx hash:', hash);
      
      return { success: true, txHash: hash };
    } catch (err) {
      console.error('Error completing round with admin wallet:', err);
      return { success: false, error: err.message };
    }
  };
  
  return {
    adminWallet,
    isLoading,
    error,
    isInitialized,
    completeRoundWithAdmin
  };
}; 