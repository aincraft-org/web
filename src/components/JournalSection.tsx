import { Container, Heading, List, Text, chakra } from '@chakra-ui/react';
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
      py={{ base: 16, md: 24 }}
      borderTop="1px solid"
      borderColor="blackAlpha.200"
    >
      <Container className={`journal-shell section-shell-${section.side}`} maxW="1200px">
        <Text className="section-marker" fontSize="xs" letterSpacing="0.14em" textTransform="uppercase" mb={5} textAlign={right ? 'right' : 'left'}>
          {section.entry} <chakra.span color="blackAlpha.600" ml={4}>{section.category}</chakra.span>
        </Text>
        <chakra.article
          className={`panel panel-${section.side}`}
          maxW="680px"
          ml={right ? 'auto' : undefined}
          p={{ base: 6, md: 10 }}
          border="1px solid"
          borderColor="blackAlpha.200"
          borderRadius="lg"
        >
          <Text className="panel-index" color="blackAlpha.600" fontSize="xs">{section.index}</Text>
          <Text className="panel-kicker" color="blackAlpha.600" fontSize="xs" letterSpacing="0.12em" textTransform="uppercase" mt={3}>{section.kicker}</Text>
          <Heading className="panel-title" as="h2" fontSize={{ base: '3xl', md: '4xl' }} lineHeight={1.05} mt={3}>{section.title}</Heading>
          {section.paragraphs.map((paragraph) => <Text key={paragraph} mt={5}>{paragraph}</Text>)}
          <List.Root className="panel-list" as="ul" mt={6} ps={5} gap={2}>
            {section.bullets.map((bullet) => <List.Item key={bullet}>{bullet}</List.Item>)}
          </List.Root>
        </chakra.article>
      </Container>
    </chakra.section>
  );
}
