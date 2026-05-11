import { useState } from 'react'
import HandInputPage from './pages/HandInputPage'

function Page({ show, children }) {
  if (!show) return null
  return <div style={{ animation: 'fadeIn 0.3s ease' }}>{children}</div>
}

const s = {
  container: { minHeight: '100vh', background: '#0d0d1a', color: '#e0e0e0',
    fontFamily: "'PingFang SC','Microsoft YaHei',-apple-system,sans-serif" },
  page: { maxWidth: 480, margin: '0 auto', padding: 20, minHeight: '100vh', background: '#16213e' },
  phone: { maxWidth: 480, margin: '0 auto', padding: '60px 20px', textAlign: 'center' },
  btn: (bg, w='auto') => ({
    background: bg, color: '#fff', border: 'none', padding: '14px 40px', borderRadius: 12,
    fontSize: 15, fontWeight: 700, cursor: 'pointer', width: w, display: 'inlineBlock'
  }),
  backBtn: { color: '#888', fontSize: 14, cursor: 'pointer' },
  label: { color: '#888', fontSize: 13, marginBottom: 6, marginTop: 16 },
  chip: (active) => ({
    padding: '8px 18px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
    background: active ? '#e94560' : 'transparent',
    border: active ? '1px solid #e94560' : '1px solid #3a3a5e',
    color: active ? '#fff' : '#aaa'
  })
}

