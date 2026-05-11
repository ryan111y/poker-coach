const COLORS = { flop: '#16c79a', turn: '#f0a500', river: '#e94560' }

function isRed(suit) { return suit === '♥' || suit === '♦' }

export default function BoardDisplay({ board, labels = true }) {
  const cards = [
    ...board.flop.map(c => ({ ...c, phase: 'flop' })),
    ...(board.turn ? [{ ...board.turn, phase: 'turn' }] : []),
    ...(board.river ? [{ ...board.river, phase: 'river' }] : [])
  ]

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {cards.map((card, i) => (
        <div key={i} style={{
          width: 50, height: 68, borderRadius: 8,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 700,
          border: `2px solid ${COLORS[card.phase]}`,
          background: 'rgba(0,0,0,0.2)',
          color: isRed(card.suit) ? '#e94560' : '#d0d0d0'
        }}>
          <span>{card.rank}</span>
          <span style={{ fontSize: 11 }}>{card.suit}</span>
          {labels && <span style={{ fontSize: 8, color: COLORS[card.phase], marginTop: 2 }}>
            {card.phase === 'flop' ? '翻' : card.phase === 'turn' ? '转' : '河'}
          </span>}
        </div>
      ))}
      {cards.length === 0 && (
        <div style={{ color: '#555', fontSize: 13, padding: '20px 0' }}>暂无公牌</div>
      )}
    </div>
  )
}
