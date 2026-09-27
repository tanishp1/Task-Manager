const InfoCard = ({label, value, color}) => {
  return (
    <article className='metric-card'>
      <div className='metric-card-label'>
        <span className={`metric-card-dot ${color}`} />
        <span>{label}</span>
      </div>
      <p className='metric-card-value'>{value}</p>
    </article>
  )
}

export default InfoCard;
