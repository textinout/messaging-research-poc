import React, { useState, useEffect } from 'react';
import { Send, MessageCircle, Smartphone, AlertCircle, CheckCircle2, Play, Pause, RotateCcw, Settings, Zap, Shield } from 'lucide-react';

const ENHANCED_DICT = {
  "hello": ["Hello there friend", "Hello everyone today", "Hello from my side"],
  "how": ["How are you doing", "How was your day", "How about we meet"],
  "are": ["You are looking great", "We are doing well", "Things are going smoothly"],
  "you": ["You seem happy today", "Hope you understand this", "Did you see that"],
  "today": ["Today feels special somehow", "What happened today exactly", "Today was quite interesting"],
  "great": ["That sounds really great", "Great idea for sure", "This is great news"],
  "meeting": ["The meeting went well", "Our meeting is scheduled", "After the meeting today"],
  "project": ["This project looks promising", "Our project needs attention", "The project deadline approaches"]
};

const PLATFORMS = [
  { id: 'chatflow', name: 'ChatFlow', icon: '💬', color: 'bg-green-500' },
  { id: 'quickmsg', name: 'QuickMsg', icon: '✈️', color: 'bg-blue-500' },
  { id: 'teamtalk', name: 'TeamTalk', icon: '🎮', color: 'bg-purple-500' },
  { id: 'biznet', name: 'BizNet', icon: '💼', color: 'bg-blue-600' },
  { id: 'sms', name: 'SMS', icon: '📱', color: 'bg-gray-500' }
];

const DEMO_MODES = [
  { id: 'basic', name: 'Basic Tier', icon: <MessageCircle className="w-4 h-4" />, desc: 'Alphabet letters, whole words only' },
  { id: 'advanced', name: 'Advanced Tier', icon: <Zap className="w-4 h-4" />, desc: 'Full semantic obfuscation' },
  { id: 'enterprise', name: 'Enterprise', icon: <Shield className="w-4 h-4" />, desc: 'Bulk processing' }
];

const SAMPLE_MESSAGES = {
  basic: "Hello how are you today",
  advanced: "Meeting at 3pm for project discussion",
  enterprise: "Quarterly report needs review before deadline"
};

const buildIndex = () => {
  const idx = {};
  Object.entries(ENHANCED_DICT).forEach(([word, examples]) => {
    examples.forEach(example => {
      const wordsInExample = example.toLowerCase().replace(/[.,!?]/g, '').split(' ').filter(w => w.length > 0);
      wordsInExample.forEach(w => {
        if (!idx[w]) idx[w] = [];
        idx[w].push({ sentence: example, words: wordsInExample, sourceWord: word });
      });
    });
  });
  return idx;
};

const INDEX = buildIndex();

const findCoverage = (targetWords) => {
  const results = [];
  let remaining = [...targetWords];
  
  while (remaining.length > 0 && results.length < 4) {
    let bestSentence = null;
    let maxCovered = 0;
    let coveredWords = [];
    
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
          }
        });
      }
    });
    
    if (maxCovered > 0) {
      results.push({
        text: bestSentence,
        covered: coveredWords.map(w => targetWords.find(orig => orig.toLowerCase() === w.toLowerCase()) || w)
      });
      
      remaining = remaining.filter(w => 
        !coveredWords.some(c => c.toLowerCase() === w.toLowerCase())
      );
    } else {
      results.push({
        text: `I wanted to mention ${remaining.join(' ')} today`,
        covered: remaining,
        fallback: true
      });
      remaining = [];
    }
  }
  
  return results;
};

