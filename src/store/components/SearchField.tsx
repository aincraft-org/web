import { Box, Input, Text, VStack } from '@chakra-ui/react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <Box as="label" display="grid" gap={1} flexBasis={300} maxWidth={420} color="blackAlpha.700" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
      <Text as="span" mb={1}>Search packages</Text>
      <Input
        data-testid="store-search"
        id="store-search"
        type="search"
        aria-label="Search packages"
        placeholder="Search ranks, crates, coins…"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="md"
        minH={11}
        rounded="md"
        border="1px solid"
        borderColor="blackAlpha.300"
        _placeholder={{ color: 'blackAlpha.500' }}
        _hover={{ borderColor: 'blackAlpha.500' }}
        _focusVisible={{
          borderColor: 'teal.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)',
          outline: 'none',
        }}
      />
    </Box>
  );
}
