import { Box, Heading, List, Text, VStack } from '@chakra-ui/react';

export function DeliveryNote() {
  return (
    <Box
      as="section"
      id="delivery-note"
      data-testid="delivery-note"
      aria-labelledby="delivery-title"
      border="1px solid"
      borderColor="mint.400/30"
      bg="ink.800"
      p={{ base: 6, md: 8 }}
      mt={{ base: 8, md: 12 }}
      rounded="lg"
    >
      <VStack align="start" gap={3}>
        <Text color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.13em" textTransform="uppercase">
          FIELD NOTE / DELIVERY
        </Text>
        <Heading as="h2" id="delivery-title" size="lg" color="paper.bright">
          How delivery works
        </Heading>
        <List.Root as="ol" gap={2} color="paper.deep" ps={5}>
          <List.Item>Choose a perk and continue to Tebex, our secure checkout partner.</List.Item>
          <List.Item>Enter your Minecraft username (or use your linked account) and finish payment.</List.Item>
          <List.Item>Your perks arrive in-game within about 1-2 minutes, even if you are offline.</List.Item>
          <List.Item>Already linked your account? Purchases go to your linked name.</List.Item>
        </List.Root>
        <Text color="muted" fontSize="sm">
          Payments are processed by Tebex as Merchant of Record. Need help? Ask in our Discord.
        </Text>
      </VStack>
    </Box>
  );
}
