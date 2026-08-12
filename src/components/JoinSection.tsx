import { Box, Container, Heading, List, SimpleGrid, Text, chakra } from '@chakra-ui/react';
import { CopyFeedback, CopyIpButton, type CopyHandler, type CopyState } from './CopyIpButton';

interface JoinSectionProps {
  copiedButtons: CopyState;
  feedbackVisible: boolean;
  onCopy: CopyHandler;
}

export function JoinSection({ copiedButtons, feedbackVisible, onCopy }: JoinSectionProps) {
  return (
    <chakra.section
      className="slide join"
      id="join"
      data-testid="join"
      position="relative"
      minH={{ base: 'auto', md: '76vh' }}
      overflow="hidden"
      bg="ink.800"
      py={{ base: 16, md: 24 }}
    >
      <Box className="slide-bg dim" position="absolute" inset={0} backgroundImage="url('/assets/hero-bg.jpg')" backgroundSize="cover" backgroundPosition="center" opacity={0.22} aria-hidden="true" />
      <Container className="join-shell" maxW="900px" position="relative">
        <Text className="section-marker" color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.14em" textTransform="uppercase" mb={5} textAlign="center">
          FINAL ENTRY <chakra.span color="muted" ml={4}>DEPARTURE</chakra.span>
        </Text>
        <chakra.article className="panel panel-center join-panel" maxW="680px" mx="auto" p={{ base: 6, md: 10 }} bg="rgba(238, 233, 216, 0.96)" color="paper.ink" borderRadius="lg" boxShadow="lg">
          <Text className="panel-kicker" color="paper.muted" fontFamily="mono" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase">Your route starts here</Text>
          <Heading className="panel-title" as="h2" data-testid="join-title" color="paper.ink" fontSize={{ base: '3xl', md: '4xl' }} mt={3}>Play AzothMC</Heading>
          <Text mt={5}>
            Open Minecraft: Java Edition and connect to <chakra.strong className="ip-strong" color="ink.900">play.azothmc.com</chakra.strong>. No mods.
          </Text>

          <SimpleGrid className="server-card" data-testid="server-card" columns={{ base: 1, sm: 2 }} alignItems="center" gap={4} mt={6} p={4} border="1px solid" borderColor="paper.deep" borderRadius="md" bg="rgba(215, 206, 183, 0.35)">
            <Box className="server-ip-block">
              <Text className="server-label" color="paper.muted" fontSize="xs" fontFamily="mono" textTransform="uppercase">Server address</Text>
              <chakra.code className="server-ip" data-testid="server-ip-join" display="block" color="ink.900" fontFamily="mono" fontSize="lg" mt={1}>play.azothmc.com</chakra.code>
            </Box>
            <CopyIpButton id="copy-ip-join" testId="copy-ip-join" feedbackKey="join" appearance="primary" copied={copiedButtons['copy-ip-join']} onCopy={onCopy}>
              Copy IP
            </CopyIpButton>
          </SimpleGrid>
          <CopyFeedback id="copy-feedback-join" testId="copy-feedback-join" visible={feedbackVisible} panel>
            Server IP copied
          </CopyFeedback>

          <Heading className="how-title" as="h3" color="paper.ink" fontFamily="heading" fontSize="lg" mt={7}>How to join</Heading>
          <List.Root className="join-steps" data-testid="join-steps" as="ol" mt={4} ps={5} gap={2}>
            <List.Item>Launch <chakra.strong>Minecraft: Java Edition</chakra.strong></List.Item>
            <List.Item>Open <chakra.strong>Multiplayer</chakra.strong>, then <chakra.strong>Add Server</chakra.strong></List.Item>
            <List.Item>Enter <chakra.code>play.azothmc.com</chakra.code> as the address</List.Item>
            <List.Item>Save, connect, and start your adventure</List.Item>
          </List.Root>
        </chakra.article>
      </Container>
    </chakra.section>
  );
}
