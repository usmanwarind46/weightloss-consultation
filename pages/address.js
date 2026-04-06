import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import MyAddress from "@/Components/Dashboard/MyAddress/MyAddress";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import { meta_url } from "@/config/constants";
import MetaLayout from "@/Meta/MetaLayout";
import React from "react";

const Address = () => {
  return (
    <>
     <MetaLayout canonical={`${meta_url}address/`}/>

      <ProtectedPage>
        <DashBoardLayout>
          <MyAddress />
        </DashBoardLayout>
      </ProtectedPage>
    </>
  );
};

export default Address;
