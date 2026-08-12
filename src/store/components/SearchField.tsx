import { Box, Input, Text, VStack } from '@chakra-ui/react';

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <Box as="label" display="grid" gap={1} flexBasis={300} maxWidth={420} color="muted" fontFamily="mono" fontSize="xs" textTransform="uppercase" letterSpacing="0.08em">
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
        borderColor="line-dim"
        bg="ink.900"
        color="paper.bright"
        _placeholder={{ color: 'paper.muted' }}
        _hover={{ borderColor: 'accent.400/50' }}
        _focusVisible={{
          borderColor: 'accent.400',
          boxShadow: '0 0 0 1px var(--chakra-colors-accent-400)',
          outline: 'none',
        }}
      />
    </Box>
  );
}
