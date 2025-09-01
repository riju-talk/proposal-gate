import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Fuse from 'fuse.js';

interface SearchInputProps<T> {
  data: T[];
  searchKeys: string[];
  placeholder?: string;
  onFilter: (filteredData: T[]) => void;
  className?: string;
}

export function SearchInput<T>({ 
  data, 
  searchKeys, 
  placeholder = "Search...", 
  onFilter, 
  className = "" 
}: SearchInputProps<T>) {
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
        className="pl-10 pr-10"
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}