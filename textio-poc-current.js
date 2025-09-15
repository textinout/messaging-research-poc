import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';

// Dictionary and transformation data
const DICT = {
  "man": ["Man is really helpful", "The man walked quickly", "Every man needs respect"],
  "i": ["I hope you understand", "I think this works", "I wanted to tell you"],
  "am": ["I am excited about this", "Am I doing this right", "I am here for you"],
  "not": ["This is not correct", "I'm not ready yet", "Not everything works perfectly"],
  "sure": ["I'm sure about this", "Are you sure today", "Sure thing buddy"],
  "if": ["If this works well", "What if we try", "If only we knew"],
  "this": ["This approach works well", "I like this idea", "This seems right"],
  "a": ["This is a good idea", "I need a quick answer", "A simple solution works"],
  "cool": ["The weather is cool", "That's really cool stuff", "Cool idea for sure"],
  "idea": ["This is a good idea", "Great idea for today", "The idea works well"],
  "or": ["This or that works", "Red or blue color", "Now or never time"]
};

const TRANSFORMATIONS = {
  synonyms: {
    "good": ["great", "nice", "fine", "well", "awesome"],
    "cool": ["nice", "great", "awesome", "sweet", "neat"],
    "idea": ["plan", "thought", "concept", "notion"],
    "sure": ["certain", "confident", "positive", "definite"]
  },
  antonyms: {
    "good": ["bad", "poor", "awful", "terrible"],
    "cool": ["hot", "warm", "heated", "burning"],
    "sure": ["unsure", "uncertain", "doubtful"],
    "not": ["definitely", "certainly", "absolutely"]
  },
  contractions: {
    "I am": "I'm",
    "do not": "don't",
    "is not": "isn't"
  }
};

// Build search index
const buildIndex = () => {
  const idx = {};
  Object.entries(DICT).forEach(([word, examples]) => {
    examples.forEach(example => {
      const wordsInExample = example.toLowerCase().replace(/[.,!?]/g, '').split(' ').filter(w => w.length > 0);
      wordsInExample.forEach(w => {
        if (!idx[w]) idx[w] = [];
        idx[w].push({ sentence: example, words: wordsInExample });
      });
    });
  });
  return idx;
};

const INDEX = buildIndex();

