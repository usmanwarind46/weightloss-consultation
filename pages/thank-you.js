import ThankYou from '@/Components/ThankYou/ThankYou';
import { meta_url } from '@/config/constants';
import MetaLayout from '@/Meta/MetaLayout';
import React from 'react'

const thankYou = () => {
    return (
        <>
            <MetaLayout canonical={`${meta_url}thank-you/`} />


            <ThankYou />


        </>
    )
}

export default thankYou;