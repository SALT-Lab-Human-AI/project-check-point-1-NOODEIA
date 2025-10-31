"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Award,
  Zap
} from 'lucide-react';

// Vocabulary bank with emojis and definitions
const vocabularyBank = [
  // Animals
  { word: 'cat', emoji: '🐱', definition: 'A small furry pet that says meow' },
  { word: 'dog', emoji: '🐶', definition: 'A friendly pet that barks and wags its tail' },
  { word: 'mouse', emoji: '🐭', definition: 'A tiny animal with a long tail' },
  { word: 'hamster', emoji: '🐹', definition: 'A small fluffy pet that stores food in cheeks' },
  { word: 'rabbit', emoji: '🐰', definition: 'A soft animal with long ears that hops' },
  { word: 'fox', emoji: '🦊', definition: 'A clever animal with a bushy tail' },
  { word: 'bear', emoji: '🐻', definition: 'A big furry animal that loves honey' },
  { word: 'panda', emoji: '🐼', definition: 'A black and white bear that eats bamboo' },
  { word: 'koala', emoji: '🐨', definition: 'A fuzzy animal from Australia that hugs trees' },
  { word: 'tiger', emoji: '🐯', definition: 'A big striped cat that roars' },
  { word: 'lion', emoji: '🦁', definition: 'The king of the jungle with a big mane' },
  { word: 'cow', emoji: '🐮', definition: 'A farm animal that gives us milk' },
  { word: 'pig', emoji: '🐷', definition: 'A pink farm animal that says oink' },
  { word: 'frog', emoji: '🐸', definition: 'A green animal that jumps and says ribbit' },
  { word: 'monkey', emoji: '🐵', definition: 'A playful animal that swings from trees' },
  { word: 'chicken', emoji: '🐔', definition: 'A bird that lays eggs and says cluck' },
  { word: 'penguin', emoji: '🐧', definition: 'A bird that cannot fly but loves to swim' },
  { word: 'bird', emoji: '🐦', definition: 'An animal with wings that flies in the sky' },
  { word: 'duck', emoji: '🦆', definition: 'A bird that quacks and swims in ponds' },
  { word: 'owl', emoji: '🦉', definition: 'A wise bird that hoots at night' },
  { word: 'eagle', emoji: '🦅', definition: 'A big strong bird that soars high' },
  { word: 'butterfly', emoji: '🦋', definition: 'A beautiful insect with colorful wings' },
  { word: 'bee', emoji: '🐝', definition: 'A buzzing insect that makes honey' },
  { word: 'ladybug', emoji: '🐞', definition: 'A tiny red bug with black spots' },
  { word: 'snail', emoji: '🐌', definition: 'A slow creature with a shell on its back' },
  { word: 'turtle', emoji: '🐢', definition: 'An animal with a hard shell that moves slowly' },
  { word: 'fish', emoji: '🐠', definition: 'A colorful animal that swims in water' },
  { word: 'dolphin', emoji: '🐬', definition: 'A smart sea animal that jumps and plays' },
  { word: 'whale', emoji: '🐋', definition: 'The biggest animal in the ocean' },
  { word: 'octopus', emoji: '🐙', definition: 'A sea creature with eight long arms' },
  { word: 'crab', emoji: '🦀', definition: 'A sea animal that walks sideways' },
  { word: 'dinosaur', emoji: '🦕', definition: 'A big animal that lived long ago' },

  // Fruits
  { word: 'apple', emoji: '🍎', definition: 'A round red fruit that is crunchy' },
  { word: 'banana', emoji: '🍌', definition: 'A long yellow fruit that monkeys love' },
  { word: 'orange', emoji: '🍊', definition: 'A round orange fruit full of juice' },
  { word: 'lemon', emoji: '🍋', definition: 'A sour yellow fruit' },
  { word: 'watermelon', emoji: '🍉', definition: 'A big green fruit that is red inside' },
  { word: 'grapes', emoji: '🍇', definition: 'Small purple or green fruits in bunches' },
  { word: 'strawberry', emoji: '🍓', definition: 'A sweet red fruit with tiny seeds' },
  { word: 'cherries', emoji: '🍒', definition: 'Small round red fruits on stems' },
  { word: 'peach', emoji: '🍑', definition: 'A soft fuzzy fruit' },
  { word: 'pear', emoji: '🍐', definition: 'A sweet fruit shaped like a bell' },
  { word: 'pineapple', emoji: '🍍', definition: 'A tropical fruit with spiky skin' },
  { word: 'kiwi', emoji: '🥝', definition: 'A small fuzzy brown fruit that is green inside' },
  { word: 'avocado', emoji: '🥑', definition: 'A green fruit that is creamy inside' },
  { word: 'mango', emoji: '🥭', definition: 'A sweet tropical yellow fruit' },
  { word: 'coconut', emoji: '🥥', definition: 'A big brown fruit with milk inside' },

  // Vegetables
  { word: 'carrot', emoji: '🥕', definition: 'An orange vegetable that is crunchy' },
  { word: 'broccoli', emoji: '🥦', definition: 'A green vegetable that looks like a tree' },
  { word: 'tomato', emoji: '🍅', definition: 'A red round vegetable that is juicy' },
  { word: 'corn', emoji: '🌽', definition: 'A yellow vegetable with sweet kernels' },
  { word: 'potato', emoji: '🥔', definition: 'A brown vegetable that grows underground' },
  { word: 'eggplant', emoji: '🍆', definition: 'A purple vegetable that is shiny' },
  { word: 'pepper', emoji: '🌶️', definition: 'A spicy red or green vegetable' },
  { word: 'mushroom', emoji: '🍄', definition: 'A vegetable that looks like an umbrella' },

  // Weather
  { word: 'sun', emoji: '☀️', definition: 'A bright star that gives us light and warmth' },
  { word: 'cloud', emoji: '☁️', definition: 'White fluffy things in the sky' },
  { word: 'rain', emoji: '🌧️', definition: 'Water drops that fall from clouds' },
  { word: 'rainbow', emoji: '🌈', definition: 'Colorful arc in the sky after rain' },
  { word: 'snow', emoji: '❄️', definition: 'White frozen water that falls in winter' },
  { word: 'thunder', emoji: '⛈️', definition: 'A loud boom during a storm' },
  { word: 'wind', emoji: '💨', definition: 'Air that moves and blows things' },
  { word: 'star', emoji: '⭐', definition: 'A bright light that shines at night' },
  { word: 'moon', emoji: '🌙', definition: 'A glowing object we see at night' },

  // Body Parts
  { word: 'eye', emoji: '👁️', definition: 'What we use to see things' },
  { word: 'ear', emoji: '👂', definition: 'What we use to hear sounds' },
  { word: 'nose', emoji: '👃', definition: 'What we use to smell things' },
  { word: 'mouth', emoji: '👄', definition: 'What we use to eat and talk' },
  { word: 'hand', emoji: '✋', definition: 'What we use to hold and touch things' },
  { word: 'foot', emoji: '🦶', definition: 'What we use to walk and run' },
  { word: 'heart', emoji: '❤️', definition: 'The organ that pumps blood in our body' },
  { word: 'brain', emoji: '🧠', definition: 'What we use to think and learn' },

  // School Items
  { word: 'book', emoji: '📖', definition: 'Something we read with pages and stories' },
  { word: 'pencil', emoji: '✏️', definition: 'A tool we use to write and draw' },
  { word: 'bag', emoji: '🎒', definition: 'What we carry our school things in' },
  { word: 'scissors', emoji: '✂️', definition: 'A tool we use to cut paper' },
  { word: 'ruler', emoji: '📏', definition: 'A tool we use to measure and draw straight lines' },
  { word: 'glue', emoji: '🖇️', definition: 'What we use to stick things together' },
  { word: 'crayon', emoji: '🖍️', definition: 'A colorful stick we use to draw' },
  { word: 'bell', emoji: '🔔', definition: 'What rings at school to tell us about time' },

  // More Fun Items
  { word: 'ball', emoji: '⚽', definition: 'A round toy we kick or throw' },
  { word: 'gift', emoji: '🎁', definition: 'A present wrapped with a bow' },
  { word: 'cake', emoji: '🎂', definition: 'A sweet treat for birthdays' },
  { word: 'cookie', emoji: '🍪', definition: 'A small round sweet snack' },
  { word: 'candy', emoji: '🍬', definition: 'A sweet treat that is colorful' },
  { word: 'flower', emoji: '🌸', definition: 'A pretty plant with colorful petals' },
  { word: 'tree', emoji: '🌳', definition: 'A tall plant with leaves and branches' },
  { word: 'house', emoji: '🏠', definition: 'A building where people live' },
  { word: 'car', emoji: '🚗', definition: 'A vehicle we drive on roads' },
  { word: 'bike', emoji: '🚲', definition: 'A vehicle with two wheels we pedal' },
  { word: 'train', emoji: '🚂', definition: 'A long vehicle that runs on tracks' },
  { word: 'plane', emoji: '✈️', definition: 'A vehicle that flies in the sky' },
  { word: 'boat', emoji: '⛵', definition: 'A vehicle that floats on water' },
  { word: 'rocket', emoji: '🚀', definition: 'A vehicle that goes to space' },

  // Bonus Foods
  { word: 'pizza', emoji: '🍕', definition: 'A yummy food with cheese and toppings' },
  { word: 'ice cream', emoji: '🍦', definition: 'A cold and sweet frozen treat' },
  { word: 'donut', emoji: '🍩', definition: 'A sweet round treat with a hole' },
  { word: 'popcorn', emoji: '🍿', definition: 'A crunchy snack we eat at movies' },
  { word: 'hotdog', emoji: '🌭', definition: 'A sausage in a soft bun' },
];

