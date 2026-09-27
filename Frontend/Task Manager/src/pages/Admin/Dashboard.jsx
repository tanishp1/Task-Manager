import { useState, useEffect } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'
import { useContext } from "react";
import  { UserContext } from "../../context/useContext"
import Dashboardlayout from '../../components/layout/Dashboardlayout';
import Axiosinstance from '../../utils/Axiosinstance';
import { API_PATHS } from '../../utils/ApiPath';
import moment from 'moment'
import { addThousandsSeparator } from '../../utils/helper';
import InfoCard from '../../components/Cards/InfoCard';
import { LuArrowRight } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import TaskListTable from '../../components/TaskListTable';
import CustomePieChart from '../../components/Charts/CustomePieChart';
import CustomeBarChart from '../../components/Charts/CustomeBarChart';

const COLORS = ['#D59A32', '#329772', '#3D82D5'];

const Dashboard = () => {
  useUserAuth();

  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [dashboardData, setdashboardData] = useState(null);
  const [pieChartData, setPieChartData] = useState([]);
  const [barChartData, setBarChartData] = useState([]);

  const prepareChartData = (data) => {
    const taskDistribution = data?.taskDistribution || null;
    const taskPriorityLevel = data?.taskPriorityLevel || null;

    const taskDistributionData = [
      {status: 'Pending', count: taskDistribution?.Pending || 0},
      {status: 'Completed', count: taskDistribution?.Completed || 0},
      {status: 'In Progress', count: taskDistribution?.InProgress || 0},
    ];
    setPieChartData(taskDistributionData);

    const PriorityLevelData = [
      {priority: 'high', count: taskPriorityLevel?.high || 0},
      {priority: 'meduim', count: taskPriorityLevel?.meduim || 0},
      {priority: 'low', count: taskPriorityLevel?.low || 0},
    ];
    setBarChartData(PriorityLevelData);
  }

  const onSeeMore = () => {
    navigate('/admin/tasks');
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await Axiosinstance.get(API_PATHS.TASK.GET_DASHBOARD_DATA);
        if(response.data){
          setdashboardData(response.data);
          prepareChartData(response.data?.charts || null)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    };

    loadDashboardData();
  }, [])
  
  return (
    <Dashboardlayout activeMenu="Dashboard">
      <div className='my-5 space-y-6 pb-8'>
        <header>
          <p className='text-[11px] font-semibold text-emerald-700'>TEAM OVERVIEW</p>
          <h1 className='mt-2 text-2xl font-semibold text-slate-900 md:text-3xl'>
            Good morning, {user?.name || 'there'}
          </h1>
          <p className='mt-1.5 text-sm text-slate-500'>
            {moment().format("dddd Do MMM YYYY")}
          </p>
        </header>

        <div className='grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4'>
          <InfoCard  label="Total Tasks" value={addThousandsSeparator(
            dashboardData?.charts?.taskDistribution?.All || 0
          )}
          color="bg-blue-600"
          />

          <InfoCard  label="Pending Tasks" value={addThousandsSeparator(
            dashboardData?.charts?.taskDistribution?.Pending || 0
          )}
          color="bg-amber-500"
          />

          <InfoCard  label="In Progress Tasks" value={addThousandsSeparator(
            dashboardData?.charts?.taskDistribution?.InProgress || 0
          )}
          color="bg-cyan-500"
          />

          <InfoCard  label="Completed Tasks" value={addThousandsSeparator(
            dashboardData?.charts?.taskDistribution?.Completed || 0
          )}
          color="bg-emerald-500"
          />
        </div>

        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
          <section className='card'>
            <div className='mb-2'>
              <h2 className='font-semibold text-slate-800'>Task distribution</h2>
              <p className='mt-1 text-xs text-slate-500'>Current status across your team</p>
            </div>
            <CustomePieChart data={pieChartData} color={COLORS}/>
          </section>

          <section className='card'>
            <div className='mb-2'>
              <h2 className='font-semibold text-slate-800'>Task priority</h2>
              <p className='mt-1 text-xs text-slate-500'>Tasks grouped by urgency</p>
            </div>
            <CustomeBarChart data={barChartData} />
          </section>

          <section className='card md:col-span-2'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <h2 className='font-semibold text-slate-800'>Recent tasks</h2>
                <p className='mt-1 text-xs text-slate-500'>The latest activity from your team</p>
              </div>
              <button type='button' className='card-btn shrink-0' onClick={onSeeMore}>
                See all <LuArrowRight className='text-base'/>
              </button>
            </div>
            <TaskListTable tableData={dashboardData?.recentTasks || []}/>
          </section>
        </div>
      </div>
    </Dashboardlayout>
  )
}

export default Dashboard
