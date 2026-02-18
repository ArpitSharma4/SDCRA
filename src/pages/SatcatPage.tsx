import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Copy, Search, Database, ArrowLeft, ArrowRight } from 'lucide-react';

interface Satellite {
  OBJECT_NAME: string;
  NORAD_CAT_ID: string;
  INTLDES?: string;
  OBJECT_TYPE?: string;
}

const SatcatPage = () => {
  const [satellites, setSatellites] = useState<Satellite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const itemsPerPage = 50;

  useEffect(() => {
    const fetchSatellites = async () => {
      try {
        setLoading(true);
        console.log('Fetching satellite data...');
        const response = await fetch(`https://corsproxy.io/?${encodeURIComponent('https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json')}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API Response type:', typeof data);
        console.log('API Response:', data);
        console.log('Is array?', Array.isArray(data));
        console.log('Response length:', data?.length);
        
        if (data && Array.isArray(data)) {
          console.log('First item structure:', data[0]);
          setSatellites(data);
        } else {
          console.error('Unexpected data format:', data);
          setSatellites([]);
        }
      } catch (error) {
        console.error('Failed to fetch satellite data:', error);
        setSatellites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSatellites();
  }, []);

  const filteredSatellites = useMemo(() => {
    if (!searchTerm) return satellites;
    
    const term = searchTerm.toLowerCase();
    console.log('Searching for:', term);
    console.log('Total satellites:', satellites.length);
    
    const filtered = satellites.filter(sat => {
      const nameMatch = sat.OBJECT_NAME?.toString().toLowerCase().includes(term);
      const idMatch = sat.NORAD_CAT_ID?.toString().toLowerCase().includes(term);
      const intlMatch = sat.INTLDES?.toString().toLowerCase().includes(term);
      return nameMatch || idMatch || intlMatch;
    });
    
    console.log('Filtered results:', filtered.length);
    return filtered;
  }, [satellites, searchTerm]);

  const paginatedSatellites = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredSatellites.slice(startIndex, endIndex);
  }, [filteredSatellites, currentPage]);

  const totalPages = Math.ceil(filteredSatellites.length / itemsPerPage);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to page 1 when searching
  };

  return (
    <div className="min-h-screen bg-slate-950 text-emerald-500/95 font-mono">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-emerald-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Database className="w-6 h-6 text-emerald-400" />
              <h1 className="text-xl font-bold text-emerald-400">
                SATCAT // GLOBAL REGISTRY
              </h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="sticky top-16 z-10 border-b border-emerald-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/60" />
            <input
              type="text"
              placeholder="Search by Name or ID..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-emerald-500/30 rounded-lg text-emerald-400 placeholder-emerald-500/40 focus:outline-none focus:border-emerald-500/60 focus:bg-slate-800/70 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
            <span className="text-emerald-400">Loading satellite database...</span>
          </div>
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <p className="text-emerald-400/80 text-sm">
              {filteredSatellites.length.toLocaleString()} objects found
              {searchTerm && ` (filtered from ${satellites.length.toLocaleString()})`}
            </p>
            <p className="text-emerald-400/60 text-sm">
              Page {currentPage} of {totalPages}
            </p>
          </div>
        </div>
      )}

      {/* Satellite Table */}
      {!loading && paginatedSatellites.length > 0 && (
        <div className="container mx-auto px-4 pb-4">
          <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-emerald-500/20">
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
                      NORAD ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
                      INT'L DESIGNATOR
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-emerald-400 uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-emerald-400 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSatellites.map((satellite, index) => (
                    <motion.tr
                      key={satellite.NORAD_CAT_ID}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.01 }}
                      className="border-b border-emerald-500/10 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-cyan-400 font-mono text-sm">
                        {satellite.NORAD_CAT_ID}
                      </td>
                      <td className="px-4 py-3 text-white font-bold text-sm">
                        {satellite.OBJECT_NAME}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {satellite.INTLDES || '-'}
                      </td>
                      <td className="px-4 py-3 text-emerald-400 text-sm">
                        {satellite.OBJECT_TYPE || '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyId(satellite.NORAD_CAT_ID)}
                          className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-xs"
                        >
                          {copiedId === satellite.NORAD_CAT_ID ? (
                            <>
                              <ArrowRight className="w-3 h-3 mr-1" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 mr-1" />
                              Copy ID
                            </>
                          )}
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && paginatedSatellites.length === 0 && (
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Database className="w-12 h-12 text-emerald-400/60 mx-auto mb-4" />
            <p className="text-emerald-400 text-lg font-medium mb-2">
              No satellites found
            </p>
            <p className="text-emerald-400/60 text-sm">
              {searchTerm 
                ? `No results for "${searchTerm}". Try a different search term.` 
                : 'No satellite data available.'}
            </p>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNum)}
                    className={
                      currentPage === pageNum
                        ? "bg-emerald-500 text-slate-900"
                        : "border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SatcatPage;
