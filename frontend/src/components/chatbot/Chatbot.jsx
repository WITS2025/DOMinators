// src/componenets/chatbot/Chatbot.jsx
import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom';
import { useTripContext } from '../../context/TripContext'
import './Chatbot.css'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const FINETUNED_MODEL_ID = "ft:gpt-3.5-turbo-0125:personal:trekka:C1G5p4GH";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [streamedMessage, setStreamedMessage] = useState('')
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasNotification, setHasNotification] = useState(false)
  const [hasShownIntro, setHasShownIntro] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const messagesEndRef = useRef(null)
  
  const { getTripById } = useTripContext()
  const location = useLocation();
  const [tripId, setTripId] = useState(null);
  const [tripData, setTripData] = useState(null)

  useEffect(() => {
    const match = location.pathname.match(/^\/trips\/([^/]+)/);
    const currentTripId = match ? match[1] : null;
    setTripId(currentTripId);
  }, [location]);

  useEffect(() => {
    if (tripId) {
      const currentTrip = getTripById(tripId);
      setTripData(currentTrip);
    } else {
      setTripData(null);
    }
  }, [tripId, getTripById]);

  // Scroll to bottom whenever messages change or streaming updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamedMessage])


  // Check if user is on trips page to auto-show intro
  useEffect(() => {
    const checkForTripsPage = () => {
      const isOnTripsPage = window.location.pathname.includes('trip') || 
                           window.location.pathname.includes('Trip') ||
                           window.location.hash.includes('trip') ||
                           window.location.hash.includes('Trip')
      
      if (isOnTripsPage && !hasShownIntro && messages.length === 0) {
        setMessages([
          {
            sender: 'bot',
            text: "Hey there! I'm Trekka, your personal trip planning assistant 🧳✨. Ask me where to go, what to pack, or how to plan — I'm here to help!"
          }
        ])
        setSuggestions(['Find me a cheap getaway', 'What are some underrated travel spots?', 'Surprise me with a destination idea'])
        setHasShownIntro(true)
        // Show notification if chat is closed
        if (!isOpen) {
          setHasNotification(true)
        }
      }
    }

    // Check immediately
    checkForTripsPage()
    
    // For React Router navigation detection
    let lastPath = window.location.pathname
    const detectRouteChange = () => {
      if (lastPath !== window.location.pathname) {
        lastPath = window.location.pathname
        setTimeout(checkForTripsPage, 50) // Small delay for route to fully change
      }
    }
    
    // Create a MutationObserver to watch for DOM changes (React Router updates)
    const observer = new MutationObserver(detectRouteChange)
    observer.observe(document.body, { childList: true, subtree: true })
    
    // Also listen for browser navigation events
    const handleRouteChange = () => {
      setTimeout(checkForTripsPage, 100)
    }
    
    window.addEventListener('popstate', handleRouteChange)
    window.addEventListener('hashchange', handleRouteChange)
    
    // For manual navigation detection, check periodically
    const intervalId = setInterval(() => {
      detectRouteChange()
    }, 500)
    
    return () => {
      observer.disconnect()
      window.removeEventListener('popstate', handleRouteChange)
      window.removeEventListener('hashchange', handleRouteChange)
      clearInterval(intervalId)
    }
  }, [hasShownIntro, messages.length, isOpen])


  // Clear notification when chat is opened
  useEffect(() => {
    if (isOpen) {
      setHasNotification(false)
    }
  }, [isOpen])


  const toggleChat = () => {
    setIsOpen(prev => {
      const willOpen = !prev
      // Show intro message when user manually opens chat for the first time
      if (willOpen && !hasShownIntro && messages.length === 0) {
        setMessages([
          {
            sender: 'bot',
            text: "Hey there! I'm Trekka, your personal trip planning assistant 🧳✨. Ask me where to go, what to pack, or how to plan — I'm here to help!"
          }
        ])
        setSuggestions(['Find me a cheap getaway', 'What are some underrated travel spots?', 'Surprise me with a destination idea'])
        setHasShownIntro(true)
      }
      return willOpen
    })
  }

  const generateFollowupMessage = async (tripData) => {
    if (!tripData) return

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: FINETUNED_MODEL_ID,
          messages: [
            {
              role: "system",
              content:
                `Give a short, helpful follow up message and 3 suggestion prompts` +
                `Respond only in this format:\n{"followup": "text", "suggestions": ["suggestion1", "suggestion2", "suggestion3"]} in html format (not markdown)` +
                `Today's date is ${new Date().toLocale}.`,
            },
            {
              role: "user",
              content: `I'm planning a trip to ${tripData.destination}. Here's my itinerary: ${JSON.stringify(tripData.itinerary,null, 2 )}`,
            },
          ],
          temperature: 0.7,
        }),
      });

      const data = await res.json()
      const content = data.choices?.[0]?.message?.content || '{}'
      const parsed = JSON.parse(content)

      if (parsed.followup) {
        setMessages(prev => [...prev, { sender: 'bot', text: parsed.followup }])
      }
      if (parsed.suggestions?.length) {
        setSuggestions(parsed.suggestions)
      }

      if (!isOpen) setHasNotification(true)
    } catch (err) {
      console.error('Error generating AI follow-up:', err)
    }
  }

  useEffect(() => {
    if (hasShownIntro && tripData) {
      generateFollowupMessage(tripData)
    }
  }, [hasShownIntro, tripData])

  const sendMessage = async (text) => {
    if (!text.trim()) return

    const newMessages = [...messages, { sender: 'user', text } ]
    setMessages(newMessages)
    setSuggestions([])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: FINETUNED_MODEL_ID,
          messages: [
            { role: 'system', 
              content: `You are Trekka, Trip Trek's travel assistant helping users plan trips.` +
                       (tripData ? ` The user is planning a trip to ${tripData.destination}. Here's their itinerary:\n` +
                      JSON.stringify(tripData.itinerary, null, 2) : '')
             },
            ...newMessages.map(msg => ({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            }))
          ],
          temperature: 0.7
        })
      })

      const data = await res.json()
      const botReply = data.choices?.[0]?.message?.content?.trim()


      if (botReply) {
        setStreamedMessage('')
        let i = 0
        const words = botReply.split(' ')

        const typeNextWord = () => {
          if (i < words.length) {
            setStreamedMessage(prev => prev + (i === 0 ? '' : ' ') + words[i])
            i++
            setTimeout(typeNextWord, 100) // Adjust speed here (ms per word)
          } else {
            setMessages(prev => [...prev, { sender: 'bot', text: botReply }])
            setStreamedMessage('')
          }
          // Show notification if chat is minimized
          if (!isOpen) {
            setHasNotification(true)
          }
        }
        typeNextWord()
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Hmm, something went wrong.' }])
      }
      if (!isOpen) {
        setHasNotification(true)
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error contacting AI.' }])
    }
    if (!isOpen) {
      setHasNotification(true)
    }

    setIsTyping(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)     
  }


  return (
    <div className="chatbot-wrapper">
      <button 
        className={`chat-toggle ${hasNotification ? 'has-notification' : ''}`}
        onClick={toggleChat}
      >
        💬
        {hasNotification && (
          <>
            <div className="notification-badge">!</div>
            <div className="notification-popup">
              New message from Trekka!
              <div className="notification-arrow"></div>
            </div>
          </>
        )}
      </button>

      <div className={`chatbox ${isOpen ? 'open' : ''}`}>
       <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-row ${msg.sender === 'user' ? 'user' : 'bot'}`}>
              <div className="avatar">{msg.sender === 'user' ? 'Y' : 'T'}</div>
              <div>
                <div className="label">{msg.sender === 'user' ? 'You' : 'Trekka'}</div>
                <div className="message-content">{msg.text}</div>
              </div>
            </div>
          ))}

          {streamedMessage ? (
            <div className="message-row bot">
              <div className="avatar">T</div>
              <div>
                <div className="label">Trekka</div>
                <div className="message-content">{streamedMessage}</div>
              </div>
            </div>
          ) : isTyping && (
            <div className="typing">Trekka is typing...</div>
          )}          

          {/* Invisible element to scroll to */}
            <div ref={messagesEndRef} />
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => handleSuggestionClick(s)}>{s}</button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Trekka something..."
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}

export default Chatbot