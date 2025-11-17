
import { BrowserRouter, Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext.jsx'
import ProtectedRoute from '../components/ProtectedRoute.jsx'


import CreateDeal from './CreateDeal.jsx'
import TransactionSummary from './TransactionSummary.jsx'
import TransactionDetails from './TransactionDetails.jsx'
import Transact from './Transact.jsx'
import Login from './Login.jsx'
import Signup from './Signup.jsx'
import ForgotPassword from './ForgotPassword.jsx'
import ResetPassword from './ResetPassword.jsx'
import CheckEmail from './CheckEmail.jsx'
import VerifyEmail from './VerifyEmail.jsx'
import VerifyEmailCode from './VerifyEmailCode.jsx'
import Header from '../components/Header.jsx'
import Layout from '../components/Layout.jsx'
import SignUpForm from './Onboarding.jsx'
import Transactions from './Transactions.jsx'
import TransactionStart from './TransactionStart.jsx'
import TransactionProgress from './TransactionProgress.jsx'
import DealDetails from './DealDetails.jsx'
import SellerPaymentSetup from './SellerPaymentSetup.jsx'
import PaymentPage from './PaymentPage.jsx'
import PaymentConfirmation from './PaymentConfirmation.jsx'
import AssetTransfer from './AssetTransfer.jsx'
import InspectionPeriod from './InspectionPeriod.jsx'
import TransactionComplete from './TransactionComplete.jsx'
import Onboarding from './Onboarding.jsx'
import Home from './Home.jsx'
import PaymentInvoice from './PaymentInvoice.jsx'
import AdminPayouts from './AdminPayouts.jsx'
import VerifyProfile from './VerifyProfile.jsx'
import Profile from './Profile.jsx'

export default function App() {

  return (
    <Routes>
      {/* Redirect / to /home */}
          <Route path="/" element={<Navigate to="/home" />} />
      { /* Public Routes */}
      
        <Route element={<Layout />}>
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email-code" element={<VerifyEmailCode />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/home" element={<Home />} />

        {/* Protected Routes that require verification */}
        <Route
          path="/verify-profile"
          element={
            <ProtectedRoute>
              <VerifyProfile />
            </ProtectedRoute>
          }
        />
        
        </Route>

        {/* Protected Routes */}
        <Route
        element={<Layout />}
        
      >
          <Route path="/transactions" element={
            <ProtectedRoute requireVerification={true}>
              <Transactions />
            </ProtectedRoute>}
          />
          
          <Route
            path="/create-deal"
            element={
              <ProtectedRoute requireVerification={true}>
                <CreateDeal />
              </ProtectedRoute>}
          />
          <Route
            path="/transaction-summary"
            element={
              <ProtectedRoute requireVerification={true}>
                <TransactionSummary />
              </ProtectedRoute>}
          />
          <Route
            path="/transaction-details"
            element={
              <ProtectedRoute requireVerification={true}>
                <TransactionDetails />
              </ProtectedRoute>}
          />
          <Route
            path="/transact/"
            element={
              <ProtectedRoute requireVerification={true}>
                <Transact />
              </ProtectedRoute>}
          />
          
        <Route
            path="/check-email"
            element={
              <ProtectedRoute requireVerification={true}>
                <CheckEmail />
              </ProtectedRoute>}
        />
        
        <Route
          path="/transaction-start"
          element={
            <ProtectedRoute requireVerification={true}>
              <TransactionStart />
            </ProtectedRoute>
          }

        />
        <Route
            path="/transaction-details/:id"
            element={
              <ProtectedRoute requireVerification={true}>
                <TransactionDetails />
              </ProtectedRoute> }
          />

        <Route
          path="/transaction-progress"
          element={
            <ProtectedRoute requireVerification={true}>
              <TransactionProgress />
            </ProtectedRoute>
          }
        />

        <Route
            path="/deal-details/:id"
            element={
              <ProtectedRoute requireVerification={true}>
                <DealDetails />
              </ProtectedRoute>
            }
          />
        <Route
            path="/seller-payment-setup"
            element={
              <ProtectedRoute requireVerification={true}>
                <SellerPaymentSetup />
              </ProtectedRoute>
            }
          />
        <Route
            path="/payment/:id"
            element={
              <ProtectedRoute requireVerification={true}>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
        <Route
            path="/payment-confirmation/:id"
            element={
              <ProtectedRoute requireVerification={true}>
                <PaymentConfirmation />
              </ProtectedRoute>
            }
          />
        <Route
            path="/asset-transfer/:id"
            element={
              <ProtectedRoute requireVerification={true}>
                <AssetTransfer />
              </ProtectedRoute>
            }
          />
        <Route
            path="/inspection-period/:id"
            element={
              <ProtectedRoute requireVerification={true}>
                <InspectionPeriod />
              </ProtectedRoute>
            }
          />
        <Route
            path="/transaction-complete/:id"
            element={
              <ProtectedRoute requireVerification={true}>
                <TransactionComplete />
              </ProtectedRoute>
            }
          />
      </Route>
      <Route
          path="/payment-invoice/:id"
          element={
          <ProtectedRoute requireVerification={true}>
            <PaymentInvoice />
          </ProtectedRoute>
          }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
          path="/admin/payouts"
          element={
          <ProtectedRoute adminOnly={true}>
            <AdminPayouts />
          </ProtectedRoute>
          }
      />

      
      </Routes>
      
  );

}
