import { NavigatorScreenParams } from '@react-navigation/native';

/* ------------------------------------------------------------------ */
/* Services stack                                                     */
/* ------------------------------------------------------------------ */
export type ServicesStackParamList = {
  Services: undefined;                // ServicesScreen root
  HomeCategory: undefined;
  Scan:       undefined; 
  EmergencyChoice: undefined;
  EmergencyDonate: undefined;
  EmergencyReceive: undefined;
  VehicleCategory: undefined;
  ServiceDetails: { id: string; name?: string };
  // AidCategory: undefined;          // uncomment when adding AidCategory
};

/* ------------------------------------------------------------------ */
/* More tab nested stack                                              */
/* ------------------------------------------------------------------ */
export type MoreStackParamList = {
  MoreHome: undefined;
  MyRequests: { serviceId?: string; serviceName?: string };
  Scan:       undefined; 
  Profile: undefined;
};

/* ------------------------------------------------------------------ */
/* Contractor bottom‑tab navigator                                    */
/* ------------------------------------------------------------------ */
export type ContractorTabsParamList = {
  Home: undefined;
  "I'm a Supplier": undefined;
  More: NavigatorScreenParams<MoreStackParamList>;
};

/* ------------------------------------------------------------------ */
/* General user bottom‑tab navigator                                  */
/* ------------------------------------------------------------------ */
export type RootTabsParamList = {
  Home: { userType?: string };
  Services: NavigatorScreenParams<ServicesStackParamList>;
  Scan: undefined;
  Supplier: undefined;
  More: NavigatorScreenParams<MoreStackParamList>;
};

/* ------------------------------------------------------------------ */
/* Top‑level authentication / entry stack                             */
/* ------------------------------------------------------------------ */
export type AuthStackParamList = {
  Index: undefined;
  Login: undefined;
  SignUp: undefined;
  SignUpContractor: undefined;
  ContractorTabs: NavigatorScreenParams<ContractorTabsParamList>;
  ContractorHome: undefined; // kept for backward compatibility
  ContractorFeedback: { requestId: string; fullName: string };
  RootTabs: NavigatorScreenParams<RootTabsParamList>;
  Help: undefined;
  Contact: undefined;
  MySupplier: undefined;
  CareerScreen: undefined;
  PrivacyScreen: undefined;
  TermsScreen: undefined;
};
