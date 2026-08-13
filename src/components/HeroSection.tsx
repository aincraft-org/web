import { Box, Container, Heading, Image, SimpleGrid, Stack, Text, chakra } from '@chakra-ui/react';
import { CopyIcon } from './CopyIcon';
import { CopyFeedback, CopyIpButton, type CopyHandler, type CopyState } from './CopyIpButton';

interface HeroSectionProps {
  copiedButtons: CopyState;
  feedbackVisible: boolean;
  onCopy: CopyHandler;
}

export function HeroSection({ copiedButtons, feedbackVisible, onCopy }: HeroSectionProps) {
  return (
    <chakra.section
      className="slide hero"
      id="hero"
      data-testid="hero"
      position="relative"
      minH={{ base: 'calc(100vh - 130px)', lg: 'calc(100vh - 118px)' }}
      overflow="hidden"
      py={{ base: 12, md: 20 }}
    >
      <Box
        className="slide-bg"
        position="absolute"
        inset={0}
        backgroundImage="url('/assets/hero-bg.jpg')"
        backgroundSize="cover"
        backgroundPosition="center"
        opacity={0.14}
        aria-hidden="true"
      />
      <Container className="hero-stage" maxW="1500px" minH="inherit" position="relative">
        <SimpleGrid
          className="hero-grid"
          columns={{ base: 1, lg: 2 }}
          gap={{ base: 12, lg: 16 }}
          alignItems="center"
          minH="inherit"
          position="relative"
        >
          <Box className="hero-copy" maxW="680px">
            <Text className="eyebrow" fontSize="xs" letterSpacing="0.14em" textTransform="uppercase">
              <chakra.span>FIELD NOTE 001</chakra.span>
              <chakra.span color="blackAlpha.600" ml={4}>AZOTH / OPEN WORLD</chakra.span>
            </Text>
            <Heading className="hero-title" as="h1" fontSize={{ base: '4xl', md: '6xl', lg: '7xl' }} lineHeight={0.98} letterSpacing="-0.05em" mt={4}>
              <chakra.span className="hero-title-lead" display="block" fontSize={{ base: 'xl', md: '2xl' }} letterSpacing="-0.02em" mb={3}>
                A route worth getting lost in.
              </chakra.span>
              The Minecraft MMORPG
            </Heading>
            <Text className="hero-tagline" data-testid="hero-tagline" fontSize={{ base: 'md', md: 'lg' }} maxW="58ch" mt={6}>
              Level up, quest, trade, and raid through a handcrafted realm where every road leads to a story. No mods required.
            </Text>

            <SimpleGrid className="hero-facts" data-testid="hero-facts" aria-label="Server features" columns={{ base: 1, sm: 3 }} gap={3} mt={6} fontSize="sm">
              <chakra.span><chakra.strong mr={2}>01</chakra.strong>Java Edition</chakra.span>
              <chakra.span><chakra.strong mr={2}>02</chakra.strong>No mods</chakra.span>
              <chakra.span><chakra.strong mr={2}>03</chakra.strong>Play together</chakra.span>
            </SimpleGrid>

            <Stack className="hero-ctas" direction={{ base: 'column', sm: 'row' }} gap={3} mt={8}>
              <chakra.a
                className="btn btn-primary btn-lg"
                href="#join"
                data-testid="hero-cta"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                minH={12}
                px={6}
                borderRadius="md"
                bg="brand.600"
                color="white"
                fontWeight="bold"
                _hover={{ bg: 'brand.500' }}
                _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '3px' }}
              >
                Begin your journey
              </chakra.a>
              <chakra.a
                className="btn btn-quiet btn-lg"
                href="#intro"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                minH={12}
                px={6}
                border="1px solid"
                borderColor="blackAlpha.300"
                borderRadius="md"
                _hover={{ bg: 'blackAlpha.100' }}
                _focusVisible={{ outline: '2px solid', outlineColor: 'brand.500', outlineOffset: '3px' }}
              >
                Read the field guide
              </chakra.a>
            </Stack>

            <Box className="hero-meta" mt={7}>
              <CopyIpButton
                id="copy-ip-hero"
                testId="copy-ip-hero"
                feedbackKey="hero"
                appearance="inline"
                copied={copiedButtons['copy-ip-hero']}
                onCopy={onCopy}
              >
                <chakra.span className="ip-inline-label" color="blackAlpha.600" fontSize="2xs" letterSpacing="0.12em">SERVER ADDRESS</chakra.span>
                <chakra.span data-testid="server-ip" fontWeight="medium" fontSize="sm">play.azothmc.com</chakra.span>
                <CopyIcon size={14} />
              </CopyIpButton>
              <chakra.span className="meta-note" color="blackAlpha.600" fontSize="sm" ml={3}>Copy it, then launch Minecraft.</chakra.span>
            </Box>

            <CopyFeedback id="copy-feedback-hero" testId="copy-feedback-hero" visible={feedbackVisible}>
              IP copied
            </CopyFeedback>
          </Box>

          <Box
            className="field-card"
            as="aside"
            aria-label="AzothMC expedition brief"
            p={{ base: 4, md: 6 }}
            border="1px solid"
            borderColor="blackAlpha.200"
            borderRadius="md"
          >
            <FlexFieldCardHeader />
            <Box className="field-card-art" position="relative" display="grid" placeItems="center" minH={{ base: 220, md: 310 }} mt={4} border="1px solid" borderColor="blackAlpha.200">
              <Image className="hero-logo" src="/assets/logo.png" alt="AzothMC" width="560px" height="258px" data-testid="hero-logo" objectFit="contain" position="relative" px={6} />
            </Box>
            <FlexFieldCardFooter />
          </Box>
        </SimpleGrid>
      </Container>
    </chakra.section>
  );
}

function FlexFieldCardHeader() {
  return (
    <chakra.div className="field-card-head" display="flex" justifyContent="space-between" fontSize="xs">
      <chakra.span>AZOTH / FIELD NOTE</chakra.span>
      <chakra.span>001</chakra.span>
    </chakra.div>
  );
}

function FlexFieldCardFooter() {
  return (
    <chakra.div className="field-card-foot" display="flex" justifyContent="space-between" alignItems="center" mt={4} fontSize="sm">
      <chakra.span>Entry point</chakra.span>
      <chakra.strong>Greenreach Gate</chakra.strong>
    </chakra.div>
  );
}
