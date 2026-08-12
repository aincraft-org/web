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
      borderColor="mint.400/24"
      bg="ink.800"
      p={{ base: 6, md: 10 }}
      mb={{ base: 7, md: 12 }}
      boxShadow="lg"
    >
      <Stack gap={2}>
        <Text color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.13em" textTransform="uppercase">
          {eyebrow}
        </Text>
        <Heading as="h1" id="news-hero-title" size="xl" color="paper.bright">
          {title}
        </Heading>
        {subtitle ? (
          <Text color="muted" maxWidth="60ch">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
    </Box>
  );
}
