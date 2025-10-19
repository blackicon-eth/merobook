import { USDC_ADDRESS } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import {
  type Address,
  createPublicClient,
  erc20Abi,
  formatUnits,
  http,
} from 'viem';
import { base } from 'viem/chains';

// Create a public client for Base chain
const baseClient = createPublicClient({
  chain: base,
  transport: http(),
});

type UseUsdcBalanceProps = {
  address?: Address;
  enabled?: boolean;
};

export const useUsdcBalance = ({
  address,
  enabled = true,
}: UseUsdcBalanceProps) => {
  const {
    data: balance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['usdcBalance', address],
    enabled: enabled && !!address,
    staleTime: 30_000, // 30 seconds
    refetchInterval: 60_000, // Refetch every minute
    queryFn: async (): Promise<{
      raw: bigint;
      formatted: string;
      decimals: number;
    }> => {
      if (!address) {
        throw new Error('Address is required');
      }

      try {
        const rawBalance = await baseClient.readContract({
          address: USDC_ADDRESS as Address,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [address],
        });

        const decimals = 6; // USDC has 6 decimals
        const formatted = formatUnits(rawBalance, decimals);

        return {
          raw: rawBalance,
          formatted,
          decimals,
        };
      } catch (error1) {
        console.error('Error fetching USDC balance:', error1);
        throw error1;
      }
    },
  });

  return {
    balance,
    isLoading,
    error,
  };
};