const PLATFORMS = [
  { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
  { id: 'telegram', name: 'Telegram', icon: '✈️' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'discord', name: 'Discord', icon: '🎮' }
];

// Enhanced transformation with proper capitalization handling
const smartTransform = (sentence, targetWord, log) => {
  const targetLower = targetWord.toLowerCase();
  const isCapitalized = targetWord[0] === targetWord[0].toUpperCase();
  
  // Check if word already exists (case insensitive)
  const sentenceWords = sentence.toLowerCase().replace(/[.,!?]/g, '').split(' ');
  if (sentenceWords.includes(targetLower)) {
    const regex = new RegExp(`\\b${targetLower}\\b`, 'gi');
    const result = sentence.replace(regex, targetWord);
    return { sentence: result, transformations: [], success: true };
  }
  
  // For capitalized words, try special positioning
  if (isCapitalized) {
    const firstWordMatch = sentence.match(/^(\w+)(\s+)/);
    if (firstWordMatch) {
      const newSentence = `${targetWord}${firstWordMatch[2]}${sentence.slice(firstWordMatch[0].length)}`;
      log.push(`🔤 POSITION: Placed "${targetWord}" at sentence start`);
      return { 
        sentence: newSentence, 
        transformations: [`positioned: ${targetWord} at start`], 
        success: true 
      };
    }
    
    const introSentence = `${targetWord}, ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
    log.push(`🔤 INTRO: Added "${targetWord}" as introduction`);
    return { 
      sentence: introSentence, 
      transformations: [`intro: ${targetWord} added`], 
      success: true 
    };
  }
  
  // Try transformation strategies for non-capitalized words
  for (const [category, mappings] of Object.entries(TRANSFORMATIONS)) {
    for (const [sourceWord, targets] of Object.entries(mappings)) {
      if (targets.includes(targetLower) && sentence.toLowerCase().includes(sourceWord)) {
        const regex = new RegExp(`\\b${sourceWord}\\b`, 'gi');
        const newSentence = sentence.replace(regex, targetWord);
        log.push(`✨ ${category.toUpperCase()}: ${sourceWord} → ${targetWord}`);
        return { 
          sentence: newSentence, 
          transformations: [`${category}: ${sourceWord} → ${targetWord}`], 
          success: true 
        };
      }
    }
  }
  
  return { sentence, transformations: [], success: false };
};

// Enhanced coverage algorithm
const findSmartCoverage = (targetWords) => {
  const results = [];
  let remaining = [...targetWords];
  const transformLog = [];
  
  while (remaining.length > 0 && results.length < 4) {
    let bestSentence = null;
    let maxCovered = 0;
    let coveredWords = [];
    let bestTransform = null;
    
    // Try exact matches first
    remaining.forEach(word => {
      if (INDEX[word.toLowerCase()]) {
        INDEX[word.toLowerCase()].forEach(entry => {
          const matched = remaining.filter(w => 
            entry.words.includes(w.toLowerCase())
          );
          if (matched.length > maxCovered) {
            maxCovered = matched.length;
            bestSentence = entry.sentence;
            coveredWords = matched;
            bestTransform = null;
          }
        });
      }
    });
    
    // If no exact match, try transformations
    if (maxCovered === 0) {
      for (const targetWord of remaining) {
        Object.values(INDEX).flat().forEach(entry => {
          const transformResult = smartTransform(entry.sentence, targetWord, transformLog);
          if (transformResult.success) {
            const transformedWords = transformResult.sentence.toLowerCase()
              .replace(/[.,!?]/g, '').split(' ');
            const matched = remaining.filter(w => 
              transformedWords.includes(w.toLowerCase())
            );
            if (matched.length > maxCovered) {
              maxCovered = matched.length;
              bestSentence = entry.sentence;
              bestTransform = transformResult;
              coveredWords = matched;
            }
          }
        });
      }
    }
    
    if (maxCovered > 0) {
      const finalSentence = bestTransform ? bestTransform.sentence : bestSentence;
      
      // Apply original capitalization
      let processedSentence = finalSentence;
      coveredWords.forEach(word => {
        const original = targetWords.find(w => w.toLowerCase() === word.toLowerCase());
        if (original && original !== word) {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          processedSentence = processedSentence.replace(regex, original);
        }
      });
      
      results.push({
        text: processedSentence,
        covered: coveredWords.map(w => targetWords.find(orig => orig.toLowerCase() === w.toLowerCase()) || w),
        transformations: bestTransform ? bestTransform.transformations : [],
        wasTransformed: !!bestTransform
      });
      
      // Remove covered words
      remaining = remaining.filter(w => 
        !coveredWords.some(c => c.toLowerCase() === w.toLowerCase())
      );
    } else {
      // Fallback for remaining words
      results.push({
        text: `I wanted to mention ${remaining.join(' ')} today`,
        covered: remaining,
        transformations: [],
        wasTransformed: false,
        fallback: true
      });
      remaining = [];
    }
  }
  
  return { results, transformLog };
};

const TextioCapitalizationPOC = () => {
  const [message, setMessage] = useState('Man, I am not sure if this a cool idea or not');
  const [wordsPerPlatform, setWordsPerPlatform] = useState(6);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [results, setResults] = useState([]);
  const [step, setStep] = useState(1);
  const [log, setLog] = useState([]);

  const parseWords = (text) => text.replace(/[.,!?]/g, '').split(' ').filter(w => w.length > 0);

  const generateEnhanced = () => {
    const words = parseWords(message);
    const platformCount = Math.ceil(words.length / wordsPerPlatform);
    const newResults = [];
    const newLog = [`Processing: ${words.join(', ')}`];
    const allTransformLog = [];
    
    for (let i = 0; i < platformCount; i++) {
      const start = i * wordsPerPlatform;
      const end = Math.min(start + wordsPerPlatform, words.length);
      const assigned = words.slice(start, end);
      
      if (assigned.length === 0) break;
      
      newLog.push(`Platform ${i + 1}: [${assigned.join(', ')}]`);
      
      const coverageResult = findSmartCoverage(assigned);
      const platform = selectedPlatforms[i] || PLATFORMS[i % PLATFORMS.length];
      
      // Combine sentences
      const separators = ['. ', '; ', ', '];
      const sep = separators[i % separators.length];
      const combinedText = coverageResult.results.map(r => r.text).join(sep);
      const allCovered = coverageResult.results.flatMap(r => r.covered);
      const transformCount = coverageResult.results.filter(r => r.wasTransformed).length;
      
      newResults.push({
        platform,
        text: combinedText,
        assigned,
        covered: allCovered,
        sentenceCount: coverageResult.results.length,
        transformedSentences: transformCount,
        transformations: coverageResult.results.flatMap(r => r.transformations)
      });
      
      newLog.push(`Result: ${allCovered.length}/${assigned.length} covered, ${transformCount} transformed`);
      allTransformLog.push(...coverageResult.transformLog);
    }
    
    newLog.push('=== TRANSFORMATIONS ===');
    newLog.push(...allTransformLog);
    
    setResults(newResults);
    setLog(newLog);
    setStep(2);
  };

  const reset = () => {
    setMessage('Man, I am not sure if this a cool idea or not');
    setResults([]);
    setLog([]);
    setStep(1);
    setSelectedPlatforms([]);
  };

  const togglePlatform = (platform) => {
    setSelectedPlatforms(prev => {
      const exists = prev.some(p => p.id === platform.id);
      return exists 
        ? prev.filter(p => p.id !== platform.id)
        : [...prev, platform];
    });
  };

  const requiredPlatforms = () => Math.max(1, Math.ceil(parseWords(message).length / wordsPerPlatform));

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {/* iPhone-style frame */}
      <div className="relative">
        {/* Phone outer frame */}
        <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
          {/* Phone screen */}
          <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
            {/* Status bar */}
            <div className="bg-white h-6 flex justify-between items-center px-6 text-xs font-medium">
              <span>9:41</span>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-2 border border-black rounded-sm">
                  <div className="w-3 h-1 bg-black rounded-sm m-0.5"></div>
                </div>
              </div>
            </div>
            
            {/* App content area */}
            <div className="h-[calc(100%-1.5rem)] overflow-y-auto p-4 bg-white">
              <div className="mb-4 text-center">
                <h1 className="text-lg font-bold mb-1">Textio Enhanced v3</h1>
                <p className="text-gray-600 text-sm">Smart capitalization handling</p>
              </div>

              {step === 1 && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Test Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-2 border rounded-lg text-sm h-16"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Words: {parseWords(message).length}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Words per Platform</label>
                    <select
                      value={wordsPerPlatform}
                      onChange={(e) => setWordsPerPlatform(parseInt(e.target.value))}
                      className="w-full p-2 border rounded-lg text-sm"
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>
                          {num} words ({Math.ceil(parseWords(message).length / num)} platforms)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select {requiredPlatforms()} Platforms
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PLATFORMS.map(platform => (
                        <button
                          key={platform.id}
                          onClick={() => togglePlatform(platform)}
                          className={`p-2 border rounded text-xs ${
                            selectedPlatforms.some(p => p.id === platform.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-300'
                          }`}
                        >
                          {platform.icon} {platform.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedPlatforms.length >= requiredPlatforms() && (
                    <button
                      onClick={generateEnhanced}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium text-sm"
                    >
                      Generate
                    </button>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  <div className="bg-green-50 p-3 rounded-lg">
                    <h3 className="font-medium text-green-800 text-sm">Algorithm Results</h3>
                    <p className="text-green-700 text-xs">Enhanced capitalization handling</p>
                  </div>

                  <div className="bg-gray-50 p-2 rounded-lg">
                    <h4 className="font-medium mb-1 text-sm">Algorithm Log:</h4>
                    <div className="max-h-24 overflow-y-auto">
                      {log.slice(0, 5).map((entry, i) => (
                        <p key={i} className="text-xs font-mono text-gray-700">{entry}</p>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {results.map((item, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <span className="text-sm mr-2">{item.platform.icon}</span>
                            <span className="font-medium text-sm">{item.platform.name}</span>
                          </div>
                          <div className="text-xs flex gap-1">
                            {item.transformedSentences > 0 && (
                              <span className="px-1 py-0.5 rounded text-xs bg-purple-100 text-purple-800">
                                {item.transformedSentences} enhanced
                              </span>
                            )}
                            <span className="text-gray-600">
                              {item.covered.length}/{item.assigned.length}
                            </span>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-2 rounded mb-2">
                          <p className="text-gray-800 text-sm">"{item.text}"</p>
                        </div>
                        
                        <div className="text-xs space-y-1">
                          <p><strong>Assigned:</strong> {item.assigned.join(', ')}</p>
                          <p><strong>Covered:</strong> {item.covered.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={reset}
                    className="w-full border border-gray-300 py-2 rounded-lg text-sm"
                  >
                    Test Another Message
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
      </div>
    </div>
  );
};

export default TextioCapitalizationPOC;
