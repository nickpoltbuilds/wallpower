
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { GlassCard } from './GlassCard';

const QUOTES: { text: string; author: string }[] = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go, as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "It's not whether you get knocked down, it's whether you get up.", author: "Vince Lombardi" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Spread love everywhere you go.", author: "Mother Teresa" },
  { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou" },
  { text: "The greatest glory is not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
  { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", author: "Dr. Seuss" },
  { text: "If you look at what you have in life, you'll always have more.", author: "Oprah Winfrey" },
  { text: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "Not how long, but how well you have lived is the main thing.", author: "Seneca" },
  { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Whoever is happy will make others happy too.", author: "Anne Frank" },
  { text: "Happiness depends upon ourselves.", author: "Aristotle" },
  { text: "Everything you can imagine is real.", author: "Pablo Picasso" },
  { text: "Do one thing every day that scares you.", author: "Eleanor Roosevelt" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Keep your face always toward the sunshine, and shadows will fall behind you.", author: "Walt Whitman" },
  { text: "You are never too old to set another goal or to dream a new dream.", author: "C.S. Lewis" },
  { text: "To handle yourself, use your head; to handle others, use your heart.", author: "Eleanor Roosevelt" },
  { text: "Too many of us are not living our dreams because we are living our fears.", author: "Les Brown" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Don't be afraid to give up the good to go for the great.", author: "John D. Rockefeller" },
  { text: "There are no shortcuts to any place worth going.", author: "Beverly Sills" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Act as if what you do makes a difference. It does.", author: "William James" },
  { text: "What you get by achieving your goals is not as important as what you become.", author: "Zig Ziglar" },
];

export const QuoteWidget: React.FC = () => {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [spinning, setSpinning] = useState(false);

  const quote = QUOTES[idx];

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
    setIdx(i => (i + 1) % QUOTES.length);
  };

  return (
    <GlassCard
      title="Quote"
      icon={<span className="text-sm leading-none">💬</span>}
      className="h-full widget-quote"
      action={
        <button onClick={handleRefresh} className="opacity-40 hover:opacity-80 transition-opacity">
          <RefreshCw
            size={13}
            style={{
              transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)',
              transition: spinning ? 'transform 0.5s ease' : 'none',
            }}
          />
        </button>
      }
    >
      <div className="h-full flex flex-col justify-center px-1 pb-2 gap-2">
        <p
          className="font-bold leading-snug opacity-90"
          style={{ fontSize: 'clamp(0.78rem, 2vmin, 0.92rem)' }}
        >
          "{quote.text}"
        </p>
        <p
          className="font-black widget-quote-sub"
          style={{ fontSize: 'clamp(0.65rem, 1.6vmin, 0.75rem)' }}
        >
          — {quote.author}
        </p>
      </div>
    </GlassCard>
  );
};