const FixedPhone = ({ type, children }) => (
  <div className="relative" style={{ width: '288px', height: '600px' }}>
    <div 
      className="bg-black rounded-[2.5rem] p-2 shadow-2xl"
      style={{ width: '288px', height: '600px' }}
    >
      <div 
        className="bg-white rounded-[2rem] overflow-hidden relative"
        style={{ width: '272px', height: '584px' }}
      >
        <div 
          className="bg-white flex justify-between items-center px-6 text-xs font-medium border-b"
          style={{ height: '24px' }}
        >
          <span>9:41</span>
          <span className="font-semibold">{type === 'sender' ? 'Sender' : 'Receiver'}</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 border border-black rounded-sm">
              <div className="w-3 h-1 bg-green-500 rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>
        
        <div 
          className="overflow-y-auto"
          style={{ height: '560px' }}
        >
          {children}
        </div>
      </div>
    </div>
    
    <div 
      className="absolute bg-white rounded-full"
      style={{ 
        bottom: '8px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: '112px', 
        height: '4px' 
      }}
    />
  </div>
);

const InfoPopup = ({ show, content, position, arrowDirection }) => {
  if (!show) return null;

  const getPositionClasses = () => {
    switch(position) {
      case 'top-left':
        return 'absolute top-4 left-4';
      case 'top-right':
        return 'absolute top-4 right-4';
      case 'bottom-left':
        return 'absolute bottom-4 left-4';
      case 'bottom-right':
        return 'absolute bottom-4 right-4';
      case 'center-top':
        return 'absolute top-4 left-1/2 transform -translate-x-1/2';
      case 'center-bottom':
        return 'absolute bottom-4 left-1/2 transform -translate-x-1/2';
      case 'top-wide':
        return 'absolute top-4 left-4 right-4';
      default:
        return 'absolute top-1/4 left-1/2 transform -translate-x-1/2';
    }
  };

  return (
    <div className={`${getPositionClasses()} z-50`}>
      <div className={`bg-yellow-50 border-4 border-yellow-400 rounded-xl shadow-2xl p-4 relative ${
        position === 'top-wide' ? 'max-w-4xl' : 'max-w-xs'
      }`}>
        {/* Arrows */}
        {arrowDirection === 'down' && (
          <div className="absolute left-1/2 -bottom-3 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-transparent border-t-yellow-400"></div>
        )}
        {arrowDirection === 'up' && (
          <div className="absolute left-1/2 -top-3 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[12px] border-transparent border-b-yellow-400"></div>
        )}
        {arrowDirection === 'left' && (
          <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-r-[12px] border-transparent border-r-yellow-400"></div>
        )}
        {arrowDirection === 'right' && (
          <div className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-[12px] border-b-[12px] border-l-[12px] border-transparent border-l-yellow-400"></div>
        )}
        
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-yellow-800 text-sm font-bold">!</span>
          </div>
          <div>
            <h4 className="font-bold text-yellow-800 text-sm mb-2">What's Happening</h4>
            <p className="text-yellow-700 text-sm leading-relaxed">{content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TextioDemoFixedPopupsV5 = () => {
  const [selectedMode, setSelectedMode] = useState('basic');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState(SAMPLE_MESSAGES.basic);
  const [wordsPerPlatform, setWordsPerPlatform] = useState(2);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [fragmentationResults, setFragmentationResults] = useState([]);
  const [receivedFragments, setReceivedFragments] = useState([]);
  const [reconstructedMessage, setReconstructedMessage] = useState('');
  const [animationState, setAnimationState] = useState('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [currentFragmentCollection, setCurrentFragmentCollection] = useState(null);
  const [collectionStep, setCollectionStep] = useState('waiting');
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [popupInfo, setPopupInfo] = useState({
    content: '',
    position: 'center',
    arrow: 'down'
  });

  const steps = [
    'Mode Selection',
    'Message Input',
    'Platform Selection', 
    'Fragmentation',
    'Account Validation',
    'Transmission',
    'Reception',
    'Confirmation Signal',
    'SMS Instruction',
    'Reconstruction',
    'Complete',
    'Privacy Achieved'
  ];

  const getStepPopupInfo = (step) => {
    const popupConfigs = {
      1: {
        content: "So now we begin by typing your private message into the sender device. This is the sensitive information that must never be seen in its complete form by any platform or server.",
        position: 'top-right',
        arrow: 'left'
      },
      2: {
        content: "Then this configuration determines how many words get sent to each platform. The fewer words per platform, the more secure your message becomes - but you'll need more platforms.",
        position: 'top-right',
        arrow: 'left'
      },
      3: {
        content: "Next up, the system automatically selects which platforms to use for your message fragments. Each platform will only receive a small, meaningless piece of your message.",
        position: 'top-right',
        arrow: 'left'
      },
      4: {
        content: "Here's where the magic happens! Your original message gets broken apart and each piece is embedded within completely natural-sounding sentences that look like normal conversation.",
        position: 'top-right',
        arrow: 'left'
      },
      5: {
        content: "Now the Textio server validates both sender and receiver accounts and confirms the transmission is authorized. CRITICAL: The server never sees your actual message - only metadata like 'user A wants to send to user B'.",
        position: 'center-top',
        arrow: 'down'
      },
      6: {
        content: "Watch as the fragments travel across different platforms simultaneously. Each platform thinks it's just receiving innocent, everyday conversation - they have no idea they're carrying secret message pieces!",
        position: 'top-left',
        arrow: 'down'
      },
      7: {
        content: "Now comes the manual collection phase on the receiver's device. The person must physically switch between apps, copy each fragment, and paste it into Textio. This human step prevents any automated surveillance!",
        position: 'top-left',
        arrow: 'right'
      },
      8: {
        content: "Once all pieces are collected, something clever happens - the receiver's device sends an invisible confirmation signal back to the sender saying 'I've got all the fragments, ready for final assembly!'",
        position: 'top-wide',
        arrow: 'down'
      },
      9: {
        content: "The final piece of the puzzle! The sender now transmits the reconstruction instructions via SMS, telling the receiver exactly how to put all those fragments back together into the original message.",
        position: 'top-wide',
        arrow: 'down'
      },
      10: {
        content: "And here we see the reconstruction in action! Using those SMS instructions, the receiver's Textio app automatically assembles all the collected fragments back into your original, complete message.",
        position: 'top-wide',
        arrow: 'down'
      },
      11: {
        content: "Mission accomplished! The original message now exists in its complete form on both the sender and receiver devices - and absolutely nowhere else in the digital world. Perfect privacy achieved!",
        position: 'top-wide',
        arrow: 'down'
      }
    };
    
    return popupConfigs[step] || null;
  };

  const showPopupForStep = (step) => {
    const config = getStepPopupInfo(step);
    if (config) {
      setPopupInfo(config);
      setShowInfoPopup(true);
    }
  };

  const hidePopup = () => {
    setShowInfoPopup(false);
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        processStep(currentStep + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep]);

  const processStep = (step) => {
    setAnimationState('processing');
    
    setTimeout(() => {
      showPopupForStep(step);
    }, 200);
    
    switch(step) {
      case 1:
        break;
      case 2:
        autoSelectPlatforms();
        break;
      case 3:
        generateFragmentation();
        break;
      case 4:
        simulateAccountValidation();
        break;
      case 5:
        simulateTransmission();
        break;
      case 6:
        simulateReception();
        break;
      case 7:
        simulateConfirmationSignal();
        break;
      case 8:
        simulateSMSInstruction();
        break;
      case 9:
        simulateReconstruction();
        break;
      case 10:
        setTimeout(() => {
          setFragmentationResults([]);
          setReceivedFragments([]);
          setCurrentFragmentCollection(null);
        }, 1000);
        break;
      default:
        break;
    }
    
    setTimeout(() => setAnimationState('idle'), 1000);
  };

  const autoSelectPlatforms = () => {
    const words = message.split(' ').filter(w => w.length > 0);
    const needed = Math.ceil(words.length / wordsPerPlatform);
    const selected = PLATFORMS.slice(0, Math.min(needed, 4));
    setSelectedPlatforms(selected);
  };

  const generateFragmentation = () => {
    const words = message.split(' ').filter(w => w.length > 0);
    const platformCount = Math.ceil(words.length / wordsPerPlatform);
    const results = [];
    
    for (let i = 0; i < platformCount; i++) {
      const start = i * wordsPerPlatform;
      const end = Math.min(start + wordsPerPlatform, words.length);
      const assigned = words.slice(start, end);
      
      if (assigned.length === 0) break;
      
      const coverageResult = findCoverage(assigned);
      const platform = selectedPlatforms[i] || PLATFORMS[i % PLATFORMS.length];
      
      const combinedText = coverageResult.map(r => r.text).join('. ');
      const allCovered = coverageResult.flatMap(r => r.covered);
      
      results.push({
        platform,
        text: combinedText,
        assigned,
        covered: allCovered,
        fragmentId: i + 1,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    
    results.push({
      platform: PLATFORMS.find(p => p.id === 'sms'),
      text: `Reconstruct: fragments 1-${results.length} in order`,
      assigned: ['instruction'],
      covered: ['instruction'],
      fragmentId: 'SMS',
      timestamp: new Date().toLocaleTimeString(),
      isInstruction: true
    });
    
    setFragmentationResults(results);
  };

  const simulateAccountValidation = () => {
    setAnimationState('validating');
  };

  const simulateTransmission = () => {
    setAnimationState('transmitting');
  };

  const simulateReception = () => {
    setReceivedFragments([]);
    const nonSMSFragments = fragmentationResults.filter(f => !f.isInstruction);
    
    nonSMSFragments.forEach((fragment, index) => {
      setTimeout(() => {
        setCurrentFragmentCollection(fragment);
        setCollectionStep('switching');
        
        setTimeout(() => setCollectionStep('copying'), 2000);
        setTimeout(() => setCollectionStep('pasting'), 4500);
        setTimeout(() => {
          setCollectionStep('complete');
          setReceivedFragments(prev => [...prev, fragment]);
          setCurrentFragmentCollection(null);
          setCollectionStep('waiting');
        }, 6500);
        
      }, index * 7000);
    });
  };

  const simulateConfirmationSignal = () => {
    setAnimationState('confirming');
  };

  const simulateSMSInstruction = () => {
    setAnimationState('sms-sending');
    const smsFragment = fragmentationResults.find(f => f.isInstruction);
    if (smsFragment) {
      setTimeout(() => {
        setReceivedFragments(prev => [...prev, smsFragment]);
      }, 1000);
    }
  };

  const simulateReconstruction = () => {
    setTimeout(() => {
      const textFragments = fragmentationResults.filter(f => !f.isInstruction);
      const reconstructed = textFragments.flatMap(f => f.covered).join(' ');
      setReconstructedMessage(reconstructed);
    }, 1000);
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      hidePopup();
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      processStep(newStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      hidePopup();
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setFragmentationResults([]);
    setReceivedFragments([]);
    setReconstructedMessage('');
    setAnimationState('idle');
    hidePopup();
  };

  const handleModeChange = (mode) => {
    setSelectedMode(mode);
    setMessage(SAMPLE_MESSAGES[mode]);
    reset();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      {/* Header Controls */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Textio Complete Workflow Demo
            </h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>
              <button
                onClick={reset}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mb-6 bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold mb-4">Mode Settings</h3>
              
              {selectedMode === 'basic' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <h4 className="font-medium text-blue-800 mb-2">Basic Tier Limitations</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Alphabet letters only (A-Z, a-z)</li>
                    <li>• Whole words fragmentation only</li>
                    <li>• Number strings allowed for SMS instructions</li>
                    <li>• 100 character message limit</li>
                    <li>• Built-in dictionary sentences only</li>
                  </ul>
                </div>
              )}
              
              {selectedMode === 'advanced' && (
                <div className="bg-green-50 border border-green-200 rounded p-3">
                  <h4 className="font-medium text-green-800 mb-2">Advanced Tier Features</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Unlimited message length</li>
                    <li>• Full semantic obfuscation</li>
                    <li>• Letter-level dispersion available</li>
                    <li>• Custom dictionary import</li>
                    <li>• Advanced language options</li>
                  </ul>
                </div>
              )}
              
              {selectedMode === 'enterprise' && (
                <div className="bg-purple-50 border border-purple-200 rounded p-3">
                  <h4 className="font-medium text-purple-800 mb-2">Enterprise Features</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• All Advanced features included</li>
                    <li>• Bulk message processing</li>
                    <li>• API integration capabilities</li>
                    <li>• Custom security policies</li>
                    <li>• Audit trail and analytics</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Mode Selection */}
          <div className="flex space-x-2 mb-4">
            {DEMO_MODES.map(mode => (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                  selectedMode === mode.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {mode.icon}
                <div className="text-left">
                  <div className="font-medium text-sm">{mode.name}</div>
                  <div className="text-xs opacity-70">{mode.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center items-center space-x-2 overflow-x-auto mb-4">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1}
                </div>
                {index === currentStep && (
                  <div className="ml-2 text-sm font-medium whitespace-nowrap">
                    {step}
                  </div>
                )}
                {index < steps.length - 1 && (
                  <div className={`w-6 h-0.5 mx-1 transition-all flex-shrink-0 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Controls */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              disabled={currentStep >= steps.length - 1}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Next Step
            </button>
          </div>
        </div>
      </div>

      {/* Dual Phone Interface with Info Popup */}
      <div className="max-w-6xl mx-auto relative">
        
        {/* Info Popup Component */}
        <InfoPopup 
          show={showInfoPopup}
          content={popupInfo.content}
          position={popupInfo.position}
          arrowDirection={popupInfo.arrow}
        />

        <div className="flex justify-center items-start space-x-8">
          
          {/* Sender Phone */}
          <FixedPhone type="sender">
            <div className="p-4 h-full">
              <div className="text-center mb-4">
                <h2 className="font-bold text-blue-600">Sender Device</h2>
                <p className="text-sm text-gray-600">{selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)} Mode</p>
              </div>

              {/* Final Clean View */}
              {currentStep >= 10 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                    <h3 className="font-bold text-blue-800 mb-2 text-center">Original Message</h3>
                    <div className="bg-white border border-blue-200 rounded p-3">
                      <p className="text-gray-800 font-medium text-center">"{message}"</p>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ✓ The Message is HERE
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Normal workflow steps */}
              {currentStep < 10 && (
                <>
                  {currentStep >= 1 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <textarea
                        value={message}
                        onChange={(e) => {
                          const newMessage = e.target.value;
                          if (selectedMode === 'basic' && newMessage.length > 100) {
                            return;
                          }
                          setMessage(newMessage);
                        }}
                        className="w-full p-2 border rounded-lg text-sm h-16 resize-none"
                        placeholder="Enter your message..."
                        maxLength={selectedMode === 'basic' ? 100 : undefined}
                      />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-gray-500">
                          Words: {message.split(' ').filter(w => w.length > 0).length}
                        </span>
                        {selectedMode === 'basic' && (
                          <span className={`${message.length > 80 ? 'text-red-500' : 'text-gray-500'}`}>
                            {message.length}/100 chars
                          </span>
                        )}
                      </div>
                      
                      {selectedMode === 'basic' && (
                        <div className="mt-2 text-xs text-blue-600">
                          ℹ️ Basic tier: Alphabet letters and whole words only
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep >= 2 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Words per Platform</label>
                      <select
                        value={wordsPerPlatform}
                        onChange={(e) => setWordsPerPlatform(parseInt(e.target.value))}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        {[1,2,3,4,5].map(num => (
                          <option key={num} value={num}>
                            {num} words
                          </option>
                        ))}
                      </select>
                      <div className="text-xs text-gray-500 mt-1">
                        Fewer words = more secure, more platforms needed
                      </div>
                    </div>
                  )}

                  {currentStep >= 3 && selectedPlatforms.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Selected Platforms</label>
                      <div className="space-y-2">
                        {selectedPlatforms.map((platform, index) => (
                          <div key={platform.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <span className="text-lg">{platform.icon}</span>
                            <span className="text-sm font-medium">{platform.name}</span>
                            <span className="text-xs text-gray-500">#{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep >= 4 && fragmentationResults.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Message Fragments</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {fragmentationResults.filter(f => !f.isInstruction).map((fragment, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded border-l-4 border-blue-500">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm">{fragment.platform.icon}</span>
                              <span className="text-xs font-medium">{fragment.platform.name}</span>
                              <span className="text-xs text-gray-500">#{fragment.fragmentId}</span>
                            </div>
                            <p className="text-xs text-gray-700 italic">"{fragment.text}"</p>
                            <div className="mt-1">
                              <span className="text-xs text-blue-600 font-medium">
                                Hidden: {fragment.covered.join(', ')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep >= 5 && animationState === 'validating' && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-100 rounded-full mb-2">
                        <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-orange-700">Server validating accounts...</span>
                      </div>
                      <div className="text-xs text-orange-600 italic">
                        🔒 Server only sees: "User A → User B" (NO message content)
                      </div>
                    </div>
                  )}

                  {currentStep >= 6 && animationState === 'transmitting' && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 rounded-full">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-green-700">Transmitting fragments...</span>
                      </div>
                    </div>
                  )}

                  {currentStep >= 8 && animationState === 'confirming' && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 rounded-full">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Confirmation received</span>
                      </div>
                    </div>
                  )}

                  {currentStep >= 9 && animationState === 'sms-sending' && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 rounded-full">
                        <Send className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Sending SMS instructions...</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </FixedPhone>

          {/* Receiver Phone */}
          <FixedPhone type="receiver">
            <div className="p-4 h-full">
              <div className="text-center mb-4">
                <h2 className="font-bold text-green-600">Receiver Device</h2>
                <p className="text-sm text-gray-600">Collection & Reconstruction</p>
              </div>

              {/* Final Clean View */}
              {currentStep >= 10 && (
                <div className="space-y-4">
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                    <h3 className="font-bold text-green-800 mb-2 text-center">Reconstructed Message</h3>
                    <div className="bg-white border border-green-200 rounded p-3">
                      <p className="text-gray-800 font-medium text-center">"{reconstructedMessage}"</p>
                    </div>
                    <div className="mt-2 text-center">
                      <span className="inline-block bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ✓ The Message is HERE Too
                      </span>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded p-3">
                    <h4 className="font-medium text-red-800 mb-2 text-center">Privacy Achievement</h4>
                    <div className="text-xs text-red-700 space-y-1">
                      <div>✓ Message exists on ONLY 2 devices</div>
                      <div>✓ No platform saw complete message</div>
                      <div>✓ No servers have full content</div>
                      <div>✓ Perfect end-to-end privacy</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Collection Process */}
              {currentStep >= 6 && currentStep < 10 && (
                <>
                  {currentFragmentCollection && (
                    <div className="mb-4">
                      <div className="bg-yellow-50 border border-yellow-300 rounded p-3 mb-3">
                        <h4 className="font-medium text-yellow-800 mb-2">Manual Collection in Progress</h4>
                        
                        {collectionStep === 'switching' && (
                          <div className="text-sm text-yellow-700">
                            <div className="flex items-center space-x-2 mb-2">
                              <Smartphone className="w-4 h-4" />
                              <span>Switching to {currentFragmentCollection.platform.name}...</span>
                            </div>
                            <div className="w-full bg-yellow-200 rounded-full h-2">
                              <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{width: '30%'}}></div>
                            </div>
                          </div>
                        )}
                        
                        {collectionStep === 'copying' && (
                          <div className="text-sm text-yellow-700">
                            <div className="flex items-center space-x-2 mb-2">
                              <span>📋</span>
                              <span>Copying fragment text...</span>
                            </div>
                            <div className="bg-white border rounded p-2 text-xs italic">
                              "{currentFragmentCollection.text}"
                            </div>
                            <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                              <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
                            </div>
                          </div>
                        )}
                        
                        {collectionStep === 'pasting' && (
                          <div className="text-sm text-yellow-700">
                            <div className="flex items-center space-x-2 mb-2">
                              <span>📱</span>
                              <span>Pasting into Textio app...</span>
                            </div>
                            <div className="w-full bg-yellow-200 rounded-full h-2">
                              <div className="bg-yellow-600 h-2 rounded-full animate-pulse" style={{width: '90%'}}></div>
                            </div>
                          </div>
                        )}
                        
                        {collectionStep === 'complete' && (
                          <div className="text-sm text-green-700">
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Fragment #{currentFragmentCollection.fragmentId} collected!</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {receivedFragments.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        Collected Fragments ({receivedFragments.filter(f => !f.isInstruction).length})
                      </label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {receivedFragments.filter(f => !f.isInstruction).map((fragment, index) => (
                          <div key={index} className="p-2 bg-green-50 rounded border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm">{fragment.platform.icon}</span>
                                <span className="text-xs font-medium">{fragment.platform.name}</span>
                              </div>
                              <span className="text-xs text-green-600 font-bold">✓ #{fragment.fragmentId}</span>
                            </div>
                            <p className="text-xs text-gray-600 italic mb-1">"{fragment.text}"</p>
                            <div className="text-xs text-green-700 font-medium">
                              Contains: {fragment.covered.join(', ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentStep >= 8 && receivedFragments.some(f => f.isInstruction) && (
                    <div className="mb-4">
                      <div className="bg-purple-50 border border-purple-300 rounded p-3">
                        <h4 className="font-medium text-purple-800 mb-2">SMS Instruction Received</h4>
                        <div className="bg-white border rounded p-2">
                          <p className="text-sm text-purple-700 font-mono">
                            {receivedFragments.find(f => f.isInstruction)?.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentStep >= 9 && reconstructedMessage && (
                    <div className="mb-4">
                      <div className="bg-blue-50 border border-blue-300 rounded p-3">
                        <h4 className="font-medium text-blue-800 mb-2">Reconstruction Complete</h4>
                        <div className="bg-white border rounded p-3">
                          <p className="text-sm text-gray-800 font-medium text-center">
                            "{reconstructedMessage}"
                          </p>
                        </div>
                        <div className="mt-2 text-center">
                          <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-xs">
                            Message Successfully Assembled
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {currentStep < 6 && (
                <div className="text-center text-gray-500 py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Waiting for fragments...</p>
                </div>
              )}
            </div>
          </FixedPhone>
        </div>

        {/* Central Animation Area */}
        {currentStep >= 5 && currentStep < 11 && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {animationState === 'validating' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">🛡️</span>
                    </div>
                    <div className="text-orange-700">
                      <div className="font-bold text-sm">Textio Server</div>
                      <div className="text-xs">Account Validation</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white border-2 border-orange-300 rounded p-2 text-xs text-orange-700 max-w-xs text-center">
                  ✅ User A verified<br/>
                  ✅ User B verified<br/>
                  🚫 Message content: NEVER ACCESSED
                </div>
              </div>
            )}
            
            {animationState === 'transmitting' && (
              <div className="flex items-center space-x-4">
                {[1,2,3].map(i => (
                  <div key={i} className="relative">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center animate-bounce" 
                         style={{animationDelay: `${i * 0.2}s`}}>
                      <Send className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {animationState === 'confirming' && (
              <div className="bg-green-100 border-2 border-green-400 rounded-full p-4 animate-pulse">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            )}
            
            {animationState === 'sms-sending' && (
              <div className="bg-purple-100 border-2 border-purple-400 rounded-full p-4 animate-ping">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TextioDemoFixedPopupsV5;