type GameMode = 'menu' | 'word-match' | 'spelling-bee' | 'memory-cards' | 'word-builder';

interface MatchItem {
  word: string;
  emoji: string;
  definition: string;
}

interface MemoryCard {
  id: number;
  content: string;  // Either emoji or word
  type: 'emoji' | 'word';  // Type of card
  pairId: string;  // Identifier to match pairs
  isFlipped: boolean;
  isMatched: boolean;
}

export default function VocabularyGame() {
  // Game state
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [showTryAgain, setShowTryAgain] = useState(false);

  // Word Match state
  const [matchWords, setMatchWords] = useState<MatchItem[]>([]);
  const [matchEmojis, setMatchEmojis] = useState<MatchItem[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<string[]>([]);

  // Spelling Bee state
  const [currentSpellingWord, setCurrentSpellingWord] = useState<MatchItem | null>(null);
  const [spellingInput, setSpellingInput] = useState('');
  const [spellingFeedback, setSpellingFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Memory Cards state
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [canFlip, setCanFlip] = useState(true);

  // Word Builder state
  const [builderWord, setBuilderWord] = useState<MatchItem | null>(null);
  const [availableLetters, setAvailableLetters] = useState<string[]>([]);
  const [placedLetters, setPlacedLetters] = useState<string[]>([]);

  // XP Animation state
  const [showXPAnimation, setShowXPAnimation] = useState(false);
  const [xpGained, setXpGained] = useState(0);

  // Enhanced celebration effect with massive confetti
  const triggerConfetti = () => {
    // Center burst - massive explosion
    confetti({
      particleCount: 200,
      spread: 160,
      origin: { y: 0.5 },
      colors: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9333EA']
    });

    // Side bursts for extra wow factor
    setTimeout(() => {
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700', '#FFA500']
      });
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FF69B4', '#00CED1']
      });
    }, 300);
  };

  // Award XP to user with animation
  const awardXP = async (xpAmount: number) => {
    try {
      // Show XP animation
      setXpGained(xpAmount);
      setShowXPAnimation(true);

      // Hide after 2 seconds
      setTimeout(() => {
        setShowXPAnimation(false);
      }, 2000);

      // Get user from Supabase session
      const { supabase } = await import('@/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user?.id) {
        console.error('No user session found');
        return;
      }

      const response = await fetch('/api/user/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.user.id,
          xpGained: xpAmount
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Awarded ${xpAmount} XP! Total: ${data.xp} XP, Level: ${data.level}`);
      }
    } catch (error) {
      console.error('Failed to award XP:', error);
    }
  };

  // Initialize Word Match game
  const initMatchGame = () => {
    const selected = vocabularyBank
      .sort(() => Math.random() - 0.5)
      .slice(0, 6); // Fixed to 6 items per round

    setMatchWords([...selected].sort(() => Math.random() - 0.5));
    setMatchEmojis([...selected].sort(() => Math.random() - 0.5));
    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedEmoji(null);
  };

  // Initialize Spelling Bee game
  const initSpellingGame = () => {
    const randomWord = vocabularyBank[Math.floor(Math.random() * vocabularyBank.length)];
    setCurrentSpellingWord(randomWord);
    setSpellingInput('');
    setSpellingFeedback(null);
  };

  // Initialize Memory Cards game
  const initMemoryGame = () => {
    const selected = vocabularyBank
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    const cards: MemoryCard[] = [];
    selected.forEach((item, index) => {
      // Create emoji card
      cards.push({
        id: index * 2,
        content: item.emoji,
        type: 'emoji',
        pairId: item.word,
        isFlipped: false,
        isMatched: false
      });
      // Create word card
      cards.push({
        id: index * 2 + 1,
        content: item.word,
        type: 'word',
        pairId: item.word,
        isFlipped: false,
        isMatched: false
      });
    });

    setMemoryCards(cards.sort(() => Math.random() - 0.5));
    setFlippedCards([]);
  };

  // Initialize Word Builder game
  const initWordBuilderGame = () => {
    const randomWord = vocabularyBank[Math.floor(Math.random() * vocabularyBank.length)];
    setBuilderWord(randomWord);

    // Create scrambled letters with extras (all correct letters + incorrect ones)
    const letters = randomWord.word.split(''); // Preserves all letters including duplicates

    // Add 5-7 random incorrect letters to make it challenging
    const numExtraLetters = Math.floor(Math.random() * 3) + 5; // 5-7 extra letters
    const extraLetters = 'abcdefghijklmnopqrstuvwxyz'
      .split('')
      .filter(l => !letters.includes(l)) // Only letters NOT in the word
      .sort(() => Math.random() - 0.5)
      .slice(0, numExtraLetters);

    // Combine and shuffle all letters
    setAvailableLetters([...letters, ...extraLetters].sort(() => Math.random() - 0.5));
    setPlacedLetters([]);
  };

  // Handle Word Match selection
  const handleWordSelect = (word: string) => {
    if (matchedPairs.includes(word)) return;
    setSelectedWord(word);
  };

  const handleEmojiSelect = (emoji: string) => {
    const emojiItem = matchEmojis.find(e => e.emoji === emoji);
    if (!emojiItem || matchedPairs.includes(emojiItem.word)) return;

    setSelectedEmoji(emoji);
  };

  useEffect(() => {
    if (selectedWord && selectedEmoji) {
      const wordItem = matchWords.find(w => w.word === selectedWord);
      const emojiItem = matchEmojis.find(e => e.emoji === selectedEmoji);

      if (wordItem && emojiItem && wordItem.word === emojiItem.word) {
        // Correct match!
        setMatchedPairs([...matchedPairs, wordItem.word]);
        const xpReward = Math.floor(Math.random() * 4) + 8; // 8-11 XP
        triggerConfetti();
        awardXP(xpReward);

        // Check if all matched
        if (matchedPairs.length + 1 === matchWords.length) {
          setTimeout(() => {
            initMatchGame();
          }, 1500);
        }
      } else {
        // Incorrect - show try again modal
        setShowTryAgain(true);
        setTimeout(() => setShowTryAgain(false), 2000);
      }

      setTimeout(() => {
        setSelectedWord(null);
        setSelectedEmoji(null);
      }, 500);
    }
  }, [selectedWord, selectedEmoji]);

  // Handle Spelling Bee submission
  const handleSpellingSubmit = () => {
    if (!currentSpellingWord) return;

    if (spellingInput.toLowerCase() === currentSpellingWord.word.toLowerCase()) {
      setSpellingFeedback('correct');
      const xpReward = Math.floor(Math.random() * 4) + 21; // 21-24 XP
      triggerConfetti();
      awardXP(xpReward);
      setTimeout(() => {
        initSpellingGame();
      }, 1500);
    } else {
      setSpellingFeedback('incorrect');
      setShowTryAgain(true);
      setTimeout(() => {
        setShowTryAgain(false);
        setSpellingFeedback(null);
        setSpellingInput('');
      }, 2000);
    }
  };

  // Handle Memory Card flip
  const handleCardFlip = (id: number) => {
    if (!canFlip || flippedCards.includes(id) || memoryCards[id].isMatched) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      const [first, second] = newFlipped;

      if (memoryCards[first].pairId === memoryCards[second].pairId) {
        // Match found!
        setTimeout(() => {
          const updatedCards = [...memoryCards];
          updatedCards[first].isMatched = true;
          updatedCards[second].isMatched = true;
          setMemoryCards(updatedCards);
          setFlippedCards([]);
          setCanFlip(true);
          const xpReward = Math.floor(Math.random() * 4) + 2; // 2-5 XP
          triggerConfetti();
          awardXP(xpReward);

          // Check if all matched
          if (updatedCards.every(card => card.isMatched)) {
            setTimeout(() => {
              initMemoryGame();
            }, 1500);
          }
        }, 500);
      } else {
        // No match - show try again modal
        setTimeout(() => {
          setFlippedCards([]);
          setCanFlip(true);
          setShowTryAgain(true);
          setTimeout(() => setShowTryAgain(false), 2000);
        }, 1000);
      }
    }
  };

  // Handle Word Builder
  const handleLetterPlace = (letter: string, index: number) => {
    setAvailableLetters(availableLetters.filter((_, i) => i !== index));
    setPlacedLetters([...placedLetters, letter]);
  };

  const handleLetterRemove = (index: number) => {
    const letter = placedLetters[index];
    setPlacedLetters(placedLetters.filter((_, i) => i !== index));
    setAvailableLetters([...availableLetters, letter]);
  };

  useEffect(() => {
    if (builderWord && placedLetters.join('').toLowerCase() === builderWord.word.toLowerCase()) {
      const xpReward = Math.floor(Math.random() * 4) + 14; // 14-17 XP
      triggerConfetti();
      awardXP(xpReward);
      setTimeout(() => {
        initWordBuilderGame();
      }, 1500);
    }
  }, [placedLetters]);

  // Reset game
  const resetGame = () => {
    setGameMode('menu');
  };

  // Start game
  const startGame = (mode: GameMode) => {
    setGameMode(mode);

    switch (mode) {
      case 'word-match':
        initMatchGame();
        break;
      case 'spelling-bee':
        initSpellingGame();
        break;
      case 'memory-cards':
        initMemoryGame();
        break;
      case 'word-builder':
        initWordBuilderGame();
        break;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Game Content */}
      <div>
        <AnimatePresence mode="wait">
          {gameMode === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Word Match */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame('word-match')}
                className="relative rounded-3xl p-8 cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(216, 180, 254, 0.25)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(216, 180, 254, 0.3)',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)'
                }}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                <motion.div
                  className="absolute top-4 right-4 text-6xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎯
                </motion.div>
                <div className="relative">
                  <h3 className="text-2xl font-black text-purple-900 mb-2">Word Match</h3>
                  <p className="text-purple-800 font-bold mb-4">Match words with emojis</p>
                  <div className="flex items-center gap-2 text-purple-700 text-sm font-bold">
                    <Award className="w-4 h-4" />
                    <span>8-11 XP per match</span>
                  </div>
                </div>
              </motion.div>

              {/* Spelling Bee */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame('spelling-bee')}
                className="relative rounded-3xl p-8 cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(254, 240, 138, 0.25)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)'
                }}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                <motion.div
                  className="absolute top-4 right-4 text-6xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  📝
                </motion.div>
                <div className="relative">
                  <h3 className="text-2xl font-black text-orange-900 mb-2">Spelling Bee</h3>
                  <p className="text-orange-800 font-bold mb-4">Type the correct spelling</p>
                  <div className="flex items-center gap-2 text-orange-700 text-sm font-bold">
                    <Award className="w-4 h-4" />
                    <span>21-24 XP per word</span>
                  </div>
                </div>
              </motion.div>

              {/* Memory Cards */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame('memory-cards')}
                className="relative rounded-3xl p-8 cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(251, 207, 232, 0.25)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(244, 114, 182, 0.3)',
                  boxShadow: '0 8px 32px rgba(236, 72, 153, 0.15)'
                }}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                <motion.div
                  className="absolute top-4 right-4 text-6xl"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🧩
                </motion.div>
                <div className="relative">
                  <h3 className="text-2xl font-black text-rose-900 mb-2">Memory Cards</h3>
                  <p className="text-rose-800 font-bold mb-4">Find matching pairs</p>
                  <div className="flex items-center gap-2 text-rose-700 text-sm font-bold">
                    <Award className="w-4 h-4" />
                    <span>2-5 XP per pair</span>
                  </div>
                </div>
              </motion.div>

              {/* Word Builder */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startGame('word-builder')}
                className="relative rounded-3xl p-8 cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(191, 219, 254, 0.25)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.15)'
                }}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />

                <motion.div
                  className="absolute top-4 right-4 text-6xl"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🔤
                </motion.div>
                <div className="relative">
                  <h3 className="text-2xl font-black text-cyan-900 mb-2">Word Builder</h3>
                  <p className="text-cyan-800 font-bold mb-4">Build words from letters</p>
                  <div className="flex items-center gap-2 text-cyan-700 text-sm font-bold">
                    <Award className="w-4 h-4" />
                    <span>14-17 XP per word</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Word Match Game */}
          {gameMode === 'word-match' && (
            <motion.div
              key="word-match"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-purple-900 mb-2">Match Words & Emojis</h2>
                <p className="text-gray-600 font-bold">Tap a word, then tap its matching emoji!</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Words column */}
                <div className="space-y-3">
                  {matchWords.map((item) => {
                    const isMatched = matchedPairs.includes(item.word);
                    const isSelected = selectedWord === item.word;

                    return (
                      <motion.button
                        key={item.word}
                        onClick={() => handleWordSelect(item.word)}
                        disabled={isMatched}
                        whileHover={{ scale: isMatched ? 1 : 1.05 }}
                        whileTap={{ scale: isMatched ? 1 : 0.95 }}
                        className={`w-full h-20 flex items-center justify-center rounded-2xl font-black text-2xl transition-all ${
                          isMatched
                            ? 'bg-green-200 text-green-700 opacity-50'
                            : isSelected
                            ? 'bg-blue-500 text-white shadow-lg scale-105'
                            : 'bg-white text-gray-800 hover:bg-blue-50 shadow-md'
                        }`}
                      >
                        {item.word}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Emojis column */}
                <div className="space-y-3">
                  {matchEmojis.map((item) => {
                    const isMatched = matchedPairs.includes(item.word);
                    const isSelected = selectedEmoji === item.emoji;

                    return (
                      <motion.button
                        key={item.emoji}
                        onClick={() => handleEmojiSelect(item.emoji)}
                        disabled={isMatched}
                        whileHover={{ scale: isMatched ? 1 : 1.05 }}
                        whileTap={{ scale: isMatched ? 1 : 0.95 }}
                        className={`w-full h-20 flex items-center justify-center rounded-2xl text-4xl transition-all ${
                          isMatched
                            ? 'bg-green-200 opacity-50'
                            : isSelected
                            ? 'bg-purple-500 shadow-lg scale-105'
                            : 'bg-white hover:bg-purple-50 shadow-md'
                        }`}
                      >
                        {item.emoji}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Spelling Bee Game */}
          {gameMode === 'spelling-bee' && currentSpellingWord && (
            <motion.div
              key="spelling-bee"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-yellow-900 mb-2">Spelling Bee</h2>
                <p className="text-gray-600 font-bold">Type the correct spelling of the word!</p>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-br from-yellow-200 to-orange-200 rounded-3xl p-12 mb-6 text-center shadow-xl"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-9xl mb-4"
                >
                  {currentSpellingWord.emoji}
                </motion.div>
                <p className="text-xl font-bold text-gray-700">
                  {currentSpellingWord.definition}
                </p>
              </motion.div>

              <div className="relative">
                <input
                  type="text"
                  value={spellingInput}
                  onChange={(e) => setSpellingInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSpellingSubmit()}
                  placeholder="Type the word here..."
                  className={`w-full p-6 rounded-2xl text-2xl font-black text-center border-4 transition-all ${
                    spellingFeedback === 'correct'
                      ? 'border-green-500 bg-green-50'
                      : spellingFeedback === 'incorrect'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white focus:border-blue-500'
                  }`}
                  autoFocus
                />

                <motion.button
                  onClick={handleSpellingSubmit}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full mt-4 bg-gradient-to-br from-yellow-400 to-orange-500 text-white p-6 rounded-2xl font-black text-xl shadow-lg"
                >
                  Check Answer
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Memory Cards Game */}
          {gameMode === 'memory-cards' && (
            <motion.div
              key="memory-cards"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black text-pink-900 mb-2">Memory Cards</h2>
                <p className="text-gray-600 font-bold">Find matching emoji pairs!</p>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {memoryCards.map((card, index) => (
                  <motion.button
                    key={card.id}
                    onClick={() => handleCardFlip(index)}
                    whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                    whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                    className="aspect-square"
                  >
                    <motion.div
                      className="relative w-full h-full"
                      animate={{
                        rotateY: flippedCards.includes(index) || card.isMatched ? 180 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* Card back */}
                      <div
                        className="absolute inset-0 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ backfaceVisibility: 'hidden' }}
                      >
                        <Sparkles className="w-8 h-8 text-white" />
                      </div>

                      {/* Card front */}
                      <div
                        className={`absolute inset-0 rounded-2xl flex items-center justify-center shadow-lg ${
                          card.isMatched ? 'bg-green-200' : 'bg-white'
                        } ${card.type === 'emoji' ? 'text-5xl' : 'text-xl font-black text-gray-800'}`}
                        style={{
                          backfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)'
                        }}
                      >
                        {card.content}
                      </div>
                    </motion.div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Word Builder Game */}
          {gameMode === 'word-builder' && builderWord && (
            <motion.div
              key="word-builder"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-blue-900 mb-2">Word Builder</h2>
                <p className="text-gray-600 font-bold">Build the word from the letters!</p>
              </div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-br from-blue-200 to-cyan-200 rounded-3xl p-12 mb-6 text-center shadow-xl"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-9xl mb-4"
                >
                  {builderWord.emoji}
                </motion.div>
                <p className="text-xl font-bold text-gray-700">
                  {builderWord.definition}
                </p>
              </motion.div>

              {/* Word building area */}
              <div className="bg-white rounded-2xl p-6 mb-6 min-h-24 shadow-lg">
                <div className="flex flex-wrap gap-2 justify-center">
                  {placedLetters.length === 0 ? (
                    <div className="text-gray-400 font-bold">Tap letters below to build the word</div>
                  ) : (
                    placedLetters.map((letter, index) => (
                      <motion.button
                        key={index}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        onClick={() => handleLetterRemove(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-blue-500 text-white font-black text-2xl w-14 h-14 rounded-xl shadow-lg"
                      >
                        {letter}
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              {/* Available letters */}
              <div className="flex flex-wrap gap-2 justify-center">
                {availableLetters.map((letter, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleLetterPlace(letter, index)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-black text-2xl w-14 h-14 rounded-xl shadow-lg"
                  >
                    {letter}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Try Again Modal */}
      <AnimatePresence>
        {showTryAgain && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-gradient-to-br from-orange-400 to-red-500 rounded-3xl p-8 md:p-12 shadow-2xl max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Animated background elements */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
              />

              {/* Content */}
              <div className="relative z-10">
                <motion.div
                  animate={{
                    rotate: [-10, 10, -10],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-8xl mb-4"
                >
                  😅
                </motion.div>

                <h3 className="text-4xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
                  Oops!
                </h3>

                <p className="text-xl md:text-2xl font-black text-white/90">
                  Try Again!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* XP Gain Animation */}
      <AnimatePresence>
        {showXPAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-3xl border-4 border-yellow-500 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-600" />
                <motion.span
                  className="text-5xl font-black text-orange-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ delay: 0.2, duration: 0.6, ease: 'backOut' }}
                >
                  +{Math.round(xpGained)} XP
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
