import { useState, useEffect } from 'react';
import { BASE_TOKEN_FILES } from '../constants/base-tokens';
import { parseTokensToDocs } from '../utils/token-parser';
import { enrichTokensWithLineage } from '../utils/token-graph';
import type { TokenDoc } from '../utils/token-parser';

export const useGlobalTokens = () => {
  const [globalTokens, setGlobalTokens] = useState<TokenDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Fetch Base + Alias (We need both for full lineage)
        const allFiles = [
          ...BASE_TOKEN_FILES.map(f => ({ path: `/tokens/global/base/${f}.json`, name: `${f}.json` })),
          { path: '/tokens/global/alias/colors.json', name: 'colors.json' },
          { path: '/tokens/global/alias/typography.json', name: 'typography.json' }
        ];

        const promises = allFiles.map(file => 
          fetch(file.path)
            .then(res => res.json())
            .then(json => ({ json, filename: file.name }))
        );
        
        const results = await Promise.all(promises);
        let aggregated: TokenDoc[] = [];
        
        results.forEach(({ json, filename }) => {
          aggregated = aggregated.concat(parseTokensToDocs(json, [], filename));
        });

        // Task 1.2: Enrich with graph relationships
        const enriched = enrichTokensWithLineage(aggregated);

        setGlobalTokens(enriched);
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