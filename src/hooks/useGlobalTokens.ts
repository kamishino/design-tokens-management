import { useState, useEffect } from 'react';
import { getDynamicTokenFiles } from '../utils/fs-scanner';
import { parseTokensToDocs } from '../utils/token-parser';
import { enrichTokensWithLineage } from '../utils/token-graph';
import type { TokenDoc } from '../utils/token-parser';

export const useGlobalTokens = () => {
  const [globalTokens, setGlobalTokens] = useState<TokenDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Dynamically discover all token files
        const allFiles = getDynamicTokenFiles().filter(f => f.path.includes('/global/'));

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

        // Enrich with graph relationships and deep resolution
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
