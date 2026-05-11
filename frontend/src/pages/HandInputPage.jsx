import { useState } from 'react'
import CardSelector from '../components/CardSelector'
import BoardDisplay from '../components/BoardDisplay'

export default function HandInputPage({ onNext }) {
  const [heroCards, setHeroCards] = useState([])
  const [board, setBoard] = useState({ flop: [], turn: null, river: null })
  const [numOpponents, setNumOpponents] = useState(5)
  const [position, setPosition] = useState('CO')
  const [step, setStep] = useState('cards') // cards | board | details

  const positions = ['BTN', 'SB', 'BB', 'UTG', 'MP', 'CO']

  const containerStyle = {
    maxWidth: 480, margin: '0 auto', padding: '20px',
    minHeight: '100vh', background: '#16213e'
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0 20px' }}>
        <span style={{ color: '#888', fontSize: 14, cursor: 'pointer' }} onClick={() => window.location.reload()}>← 返回</span>
        <span style={{ color: '#555', fontSize: 12 }}>步骤 1/4 · 手牌信息</span>
        <span style={{ color: '#e94560', fontSize: 13, fontWeight: 600 }}>{step === 'cards' ? '1/3' : step === 'board' ? '2/3' : '3/3'}</span>
      </div>

      {step === 'cards' && (
        <>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>你的手牌</div>
          <CardSelector selectedCards={heroCards} onSelect={setHeroCards} maxCards={2} />

          <div style={{ marginTop: 24, textAlign: 'right' }}>
            <button onClick={() => heroCards.length === 2 && setStep('board')}
              style={{
                background: heroCards.length === 2 ? '#16c79a' : '#2a2a4e',
                color: heroCards.length === 2 ? '#fff' : '#666',
                border: 'none', padding: '12px 32px', borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: heroCards.length === 2 ? 'pointer' : 'not-allowed'
              }}>
              下一步：选公牌 →
            </button>
          </div>
        </>
      )}

      {step === 'board' && (
        <>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>公牌</div>
          <div style={{ color: '#555', fontSize: 12, marginBottom: 12 }}>
            点击花色数字选牌，翻牌3张 / 转牌1张 / 河牌1张
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#16c79a', fontSize: 12, marginBottom: 6 }}>翻牌（己选牌已禁用）</div>
            <CardSelector selectedCards={board.flop.map(c => `${c.rank}${c.suit}`)}
              onSelect={(cards) => setBoard({ ...board, flop: cards.map(parseCard) })} maxCards={3}
              disabledCards={heroCards} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#f0a500', fontSize: 12, marginBottom: 6 }}>转牌</div>
            <CardSelector selectedCards={board.turn ? [`${board.turn.rank}${board.turn.suit}`] : []}
              onSelect={(cards) => setBoard({ ...board, turn: cards.length ? parseCard(cards[0]) : null })} maxCards={1}
              disabledCards={[...heroCards, ...board.flop.map(c => `${c.rank}${c.suit}`)]} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#e94560', fontSize: 12, marginBottom: 6 }}>河牌</div>
            <CardSelector selectedCards={board.river ? [`${board.river.rank}${board.river.suit}`] : []}
              onSelect={(cards) => setBoard({ ...board, river: cards.length ? parseCard(cards[0]) : null })} maxCards={1}
              disabledCards={[...heroCards, ...board.flop.map(c => `${c.rank}${c.suit}`), ...(board.turn ? [`${board.turn.rank}${board.turn.suit}`] : [])]} />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button onClick={() => setStep('cards')}
              style={{ flex: 1, background: 'transparent', border: '2px solid #3a3a5e', color: '#aaa', padding: '12px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
              ← 上一步
            </button>
            <button onClick={() => setStep('details')}
              style={{ flex: 1, background: '#16c79a', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              下一步：对手 →
            </button>
          </div>
        </>
      )}

      {step === 'details' && (
        <>
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>已选手牌</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {heroCards.map((c, i) => (
                <div key={i} style={{
                  width: 56, height: 78, borderRadius: 10, border: '2px solid #e94560',
                  background: 'rgba(233,69,96,0.08)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 700,
                  color: (c[1] === '♥' || c[1] === '♦') ? '#e94560' : '#d0d0d0'
                }}><span>{c[0]}</span><span style={{ fontSize: 12 }}>{c[1]}</span></div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>公牌</div>
            <BoardDisplay board={board} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>对手人数</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[2, 3, 4, 5, 6].map(n => (
                <div key={n} onClick={() => setNumOpponents(n)}
                  style={{
                    padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                    background: numOpponents === n ? '#e94560' : 'transparent',
                    border: numOpponents === n ? '1px solid #e94560' : '1px solid #3a3a5e',
                    color: numOpponents === n ? '#fff' : '#aaa'
                  }}>{n}</div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 30 }}>
            <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>位置</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {positions.map(p => (
                <div key={p} onClick={() => setPosition(p)}
                  style={{
                    padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 12,
                    background: position === p ? '#0f3460' : 'transparent',
                    border: position === p ? '1px solid #0f3460' : '1px solid #3a3a5e',
                    color: position === p ? '#fff' : '#aaa', fontWeight: position === p ? 600 : 400
                  }}>{p}</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setStep('board')}
              style={{ flex: 1, background: 'transparent', border: '2px solid #3a3a5e', color: '#aaa', padding: '12px', borderRadius: 10, fontSize: 14, cursor: 'pointer' }}>
              ← 上一步
            </button>
            <button onClick={() => onNext({ heroCards, board, numOpponents, position })}
              style={{ flex: 1, background: '#e94560', color: '#fff', border: 'none', padding: '12px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              ✅ 确认，下一步 →
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function parseCard(str) {
  if (!str) return null
  const suit = str[str.length - 1]
  const rank = str.slice(0, -1)
  return { rank, suit }
}
