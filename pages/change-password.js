import DashBoardLayout from "@/Components/Dashboard/DashboardLayout/DashBoardLayout";
import PasswordChange from "@/Components/Dashboard/PasswordChnaged/PasswordChange";
import ProtectedPage from "@/Components/ProtectedPage/ProtectedPage";
import React from "react";

const changePassword = () => {
  return (
    <ProtectedPage>
      <DashBoardLayout>
        <PasswordChange />
      </DashBoardLayout>
    </ProtectedPage>
  );
};

export default changePassword;
