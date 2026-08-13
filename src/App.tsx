import { useCallback, useEffect, useRef, useState } from 'react';
import { chakra } from '@chakra-ui/react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { copyText } from './clipboard';
import { SERVER_IP } from './content';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import LandingPage from './LandingPage';
import NewsArticle from './news/NewsArticle';
import NewsIndex from './news/NewsIndex';
import StoreApp from './store/StoreApp';
import ForumApp from './forum/ForumApp';

const FEEDBACK_DURATION = 2500;

export default function App() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('hero');
  const [copiedButtons, setCopiedButtons] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState({ hero: false, join: false });
  const [lastCopiedIp, setLastCopiedIp] = useState('');
  const feedbackTimers = useRef(new Map<string, number>());

  useEffect(() => {
    if (lastCopiedIp) document.documentElement.dataset.lastCopiedIp = lastCopiedIp;
  }, [lastCopiedIp]);

  useEffect(() => {
    return () => {
      feedbackTimers.current.forEach((timer) => window.clearTimeout(timer));
      feedbackTimers.current.clear();
    };
  }, []);

  const handleCopy = useCallback(async ({ buttonId, feedbackKey }: { buttonId: string; feedbackKey: 'hero' | 'join' }) => {
    const copied = await copyText(SERVER_IP);
    setCopiedButtons((current) => ({ ...current, [buttonId]: copied }));
    if (!copied) return false;

    setLastCopiedIp(SERVER_IP);
    setFeedback((current) => ({ ...current, [feedbackKey]: true }));

    const previousTimer = feedbackTimers.current.get(feedbackKey);
    if (previousTimer) window.clearTimeout(previousTimer);

    const timer = window.setTimeout(() => {
      setFeedback((current) => ({ ...current, [feedbackKey]: false }));
      feedbackTimers.current.delete(feedbackKey);
    }, FEEDBACK_DURATION);
    feedbackTimers.current.set(feedbackKey, timer);
    return true;
  }, []);

  const headerSection = location.pathname.startsWith('/news') ? 'news' : location.pathname === '/store' ? 'store' : location.pathname.startsWith('/forum') ? 'forum' : activeSection;

  return (
    <>
      <chakra.a
        className="skip-link"
        href="#main"
        position="fixed"
        top={2}
        left={2}
        zIndex={100}
        px={3}
        py={2}
        bg="accent.400"
        color="ink.900"
        borderRadius="md"
        transform="translateY(-150%)"
        _focus={{ transform: 'translateY(0)' }}
      >
        Skip to content
      </chakra.a>
      <SiteHeader
        activeSection={headerSection}
        copiedButtons={copiedButtons}
        onCopy={handleCopy}
      />
      <chakra.main id="main">
        <Routes>
          <Route
            path="/"
            element={(
              <LandingPage
                copiedButtons={copiedButtons}
                feedback={feedback}
                onCopy={handleCopy}
                setActiveSection={setActiveSection}
              />
            )}
          />
          <Route path="/store" element={<StoreApp />} />
          <Route path="/news" element={<NewsIndex />} />
          <Route path="/news/:slug" element={<NewsArticle />} />
          <Route path="/forum" element={<ForumApp />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </chakra.main>
      <SiteFooter />
    </>
  );
}
