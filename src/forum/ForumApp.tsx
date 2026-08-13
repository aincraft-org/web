import { useEffect } from 'react';
import { Container } from '@chakra-ui/react';
import { getDiscourseUrl } from './config';
import { ForumHero } from './components/ForumHero';

export default function ForumApp() {
  const discourseUrl = getDiscourseUrl();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Forum | AzothMC';
    return () => { document.title = previousTitle; };
  }, []);

  return (
    <Container maxWidth="container.lg" p={{ base: 4, md: 8 }} pt={{ base: 7, md: 12 }} pb={12}>
      <ForumHero discourseUrl={discourseUrl} />
    </Container>
  );
}
