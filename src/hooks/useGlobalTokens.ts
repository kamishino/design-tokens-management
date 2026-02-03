import { useState, useEffect } from 'react';
import { BASE_TOKEN_FILES } from '../constants/base-tokens';
import { parseTokensToDocs } from '../utils/token-parser';
import type { TokenDoc } from '../utils/token-parser';

export const useGlobalTokens = () => {
  const [globalTokens, setGlobalTokens] = useState<TokenDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const promises = BASE_TOKEN_FILES.map(file => 
          fetch(`/tokens/global/base/${file}.json`)
            .then(res => res.json())
            .then(json => ({ json, filename: `${file}.json` }))
        );
        
        const results = await Promise.all(promises);
        let aggregated: TokenDoc[] = [];
        
        results.forEach(({ json, filename }) => {
          aggregated = aggregated.concat(parseTokensToDocs(json, [], filename));
        });

        setGlobalTokens(aggregated);
      } catch (e) {
        console.error('Failed to fetch global tokens', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  return { globalTokens, loading };
};
