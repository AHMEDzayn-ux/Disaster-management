import React from 'react';
import { useLocation } from 'react-router-dom';
import MissingPersonsList from '../components/MissingPersonsList';
import AnimalRescueList from '../components/AnimalRescueList';
import DisasterReportsList from '../components/DisasterReportsList';
import CampsList from '../components/CampsList';

function Dashboard({ role = 'responder' }) {
    const location = useLocation();

    // Determine which list to show based on route
    if (location.pathname.includes('animal-rescue')) {
        return <AnimalRescueList role={role} />;
    }

    if (location.pathname.includes('disasters')) {
        return <DisasterReportsList role={role} />;
    }

    if (location.pathname.includes('camps')) {
        return <CampsList role={role} />;
    }

    // Default to missing persons list
    return <MissingPersonsList role={role} />;
}

export default Dashboard;
