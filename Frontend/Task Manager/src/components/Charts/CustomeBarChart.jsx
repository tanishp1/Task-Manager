import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const CustomeBarChart = ({data}) => {
    const hasData = data?.some((entry) => Number(entry.count) > 0);

    // function to alternate colors
    const getBarColor = (entry) => {
        switch (entry?.priority) {
            case 'low':
                return '#329772'
            case 'medium':
                return '#D59A32'
            case 'high':
                return '#D96A66'
            default:
                return '#329772'
        }
    }

    const CustomTooltip = ({active, payload}) => {
        if(active && payload && payload.length){
            return (
                <div className='bg-white shadow-md rounded-lg p-2 border border-gray-300'>
                    <p className='text-xs font-semibold text-slate-800 mb-1'>
                        {payload[0].payload.priority}
                    </p>
                    <p className='text-sm text-gray-600'>
                        Counts:{" "}
                        <span className='text-sm font-medium text-gray-900'>
                            {payload[0].payload.count}
                        </span>
                    </p>
                </div>
            )
        }
        return null;
    }
    if (!hasData) {
        return (
            <div className="mt-6 flex h-75 items-center justify-center text-sm text-slate-400">
                No task data yet.
            </div>
        );
    }

    return (
    <div className='bg-white mt-6'>
      <ResponsiveContainer width='100%' height={300}>
        <BarChart data={data}>
            <CartesianGrid stroke='none'/>

                <XAxis dataKey='priority' tick={{ fontSize: 12, fill: "#555" }} stroke='none'/>
                <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke='none'/>
                <Tooltip content={CustomTooltip} cursor={{ fill: "transparent" }}/>

                <Bar 
                dataKey='count' 
                nameKey='priority' 
                fill='#FF8042' 
                radius={[6, 6, 0, 0]} 
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={getBarColor(entry)}/>
                    ))}
                </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default CustomeBarChart
