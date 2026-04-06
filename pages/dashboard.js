import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyAccount from "@/Components/Dashboard/MyAccount/MyAccount";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import { meta_url } from "@/config/constants";
import MetaLayout from "@/Meta/MetaLayout";
import React from "react";

const Dashboard = () => {
  return (
    <>
      <MetaLayout canonical={`${meta_url}dashboard/`} />

      <ProtectedPage>
        <DashBoardLayout>
          <MyAccount />
        </DashBoardLayout>
      </ProtectedPage>
    </>
  );
};

export default Dashboard;
