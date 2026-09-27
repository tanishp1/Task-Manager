const InfoCard = ({label, value, color}) => {
  return (
    <article className='metric-card'>
      <div className='metric-card-label'>
        <span className={`metric-card-dot ${color}`} />
        <span>{label}</span>
      </div>
      <p className='metric-card-value'>{value}</p>
      <div style={{
        marginTop: 12,
        height: 3,
        borderRadius: 99,
        background: '#f1f5f9',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: '60%',
          borderRadius: 99,
          background: 'linear-gradient(90deg, #1368EC, #60a5fa)'
        }} />
      </div>
    </article>
  )
}

export default InfoCard;
