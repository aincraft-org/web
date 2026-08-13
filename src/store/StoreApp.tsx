import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Container, Text } from '@chakra-ui/react';
import { storeCategories, storePackages, validateCatalog, type CategoryId } from './catalog';
import { CategoryTabs } from './components/CategoryTabs';
import { DeliveryNote } from './components/DeliveryNote';
import { MarketplacePanel } from './components/MarketplacePanel';
import { ProductGrid } from './components/ProductGrid';
import { SearchField } from './components/SearchField';
import { StoreHero } from './components/StoreHero';

validateCatalog();

export default function StoreApp() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedCategory = searchParams.get('category') ?? 'all';
  const category: CategoryId = storeCategories.some(({ id }) => id === requestedCategory)
    ? (requestedCategory as CategoryId)
    : 'all';
  const query = (searchParams.get('q') ?? '').trim().toLowerCase();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Store | AzothMC';
    return () => { document.title = previousTitle; };
  }, []);

  const setCategory = (nextCategory: CategoryId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextCategory === 'all') nextParams.delete('category');
    else nextParams.set('category', nextCategory);
    setSearchParams(nextParams);
  };

  const setQuery = (nextQuery: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextQuery) nextParams.set('q', nextQuery);
    else nextParams.delete('q');
    setSearchParams(nextParams);
  };

  const filteredPackages = useMemo(() => storePackages.filter((storePackage) => (
    (category === 'all' || storePackage.category === category)
      && (!query || `${storePackage.name} ${storePackage.description} ${storePackage.perks.join(' ')}`
        .toLowerCase()
        .includes(query))
  )), [category, query]);

  return (
    <Container maxWidth="container.lg" p={{ base: 4, md: 8 }} pt={{ base: 7, md: 12 }} pb={12}>
      <StoreHero />
      <FlexColumn>
        <CategoryTabs categories={storeCategories} value={category} onChange={setCategory} />
        <SearchField value={query} onChange={setQuery} />
      </FlexColumn>
      <ProductGrid packages={filteredPackages} categories={storeCategories} />
      <MarketplacePanel />
      <DeliveryNote />
      <Text as="p" color="blackAlpha.600" fontSize="sm" textAlign="center" mt={6}>
        The AzothMC store is an independent community project, not affiliated with Mojang or Microsoft.
      </Text>
    </Container>
  );
}

function FlexColumn({ children }: { children: React.ReactNode }) {
  return (
    <Box display="flex" flexDirection={{ base: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ base: 'stretch', md: 'end' }} gap={5} mb={6}>
      {children}
    </Box>
  );
}
