import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyOrders from "@/Components/Dashboard/MyOrders/MyOrders";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import { meta_url } from "@/config/constants";
import MetaLayout from "@/Meta/MetaLayout";
import React from "react";

const orders = () => {
  return (<>

    <MetaLayout canonical={`${meta_url}orders/`} />

    <ProtectedPage>
      <DashBoardLayout>
        <MyOrders />
      </DashBoardLayout>
    </ProtectedPage>
  </>
  );
};

export default orders;
