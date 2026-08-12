import { Box, chakra, Heading, Stack, Text } from '@chakra-ui/react';

export function StoreHero() {
  return (
    <Box
      as="section"
      data-testid="store-hero"
      aria-labelledby="store-title"
      position="relative"
      overflow="hidden"
      rounded="xl"
      border="1px solid"
      borderColor="mint.400/24"
      bg="ink.800"
      mb={{ base: 7, md: 10 }}
      boxShadow="lg"
      _before={{
        content: '""',
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("/assets/loot-bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.24,
      }}
    >
      <Box
        position="relative"
        zIndex={1}
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '1fr 360px' }}
        gap={{ base: 8, lg: 12 }}
        alignItems="center"
        px={{ base: 6, md: 12 }}
        py={{ base: 8, md: 12 }}
      >
        <Box>
          <Text color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.14em" textTransform="uppercase">
            AZOTHMC / OFFICIAL STORE
          </Text>
          <Heading as="h1" id="store-title" size={{ base: '2xl', md: '3xl' }} color="paper.bright" letterSpacing="-0.02em" mt={2}>
            Support the realm.
          </Heading>
          <Text color="muted" maxWidth="58ch" mt={3}>
            Unlock ranks, cosmetics, crates, and bundles for your next expedition. Every purchase
            is delivered in-game through our secure store.
          </Text>
          <chakra.a
            href="#delivery-note"
            display="inline-flex"
            alignItems="center"
            mt={6}
            color="accent.400"
            fontFamily="mono"
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="0.1em"
            _hover={{ color: 'paper.bright' }}
            _focusVisible={{ outline: '2px solid', outlineColor: 'accent.400', outlineOffset: '2px' }}
          >
            How delivery works <chakra.span ml={1} aria-hidden="true">↓</chakra.span>
          </chakra.a>
        </Box>

        <Box
          role="complementary"
          aria-label="Server details"
          border="1px solid"
          borderColor="accent.400/30"
          rounded="lg"
          bg="rgba(7, 19, 22, 0.7)"
          backdropFilter="blur(8px)"
          p={5}
        >
          <Text fontFamily="mono" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" color="mint.400">
            Server details
          </Text>
          <Stack gap={2} mt={4} fontSize="sm">
            <Box display="flex" justifyContent="space-between" gap={4}>
              <Text color="muted">Status</Text>
              <Text color="paper.bright" fontWeight="bold">—</Text>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={4}>
              <Text color="muted">Address</Text>
              <chakra.code color="accent.400" fontFamily="mono">play.azothmc.com</chakra.code>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={4}>
              <Text color="muted">Edition</Text>
              <Text color="paper.bright">Java</Text>
            </Box>
          </Stack>
          <Text color="muted" fontSize="xs" mt={5}>
            Join us in-game, then unlock perks here.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
