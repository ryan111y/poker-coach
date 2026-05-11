import { useState } from 'react'

const SUITS = ['♥', '♠', '♦', '♣']
const RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

function isRed(suit) { return suit === '♥' || suit === '♦' }
function cardKey(rank, suit) { return `${rank}${suit}` }

export default function CardSelector({ selectedCards, onSelect, maxCards = 2, disabledCards = [] }) {
  const [open, setOpen] = useState(false)

  const toggleCard = (rank, suit) => {
    const key = cardKey(rank, suit)
    if (selectedCards.includes(key)) {
      onSelect(selectedCards.filter(c => c !== key))
    } else if (selectedCards.length < maxCards) {
      onSelect([...selectedCards, key])
    }
  }

  const selectedSet = new Set(selectedCards)
  const disabledSet = new Set(disabledCards)

  const canAddMore = selectedCards.length < maxCards

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        {Array.from({ length: maxCards }).map((_, i) => {
          const card = selectedCards[i]
          return (
            <div
              key={i}
              onClick={() => setOpen(true)}
              style={{
                width: 56, height: 78, borderRadius: 10, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                fontSize: card ? 18 : 24, fontWeight: 700,
                border: card ? '2px solid #e94560' : '2px dashed #3a3a5e',
                background: card ? 'rgba(233,69,96,0.08)' : 'transparent',
                color: card ? (isRed(card[1]) ? '#e94560' : '#d0d0d0') : '#555'
              }}
            >
              {card ? <><span>{card[0]}</span><span style={{ fontSize: 12 }}>{card[1]}</span></> : '+'}
            </div>
          )
        })}
      </div>

      {open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#1a1a3e', borderRadius: 16, padding: 24, maxWidth: 360, width: '90%',
            border: '1px solid #3a3a5e'
          }}>
            {SUITS.map(suit => (
              <div key={suit} style={{ marginBottom: 12 }}>
                <div style={{ color: isRed(suit) ? '#e94560' : '#aaa', fontSize: 14, marginBottom: 6, fontWeight: 600 }}>{suit}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {RANKS.map(rank => {
                    const key = cardKey(rank, suit)
                    const selected = selectedSet.has(key)
                    const disabled = disabledSet.has(key)
                    const faded = !selected && ((!canAddMore) || disabled)
                    return (
                      <div key={key} onClick={() => !disabled && toggleCard(rank, suit)} style={{
                        width: 40, height: 50, borderRadius: 8,
                        cursor: disabled ? 'not-allowed' : (faded && !selected) ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 600,
                        background: selected ? 'rgba(233,69,96,0.15)' : disabled ? '#0d0d1a' : '#16213e',
                        border: selected ? '2px solid #e94560' : disabled ? '1px solid #1a1a2e' : '1px solid #2a2a4e',
                        color: selected ? '#e94560' : disabled ? '#333' : (isRed(suit) ? '#e94560' : '#aaa'),
                        opacity: faded ? 0.25 : 1,
                        transition: 'all 0.15s'
                      }}>{rank}</div>
                    )
                  })}
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button onClick={() => setOpen(false)}
                style={{ background: '#e94560', color: '#fff', border: 'none', padding: '10px 40px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
