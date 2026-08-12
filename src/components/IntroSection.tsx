import { Box, Container, Heading, List, SimpleGrid, Text, chakra } from '@chakra-ui/react';

export function IntroSection() {
  return (
    <chakra.section
      className="slide feature feature-intro"
      id="intro"
      data-testid="feature-intro"
      position="relative"
      minH={{ base: 'auto', md: '82vh' }}
      overflow="hidden"
      bg="ink.800"
      py={{ base: 16, md: 24 }}
    >
      <Box className="slide-bg dim" position="absolute" inset={0} backgroundImage="url('/assets/world-bg.jpg')" backgroundSize="cover" backgroundPosition="center" opacity={0.2} aria-hidden="true" />
      <Container className="journal-shell intro-shell" maxW="1200px" position="relative">
        <Text className="section-marker" color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.14em" textTransform="uppercase" mb={5}>
          ENTRY 01 <chakra.span color="muted" ml={4}>ORIENTATION</chakra.span>
        </Text>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 16 }} alignItems="center">
          <chakra.article
            className="panel panel-intro"
            maxW="680px"
            p={{ base: 6, md: 10 }}
            bg="rgba(238, 233, 216, 0.96)"
            color="paper.ink"
            borderRadius="lg"
            boxShadow="lg"
          >
            <Text className="panel-kicker" color="paper.muted" fontFamily="mono" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase">
              Start here
            </Text>
            <Heading className="panel-title" as="h2" color="paper.ink" fontSize={{ base: '3xl', md: '4xl' }} lineHeight={1.05} mt={3}>
              A world built for the long way around.
            </Heading>
            <Text mt={5}>
              AzothMC is a custom Minecraft MMORPG. Level up, complete quests, trade legendary loot, slay bosses, uncover secrets, and capture territories with your guild.
            </Text>
            <Text mt={4}>
              Pick a class and step into a handcrafted adventure map built for long-form play. <chakra.strong>No mods required.</chakra.strong>
            </Text>
            <List.Root className="steps-compact" data-testid="join-steps-mini" as="ol" mt={6} ps={5} gap={2}>
              <List.Item>Launch Minecraft: Java Edition</List.Item>
              <List.Item>Multiplayer, then Add Server</List.Item>
              <List.Item>Enter <chakra.code data-testid="server-ip-inline" px={1} bg="paper.deep" borderRadius="sm">play.azothmc.com</chakra.code></List.Item>
              <List.Item>Join and create your character</List.Item>
            </List.Root>
          </chakra.article>
          <chakra.aside className="journal-note" aria-label="Field note" p={6} borderLeft="3px solid" borderColor="accent.400" color="paper.deep" bg="rgba(21, 50, 56, 0.78)" borderRadius="md">
            <chakra.span className="journal-note-pin" aria-hidden="true" display="block" boxSize={3} borderRadius="full" bg="orange.400" mb={5} />
            <Text className="journal-note-label" color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase">
              Cartographer's note
            </Text>
            <Text mt={3}>There is no optimal route. Start with the landmark that catches your eye.</Text>
            <chakra.span className="journal-note-code" display="block" mt={6} color="muted" fontFamily="mono" fontSize="xs">AZ / 01</chakra.span>
          </chakra.aside>
        </SimpleGrid>
      </Container>
    </chakra.section>
  );
}
