function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0d0d1a',
      color: '#e0e0e0',
      fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif"
    }}>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🃏</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, color: '#fff' }}>德扑复盘教练</h1>
        <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6 }}>
          分析你的每一手牌<br />
          看看<span style={{ color: '#e94560', fontWeight: 600 }}>"如果换一种打法"</span>会怎样
        </p>
        <div style={{ marginTop: 32, padding: '20px 0' }}>
          <p style={{ color: '#555', fontSize: 12 }}>🚧 前端开发中...</p>
        </div>
      </div>
    </div>
  )
}

export default App
