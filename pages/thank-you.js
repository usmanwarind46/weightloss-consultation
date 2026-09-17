import ThankYou from '@/Components/ThankYou/ThankYou';
import { meta_url } from '@/config/constants';
import StepsHeader from '@/layout/stepsHeader';
import MetaLayout from '@/Meta/MetaLayout';
import React from 'react'

const thankYou = () => {
    return (
        <>
            <MetaLayout canonical={`${meta_url}thank-you/`} />

            <StepsHeader />

            <ThankYou />


        </>
    )
}

export default thankYou;