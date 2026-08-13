import { chakra, Box, Heading, Stack, Text } from '@chakra-ui/react';

interface ForumHeroProps {
  discourseUrl: string | null;
}

/**
 * Hero for the `/forum` launch page. When a trustable Discourse origin is
 * configured it renders an external CTA that opens the community in a new tab
 * (never an iframe, and never an unsafe href). Otherwise it shows an explicit
 * "not configured" setup state so self-hosting is discoverable instead of a
 * dead button.
 */
export function ForumHero({ discourseUrl }: ForumHeroProps) {
  const configured = discourseUrl !== null;

  return (
    <Box
      as="section"
      data-testid="forum-hero"
      aria-labelledby="forum-title"
      border="1px solid"
      borderColor="mint.400/24"
      bg="ink.800"
      p={{ base: 6, md: 10 }}
      mb={{ base: 7, md: 12 }}
      boxShadow="lg"
      rounded="xl"
    >
      <Stack gap={2}>
        <Text color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.13em" textTransform="uppercase">
          AZOTHMC / THE COMMONS
        </Text>
        <Heading as="h1" id="forum-title" size={{ base: '2xl', md: '3xl' }} color="paper.bright" letterSpacing="-0.02em">
          The Commons
        </Heading>
        <Text color="muted" maxWidth="62ch">
          Trade stories, plan expeditions, and shape the realm with fellow
          travellers. The forum opens in its own tab — a self-hosted community
          we run ourselves.
        </Text>

        {configured ? (
          <Box mt={6}>
            <chakra.a
              data-testid="forum-cta"
              href={discourseUrl}
              target="_blank"
              rel="noopener noreferrer"
              display="inline-flex"
              alignItems="center"
              gap={2}
              px={5}
              py={3}
              rounded="md"
              bg="accent.400"
              color="ink.900"
              fontFamily="mono"
              fontSize="sm"
              fontWeight="bold"
              letterSpacing="0.08em"
              textTransform="uppercase"
              _hover={{ bg: 'accent.strong', transform: 'translateY(-1px)', boxShadow: 'md' }}
              _focusVisible={{ outline: '2px solid', outlineColor: 'accent.400', outlineOffset: '2px' }}
            >
              Open the forum <chakra.span aria-hidden="true">↗</chakra.span>
            </chakra.a>
            <Text color="muted" fontSize="sm" mt={3}>
              Opens in a new tab. Treat every traveller with respect.
            </Text>
          </Box>
        ) : (
          <Box
            data-testid="forum-setup"
            mt={6}
            border="1px solid"
            borderColor="accent.400/30"
            rounded="lg"
            bg="rgba(7, 19, 22, 0.7)"
            p={5}
          >
            <Text color="paper.bright" fontWeight="bold">
              The forum is not configured yet.
            </Text>
            <Text color="muted" fontSize="sm" mt={2}>
              We self-host our community. Point{' '}
              <chakra.code color="accent.400" fontFamily="mono">VITE_DISCOURSE_URL</chakra.code>{' '}
              at an http/https Discourse origin in your deploy environment and rebuild. Until then
              this page stays a clear setup note rather than a broken link.
            </Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
