import { Button, Flex } from '@chakra-ui/react';
import type { CategoryId, StoreCategory } from '../catalog';

interface CategoryTabsProps {
  categories: StoreCategory[];
  value: CategoryId;
  onChange: (id: CategoryId) => void;
}

export function CategoryTabs({ categories, value, onChange }: CategoryTabsProps) {
  const active = (id: CategoryId) => value === id;

  return (
    <Flex
      as="nav"
      data-testid="store-tabs"
      aria-label="Filter by category"
      wrap="wrap"
      gap={2}
    >
      {categories.map((category) => (
        <Button
          key={category.id}
          type="button"
          data-category={category.id}
          aria-pressed={active(category.id)}
          onClick={() => onChange(category.id)}
          size="md"
          px={5}
          minH={11}
          rounded="full"
          variant={active(category.id) ? 'solid' : 'outline'}
          colorScheme="teal"
          fontWeight="bold"
          fontSize="sm"
          _focusVisible={{ outline: '2px solid', outlineColor: 'teal.500', outlineOffset: '2px' }}
        >
          {category.label}
        </Button>
      ))}
    </Flex>
  );
}
