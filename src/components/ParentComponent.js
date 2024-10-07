import React, { useState, useEffect } from 'react';
import Proposals from './Proposals';
import Create from './Create';

const ParentComponent = ({ provider, dao }) => {
    const [proposals, setProposals] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProposals = async () => {
        const fetchedProposals = await dao.getProposals(); // Assuming getProposals is a method to fetch proposals
        setProposals(fetchedProposals);
    };

    const refreshProposals = () => {
        setIsLoading(true);
        fetchProposals().then(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchProposals();
    }, [dao]);

    return (
        <div>
            <Create provider={provider} dao={dao} setIsLoading={setIsLoading} addProposal={setProposals} />
            <Proposals provider={provider} dao={dao} proposals={proposals} setIsLoading={setIsLoading} refreshProposals={refreshProposals} />
        </div>
    );
};

