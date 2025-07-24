import { useState } from 'react'
import './Chatbot.css'

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [streamedMessage, setStreamedMessage] = useState('')
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)


  const toggleChat = () => {
    setIsOpen(prev => {
      const willOpen = !prev
      if (willOpen && messages.length === 0) {
        setMessages([
          {
            sender: 'bot',
            text: "Hi! I'm Trekka, your personal trip planning assistant 🧳✨. Ask me where to go, what to pack, or how to plan — I'm here to help!"
          }
        ])
      }
      return willOpen
    })
  }

  const sendMessage = async (text) => {
    if (!text.trim()) return

    const newMessages = [
      ...messages,
      { sender: 'user', text }
    ]
    setMessages(newMessages)
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
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: "You are Trekka, Trip Trek's travel assistant helping users plan trips." },
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
        }

        typeNextWord()
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: 'Hmm, something went wrong.' }])
      }
    } catch (err) {
      console.error(err)
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error contacting AI.' }])
    }

    setIsTyping(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
    setHasInteracted(true)
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)     
    setHasInteracted(true)
  }




  return (
    <div className="chatbot-wrapper">
      <button className="chat-toggle" onClick={toggleChat}>💬</button>

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
        </div>

        {!hasInteracted && (
          <div className="suggestions">
            {[
              'Where should I go in August?',
              'What are top attractions in Paris?',
              'Find me a cheap getaway'
            ].map((s, i) => (
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
