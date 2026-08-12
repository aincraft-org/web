import { Box, Heading, Stack, Text } from '@chakra-ui/react';

interface NewsHeroProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function NewsHero({ eyebrow, title, subtitle }: NewsHeroProps) {
  return (
    <Box
      as="section"
      data-testid="news-hero"
      aria-labelledby="news-hero-title"
      border="1px solid"
      borderColor="blackAlpha.300"
      p={{ base: 6, md: 10 }}
      mb={{ base: 7, md: 12 }}
    >
      <Stack gap={2}>
        <Text fontSize="xs" letterSpacing="0.13em" textTransform="uppercase">
          {eyebrow}
        </Text>
        <Heading as="h1" id="news-hero-title" size="xl">
          {title}
        </Heading>
        {subtitle ? (
          <Text color="blackAlpha.700" maxWidth="60ch">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
}
