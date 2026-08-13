import { Box, Container, Heading, List, SimpleGrid, Text, chakra } from '@chakra-ui/react';

export function IntroSection() {
  return (
    <chakra.section
      className="slide feature feature-intro"
      id="intro"
      data-testid="feature-intro"
      py={{ base: 16, md: 24 }}
      borderTop="1px solid"
      borderColor="blackAlpha.200"
    >
      <Container className="journal-shell intro-shell" maxW="1200px">
        <Text className="section-marker" fontSize="xs" letterSpacing="0.14em" textTransform="uppercase" mb={5}>
          ENTRY 01 <chakra.span color="blackAlpha.600" ml={4}>ORIENTATION</chakra.span>
        </Text>
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 8, lg: 16 }} alignItems="center">
          <chakra.article
            className="panel panel-intro"
            maxW="680px"
            p={{ base: 6, md: 10 }}
            border="1px solid"
            borderColor="blackAlpha.200"
            borderRadius="lg"
          >
            <Text className="panel-kicker" color="blackAlpha.600" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase">
              Start here
            </Text>
            <Heading className="panel-title" as="h2" fontSize={{ base: '3xl', md: '4xl' }} lineHeight={1.05} mt={3}>
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
              <List.Item>Enter <chakra.code data-testid="server-ip-inline" px={1} bg="blackAlpha.100" borderRadius="sm">play.azothmc.com</chakra.code></List.Item>
              <List.Item>Join and create your character</List.Item>
            </List.Root>
          </chakra.article>
          <chakra.aside className="journal-note" aria-label="Field note" p={6} borderLeft="3px solid" borderColor="blackAlpha.300" borderRadius="md">
            <Text className="journal-note-label" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase">
              Cartographer's note
            </Text>
            <Text mt={3}>There is no optimal route. Start with the landmark that catches your eye.</Text>
            <chakra.span className="journal-note-code" display="block" mt={6} color="blackAlpha.600" fontSize="xs">AZ / 01</chakra.span>
          </chakra.aside>
        </SimpleGrid>
      </Container>
    </chakra.section>
  );
}
