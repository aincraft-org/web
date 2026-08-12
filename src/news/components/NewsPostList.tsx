import { Box, chakra, Heading, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import type { NewsPost } from '../content';
const RouterLink = chakra(Link);

interface NewsPostListProps {
  posts: NewsPost[];
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}, ${year}`;
}

export function NewsPostList({ posts }: NewsPostListProps) {
  if (!posts.length) {
    return (
      <Text data-testid="news-empty" color="blackAlpha.600" border="1px dashed" borderColor="blackAlpha.300" p={10} textAlign="center">
        No chronicles yet — check back soon.
      </Text>
    );
  }

  return (
    <Box as="ul" data-testid="news-post-list" listStyle="none" m={0} p={0} display="grid" gap={4}>
      {posts.map((post) => (
        <Box
          as="li"
          key={post.slug}
          data-testid="news-post"
          data-date={post.date}
          p={5}
          border="1px solid"
          borderColor="blackAlpha.300"
          borderLeft="3px solid"
          borderLeftColor="teal.400"
          borderRadius="lg"
        >
          <VStack align="start" gap={1}>
            <chakra.time dateTime={post.date} color="blackAlpha.500" fontSize="xs">
              {formatDate(post.date)}
            </chakra.time>
            <Heading as="h2" size="md">
              <RouterLink to={`/news/${post.slug}`}>{post.title}</RouterLink>
            </Heading>
            <Text color="blackAlpha.700" fontSize="sm">
              {post.summary}
            </Text>
          </VStack>
        </Box>
      ))}
    </Box>
  );
}
