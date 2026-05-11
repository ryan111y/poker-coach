const API = '/api'

export async function simulate(handData, opponent, alternative) {
  const res = await fetch(`${API}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hero_hand: handData.heroCards,
      board: [
        ...handData.board.flop.map(c => `${c.rank}${c.suit}`),
        ...(handData.board.turn ? [`${handData.board.turn.rank}${handData.board.turn.suit}`] : []),
        ...(handData.board.river ? [`${handData.board.river.rank}${handData.board.river.suit}`] : []),
      ],
      num_opponents: handData.numOpponents,
      iterations: 10000
    })
  })
  return res.json()
}

export async function compareStrategies(handData, opponent, actualAction, alternativeAction) {
  const res = await fetch(`${API}/compare`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hand: {
        hero_hand: handData.heroCards,
        board: [
          ...handData.board.flop.map(c => `${c.rank}${c.suit}`),
          ...(handData.board.turn ? [`${handData.board.turn.rank}${handData.board.turn.suit}`] : []),
          ...(handData.board.river ? [`${handData.board.river.rank}${handData.board.river.suit}`] : []),
        ],
        num_opponents: handData.numOpponents
      },
      strategy_a: { action: actualAction },
      strategy_b: { action: alternativeAction }
    })
  })
  return res.json()
}

export async function evaluate(handData) {
  const res = await fetch(`${API}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hero_hand: handData.heroCards,
      board: [
        ...handData.board.flop.map(c => `${c.rank}${c.suit}`),
        ...(handData.board.turn ? [`${handData.board.turn.rank}${handData.board.turn.suit}`] : []),
        ...(handData.board.river ? [`${handData.board.river.rank}${handData.board.river.suit}`] : []),
      ]
    })
  })
  return res.json()
}
