import { Box, Container, Heading, List, Text, chakra } from '@chakra-ui/react';
import type { JournalSection as JournalSectionData } from '../content';

interface JournalSectionProps {
  section: JournalSectionData;
}

export function JournalSection({ section }: JournalSectionProps) {
  const right = section.side === 'right';

  return (
    <chakra.section
      className="slide feature journal-section"
      id={section.id}
      data-testid={section.testId}
      position="relative"
      minH={{ base: 'auto', md: '76vh' }}
      overflow="hidden"
      bg="ink.900"
      py={{ base: 16, md: 24 }}
    >
      <Box
        className="slide-bg"
        position="absolute"
        inset={0}
        backgroundImage={`url('${section.background}')`}
        backgroundSize="cover"
        backgroundPosition="center"
        opacity={0.28}
        aria-hidden="true"
      />
      <Container className={`journal-shell section-shell-${section.side}`} maxW="1200px" position="relative">
        <Text className="section-marker" color="mint.400" fontFamily="mono" fontSize="xs" letterSpacing="0.14em" textTransform="uppercase" mb={5} textAlign={right ? 'right' : 'left'}>
          {section.entry} <chakra.span color="muted" ml={4}>{section.category}</chakra.span>
        </Text>
        <chakra.article
          className={`panel panel-${section.side}`}
          maxW="680px"
          ml={right ? 'auto' : undefined}
          p={{ base: 6, md: 10 }}
          bg="rgba(238, 233, 216, 0.96)"
          color="paper.ink"
          borderRadius="lg"
          boxShadow="lg"
        >
          <Text className="panel-index" color="paper.muted" fontFamily="mono" fontSize="xs">{section.index}</Text>
          <Text className="panel-kicker" color="paper.muted" fontFamily="mono" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" mt={3}>{section.kicker}</Text>
          <Heading className="panel-title" as="h2" color="paper.ink" fontSize={{ base: '3xl', md: '4xl' }} lineHeight={1.05} mt={3}>{section.title}</Heading>
          {section.paragraphs.map((paragraph) => <Text key={paragraph} mt={5}>{paragraph}</Text>)}
          <List.Root className="panel-list" as="ul" mt={6} ps={5} gap={2}>
            {section.bullets.map((bullet) => <List.Item key={bullet}>{bullet}</List.Item>)}
          </List.Root>
        </chakra.article>
      </Container>
    </chakra.section>
  );
}
