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
          variant="outline"
          borderColor={active(category.id) ? 'accent.400' : 'line-dim'}
          bg={active(category.id) ? 'accent.400' : 'transparent'}
          color={active(category.id) ? 'ink.900' : 'paper.deep'}
          fontWeight="bold"
          fontSize="sm"
          fontFamily="body"
          letterSpacing="0.02em"
          transition="all 180ms ease"
          _hover={{
            bg: active(category.id) ? 'accent.strong' : 'ink.700',
            borderColor: active(category.id) ? 'accent.strong' : 'accent.400',
            color: active(category.id) ? 'ink.900' : 'paper.bright',
          }}
          _focusVisible={{ outline: '2px solid', outlineColor: 'accent.400', outlineOffset: '2px' }}
        >
          {category.label}
        </Button>
      ))}
    </Flex>
  );
}