export default function App() {
  const [pg, setPg] = useState('home')
  const [data, setData] = useState({})
  const [sel, setSel] = useState('Tom Dwan')

  const go = (page, extra) => {
    if (extra) setData({ ...data, ...extra })
    setPg(page)
  }

  // ============ HOME ============
  if (pg === 'home') {
    return (
      <div style={s.container}>
        <div style={s.phone}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🃏</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 10, color: '#fff' }}>德扑复盘教练</h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.8, marginBottom: 32 }}>
            分析你的每一手牌<br />
            看看<span style={{ color: '#e94560', fontWeight: 600 }}>"如果换一种打法"</span>会怎样
          </p>
          <button onClick={() => go('input')} style={s.btn('linear-gradient(135deg,#e94560,#d63850)', '85%')}>
            🚀 开始复盘
          </button>

          <div style={{ marginTop: 50, paddingTop: 30, borderTop: '1px solid rgba(42,42,78,0.5)' }}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 14, letterSpacing: 1 }}>快速示例</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <div onClick={() => go('actions', { heroCards: ['A♠','A♥'], board: { flop: [], turn: null, river: null }, numOpponents: 5, position: 'BTN', preset: 'AA' })}
                style={{ background: '#1a1a3e', borderRadius: 14, padding: '16px 22px', border: '1px solid #2a2a4e', cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🅰🅰</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e94560' }}>AA翻前allin</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>试试跟注？→</div>
              </div>
              <div onClick={() => go('actions', { heroCards: ['A♥','K♥'], board: { flop: [{rank:'K',suit:'♦'},{rank:'7',suit:'♠'},{rank:'2',suit:'♣'}], turn: {rank:'9',suit:'♥'}, river: {rank:'3',suit:'♠'} }, numOpponents: 5, position: 'CO', preset: 'AK' })}
                style={{ background: '#1a1a3e', borderRadius: 14, padding: '16px 22px', border: '1px solid #2a2a4e', cursor: 'pointer' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>🅰🅺</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e94560' }}>AK中顶对</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>试试过牌？→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ============ INPUT ============
  if (pg === 'input') {
    return (
      <div style={s.container}>
        <HandInputPage onNext={(d) => go('actions', d)} onBack={() => go('home')} />
      </div>
    )
  }

  // ============ ACTIONS ============
  if (pg === 'actions') {
    const back = data?.preset ? 'home' : 'input'
    return (
      <div style={s.container}>
        <div style={s.page}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 20px' }}>
            <span style={s.backBtn} onClick={() => go(back)}>← 返回</span>
            <span style={{ color: '#555', fontSize: 12 }}>步骤 2/4 · 行动记录</span>
            <span></span>
          </div>

          {data?.heroCards && (
            <div style={{ display: 'flex', gap: 4, marginBottom: 16, alignItems: 'center' }}>
              {data.heroCards.map((c, i) => (
                <div key={i} style={{
                  width: 42, height: 58, borderRadius: 8, border: '2px solid #e94560',
                  background: 'rgba(233,69,96,0.08)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700,
                  color: (c[1]==='♥'||c[1]==='♦') ? '#e94560' : '#d0d0d0'
                }}><span>{c[0]}</span><span style={{fontSize:10}}>{c[1]}</span></div>
              ))}
              {data?.board?.flop?.length > 0 && (
                <div style={{ display: 'flex', gap: 3, marginLeft: 8 }}>
                  {[...(data.board.flop||[]), data.board.turn, data.board.river].filter(Boolean).map((c, i) => (
                    <div key={i} style={{
                      width: 34, height: 46, borderRadius: 6, fontSize: 10, fontWeight: 600,
                      border: `1px solid ${['#16c79a','#16c79a','#16c79a','#f0a500','#e94560'][i]}`,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      color: (c.suit==='♥'||c.suit==='♦') ? '#e94560' : '#d0d0d0',
                      background: 'rgba(0,0,0,0.2)'
                    }}><span>{c.rank}</span><span style={{fontSize:8}}>{c.suit}</span></div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 12 }}>
            {[['翻牌前','#888'],['翻牌','#16c79a'],['转牌','#f0a500'],['河牌','#e94560']].map(([l,c]) => (
              <div style={{ textAlign: 'center' }} key={l}>
                <div style={{ color: c, fontSize: 10, marginBottom: 4, fontWeight: 600 }}>{l}</div>
                <div style={{ background: '#1a1a3e', borderRadius: 8, padding: '8px 4px', border: `1px solid ${c}20` }}>
                  <div style={{ color: '#666', fontSize: 8, marginBottom: 3 }}>底池</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>--</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {[['跟注3','#e94560',false],['下注20','#fff',true],['过牌','#f0a500',false],['弃牌','#666',false]].map(([a,c,act],i) => (
              <div key={i} style={{
                background: act ? 'rgba(233,69,96,0.06)' : '#1a1a3e', borderRadius: 8, padding: '8px 4px', textAlign: 'center',
                border: act ? '1px solid #e94560' : '1px solid #2a2a4e', cursor: act ? 'pointer' : 'default'
              }}>
                <div style={{ color: '#666', fontSize: 8, marginBottom: 3 }}>你的行动</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{a}</div>
                {act && <div style={{ fontSize: 8, color: '#e94560', marginTop: 3 }}>🎯 点击试试替代</div>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, background: 'rgba(233,69,96,0.06)', borderRadius: 8, padding: '10px 14px', fontSize: 11, color: '#888' }}>
            {data?.heroCards?.join('') || '手牌'} · 翻牌中顶对带听花
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
            <button onClick={() => go(back)} style={{ flex: 1, background: 'transparent', border: '2px solid #3a3a5e', color: '#aaa', padding: 14, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ← 上一步
            </button>
            <button onClick={() => go('players')} style={{ flex: 1, background: 'linear-gradient(135deg,#16c79a,#13b088)', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              选牌手 →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ PLAYERS ============
  if (pg === 'players') {
    const pros = [
      {name:'Tom Dwan',tag:'🔥激进',desc:'VPIP 32%',color:'#e94560'},
      {name:'谭轩',tag:'🎯稳健',desc:'VPIP 22%',color:'#16c79a'},
      {name:'Phil Ivey',tag:'👑全面',desc:'VPIP 28%',color:'#f0a500'},
    ]
    return (
      <div style={s.container}>
        <div style={s.page}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 20px' }}>
            <span style={s.backBtn} onClick={() => go('actions')}>← 返回</span>
            <span style={{ color: '#555', fontSize: 12 }}>选择对手牌手</span>
            <span></span>
          </div>

          <div style={{ color: '#888', fontSize: 13, marginBottom: 10 }}>🏆 职业选手</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
            {pros.map(p => (
              <div key={p.name} onClick={() => setSel(p.name)} style={{
                background: sel===p.name ? 'linear-gradient(135deg,rgba(233,69,96,0.08),#16213e)' : '#1a1a3e',
                borderRadius: 12, padding: 14, textAlign: 'center', cursor: 'pointer',
                border: sel===p.name ? `1px solid ${p.color}` : '1px solid #2a2a4e'
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: p.color, marginBottom: 4 }}>{p.tag}</div>
                <div style={{ fontSize: 10, color: '#555' }}>{p.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#888', fontSize: 13 }}>👥 我的牌友</span>
            <span style={{ color: '#e94560', fontSize: 12, cursor: 'pointer' }} onClick={() => go('createPlayer')}>+ 创建</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[{n:'老张',t:'紧凶·24手',p:24},{n:'老李',t:'松凶·8手',p:8}].map(f => (
              <div key={f.n} style={{ flex: 1, background: '#1a1a3e', borderRadius: 12, padding: 14, border: '1px solid #2a2a4e' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0e0', marginBottom: 4 }}>{f.n}</div>
                <div style={{ fontSize: 10, color: '#888', marginBottom: 6 }}>{f.t}</div>
                <div style={{ height: 3, background: '#2a2a4e', borderRadius: 2 }}>
                  <div style={{ width: `${f.p}%`, height: '100%', background: '#16c79a', borderRadius: 2 }} />
                </div>
              </div>
            ))}
            <div onClick={() => go('createPlayer')} style={{
              flex: 0.4, background: '#1a1a3e', borderRadius: 12, border: '1px dashed #2a2a4e',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#555', cursor: 'pointer'
            }}>+</div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
            <button onClick={() => go('actions')} style={{ flex: 1, background: 'transparent', border: '2px solid #3a3a5e', color: '#aaa', padding: 14, borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ← 上一步
            </button>
            <button onClick={() => go('decision', { opponent: sel })} style={{ flex: 1, background: 'linear-gradient(135deg,#e94560,#d63850)', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              选决策点 →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============ CREATE PLAYER ============
  if (pg === 'createPlayer') {
    return (
      <div style={s.container}>
        <div style={s.page}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 20px' }}>
            <span style={s.backBtn} onClick={() => go('players')}>← 返回</span>
            <span style={{ color: '#555', fontSize: 12 }}>创建牌友</span>
            <span></span>
          </div>
          <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>牌友名称</div>
          <input placeholder="例如：老张" style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #2a2a4e', background: '#1a1a3e', color: '#e0e0e0', fontSize: 14, marginBottom: 20, outline: 'none' }} />
          <div style={{ color: '#888', fontSize: 13, marginBottom: 6 }}>描述他的打法</div>
          <textarea placeholder="我这个朋友玩得很紧..." rows={4} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #2a2a4e', background: '#1a1a3e', color: '#e0e0e0', fontSize: 13, resize: 'none', marginBottom: 10 }} />
          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <button style={{ background: '#e94560', color: '#fff', border: 'none', padding: '12px 30px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              🤖 AI 生成风格参数
            </button>
          </div>
          <button onClick={() => go('players')} style={{ width: '100%', background: '#16c79a', color: '#fff', border: 'none', padding: 14, borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
            ✅ 保存牌友
          </button>
        </div>
      </div>
    )
  }

  // ============ DECISION ============
  if (pg === 'decision') {
    return (
      <div style={s.container}>
        <div style={s.page}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 20px' }}>
            <span style={s.backBtn} onClick={() => go('players')}>← 返回</span>
            <span style={{ color: '#555', fontSize: 12 }}>步骤 3/4 · 选择对比</span>
            <span style={{ fontSize: 11, color: '#e94560' }}>VS {data?.opponent || 'Tom Dwan'}</span>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 20, padding: '12px 0' }}>
            {['翻牌前','翻牌','转牌','河牌'].map((l,i) => (
              <div key={l} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: i===1 ? '#e94560' : '#555', marginBottom: 4 }}>
                  {i===1 ? '🖱点我' : l}</div>
                <div style={{
                  display: 'inline-block', padding: '6px 10px', borderRadius: 12, fontSize: 11,
                  background: i===1 ? 'rgba(233,69,96,0.12)' : '#1a1a3e',
                  border: i===1 ? '2px solid #e94560' : '1px solid #2a2a4e',
                  color: i===1 ? '#e94560' : '#666', fontWeight: i===1 ? 700 : 400, cursor: i===1 ? 'pointer' : 'default'
                }}>{['跟注3','下注20','过牌','弃牌'][i]}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: 20, marginBottom: 16, border: '1px solid #3a3a5e' }}>
            <div style={{ fontSize: 15, color: '#e94560', fontWeight: 700, marginBottom: 8 }}>🎯 试试替代方案</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 14 }}>翻牌 K♦7♠2♣ · 你实际选择了下注20</div>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{icon:'✋',n:'过牌'},{icon:'📈',n:'加注'}].map(o => (
                <div key={o.n} style={{
                  flex: 1, padding: 14, textAlign: 'center', borderRadius: 10, cursor: 'pointer',
                  border: '2px solid #2a2a4e'
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{o.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0e0' }}>{o.n}</div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => { go('loading', { opponent: data?.opponent || 'Tom Dwan' }); setTimeout(() => go('results', { opponent: data?.opponent || 'Tom Dwan' }), 2500) }}
            style={{ width: '100%', background: 'linear-gradient(135deg,#e94560,#d63850)', color: '#fff', border: 'none', padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 20 }}>
            🚀 开始模拟
          </button>
        </div>
      </div>
    )
  }

  // ============ LOADING ============
  if (pg === 'loading') {
    return (
      <div style={{ ...s.container, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔄</div>
          <div style={{ fontSize: 15, color: '#e94560', fontWeight: 700, marginBottom: 8 }}>正在模拟...</div>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 20 }}>10,000 次 · vs {data?.opponent || '默认对手'}</div>
          <div style={{ width: 200, height: 5, background: '#2a2a4e', borderRadius: 3, margin: '0 auto', overflow: 'hidden' }}>
            <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg,#0f3460,#e94560)', borderRadius: 3 }} />
          </div>
        </div>
      </div>
    )
  }

  // ============ RESULTS ============
  if (pg === 'results') {
    return (
      <div style={s.container}>
        <div style={s.page}>
          <div style={{ textAlign: 'center', padding: '10px 0 16px', fontSize: 16, fontWeight: 700, color: '#16c79a' }}>
            📊 复盘结果
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {[
              {l:'你实际·下注20',emoji:'😐',ev:'+3.2 BB',wr:'72%'},
              {l:'如果·过牌',emoji:'🤑',ev:'+5.5 BB',wr:'65%'}
            ].map((r,i) => (
              <div key={i} style={{
                flex: 1, background: '#1a1a3e', borderRadius: 12, padding: '14px 10px', textAlign: 'center',
                border: i===1 ? '1px solid #16c79a' : '1px solid #2a2a4e'
              }}>
                <div style={{ fontSize: 10, color: i===1?'#16c79a':'#888', marginBottom: 4 }}>{r.l}</div>
                <div style={{ fontSize: 28 }}>{r.emoji}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#16c79a' }}>{r.ev}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{r.wr}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'rgba(22,199,154,0.08)', border: '1px solid #16c79a', borderRadius: 12, padding: '14px 16px', textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#16c79a' }}>+2.3 BB 🟢</div>
            <div style={{ fontSize: 12, color: '#aaa', marginTop: 4 }}>过牌比下注多赚 2.3BB</div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => go('actions')} style={{ flex: 1, background: 'transparent', border: '2px solid #3a3a5e', color: '#aaa', padding: 12, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              ✏️ 改输入
            </button>
            <button onClick={() => go('decision')} style={{ flex: 1, background: '#0f3460', color: '#fff', border: 'none', padding: 12, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              🔄 换一个
            </button>
            <button onClick={() => go('home')} style={{ flex: 1, background: '#16c79a', color: '#fff', border: 'none', padding: 12, borderRadius: 10, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
              🆕 新牌局
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
