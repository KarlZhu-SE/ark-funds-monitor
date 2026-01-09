'use client';

import React, { useEffect, useState } from 'react';
import { CircularProgress, Box } from '@mui/material';
import NewsCard from './NewsCard';
import { useAppContext } from '../../context/AppContext';
import { getCompanyNewsUrl, token } from '../../shared/constants';
import { dateService } from '../../utils/date-service';

const CompanyNews = () => {
    const { ticker } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [news, setNews] = useState<any[]>([]);

    useEffect(() => {
        if (ticker) {
            getCompanyNews(ticker);
        } else {
            setNews([]);
        }
    }, [ticker]);

    const getCompanyNews = (currentTicker: string) => {
        setIsLoading(true);
        const fromDate = dateService.getDateStrOfDateRange(365);
        const toDate = dateService.getDateStrOfDateRange(0);
        
        const url = `${getCompanyNewsUrl}symbol=${currentTicker}&from=${fromDate}&to=${toDate}&token=${token}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setNews(data.slice(0, 9));
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    };

    if (isLoading) return <Box display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Box>
            {news.map(element =>
                <NewsCard key={element.id} newsDetails={element} />
            )}
        </Box>
    );
};

export default CompanyNews;
