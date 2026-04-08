import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import WeightLossJourney from "../Components/WeightLossJourney/WeightLossJourney";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import { meta_url } from "@/config/constants";
import MetaLayout from "@/Meta/MetaLayout";
import React from "react";

const WeightLoss = () => {
  return (
    <>
      <MetaLayout canonical={`${meta_url}weight-loss-journey`} noIndex />
      <ProtectedPage>
        <DashBoardLayout>
          <WeightLossJourney />
        </DashBoardLayout>
      </ProtectedPage>
    </>
  );
};

export default WeightLoss;
