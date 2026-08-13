import { Box, chakra, Heading, Stack, Text } from '@chakra-ui/react';

export function StoreHero() {
  return (
    <Box
      as="section"
      data-testid="store-hero"
      aria-labelledby="store-title"
      rounded="xl"
      border="1px solid"
      borderColor="blackAlpha.300"
      mb={{ base: 7, md: 10 }}
      p={{ base: 6, md: 12 }}
    >
      <Box
        display="grid"
        gridTemplateColumns={{ base: '1fr', lg: '1fr 360px' }}
        gap={{ base: 8, lg: 12 }}
        alignItems="center"
      >
        <Box>
          <Text fontSize="xs" letterSpacing="0.14em" textTransform="uppercase">
            AZOTHMC / OFFICIAL STORE
          </Text>
          <Heading as="h1" id="store-title" size={{ base: '2xl', md: '3xl' }} mt={2}>
            Support the realm.
          </Heading>
          <Text color="blackAlpha.700" maxWidth="58ch" mt={3}>
            Unlock ranks, cosmetics, crates, and bundles for your next expedition. Every purchase
            is delivered in-game through our secure store.
          </Text>
          <chakra.a
            href="#delivery-note"
            display="inline-flex"
            alignItems="center"
            mt={6}
            fontWeight="medium"
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="0.1em"
            _hover={{ color: 'blackAlpha.900' }}
            _focusVisible={{ outline: '2px solid', outlineColor: 'teal.500', outlineOffset: '2px' }}
          >
            How delivery works <chakra.span ml={1} aria-hidden="true">↓</chakra.span>
          </chakra.a>
        </Box>

        <Box
          role="complementary"
          aria-label="Server details"
          border="1px solid"
          borderColor="blackAlpha.300"
          rounded="lg"
          p={5}
        >
          <Text fontSize="xs" letterSpacing="0.12em" textTransform="uppercase">
            Server details
          </Text>
          <Stack gap={2} mt={4} fontSize="sm">
            <Box display="flex" justifyContent="space-between" gap={4}>
              <Text color="blackAlpha.600">Status</Text>
              <Text fontWeight="bold">—</Text>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={4}>
              <Text color="blackAlpha.600">Address</Text>
              <chakra.code fontWeight="medium">play.azothmc.com</chakra.code>
            </Box>
            <Box display="flex" justifyContent="space-between" gap={4}>
              <Text color="blackAlpha.600">Edition</Text>
              <Text>Java</Text>
            </Box>
          </Stack>
          <Text color="blackAlpha.600" fontSize="xs" mt={5}>
            Join us in-game, then unlock perks here.
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
