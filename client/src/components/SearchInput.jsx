import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Fuse from 'fuse.js';

export function SearchInput({ 
  data, 
  searchKeys, 
  placeholder = "Search...", 
  onFilter, 
  className = "" 
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(data, {
      keys: searchKeys,
      threshold: 0.3,
      includeScore: true,
      shouldSort: true,
    });
  }, [data, searchKeys]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      onFilter(data);
      return;
    }

    const results = fuse.search(searchTerm);
    const filteredData = results.map(result => result.item);
    onFilter(filteredData);
  }, [searchTerm, fuse, data, onFilter]);

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`pl-10 pr-10 ${className}`}
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}

export default SearchInput;
