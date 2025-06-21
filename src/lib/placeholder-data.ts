
export type Organization = {
  id: string;
  name: string;
  environmentId: string;
  studyIdentifiers: { key: string; value: string }[];
  createdAt: string;
};

export type ApiKey = {
  id: string;
  key: string;
  organization: string;
  environment: string;
  createdAt: string;
};

export type Environment = {
  id: string;
  name: string;
  url: string;
};

export type OrgPath = {
  id: string;
  path: string;
  organizationId: string;
  createdAt: string;
};

export type ApiAction = {
  id: string;
  key: string;
  value: string;
  environmentId: string;
  createdAt: string;
};

export const organizations: Organization[] = [
  {
    id: "org_1",
    name: "Acme Inc.",
    environmentId: "env_1",
    studyIdentifiers: [{ key: "MRN", value: "mrn" }],
    createdAt: "2023-01-15",
  },
  {
    id: "org_2",
    name: "Startup LLC",
    environmentId: "env_1",
    studyIdentifiers: [{ key: "PatientID", value: "patient_id" }],
    createdAt: "2023-02-20",
  },
  {
    id: "org_3",
    name: "Innovate Corp",
    environmentId: "env_1",
    studyIdentifiers: [
        { key: "Native ID", value: "native_id"},
        { key: "Assigning Authority", value: "assigning_authority"}
    ],
    createdAt: "2023-03-10",
  },
  {
    id: "org_4",
    name: "EugeneDemo",
    environmentId: "env_1",
    studyIdentifiers: [{ key: "Site ID", value: "site_ID" }],
    createdAt: "2024-06-01",
  },
];

export const apiKeys: ApiKey[] = [
  { id: "key_1", key: "ek_ext_xxxxxxxxxxxxxxxxxxxx1234", organization: "Acme Inc.", environment: "external.radpair.com", createdAt: "2023-01-16" },
  { id: "key_2", key: "ek_ext_xxxxxxxxxxxxxxxxxxxxx5678", organization: "Startup LLC", environment: "external.radpair.com", createdAt: "2023-02-21" },
  { id: "key_3", key: "ek_ext_xxxxxxxxxxxxxxxxxxxxx9012", organization: "Innovate Corp", environment: "external.radpair.com", createdAt: "2023-03-11" },
  {
    id: "key_4",
    key: "rsk_x4JRnF9s5neZf0X9KzRQWj3yDCTMuqLv81VJ9Scxa0t",
    organization: "EugeneDemo",
    environment: "external.radpair.com",
    createdAt: "2024-06-01"
  },
];

export const environments: Environment[] = [
  { id: "env_1", name: "external.radpair.com", url: "https://api.radpair.com" },
];

export const orgPaths: OrgPath[] = [
  {
    id: "path_1",
    path: "dept1,regionA,groupX",
    organizationId: "org_1",
    createdAt: "2023-04-01",
  },
  {
    id: "path_2",
    path: "dept2,regionB,groupY",
    organizationId: "org_1",
    createdAt: "2023-04-02",
  },
  {
    id: "path_3",
    path: "finance,us-east,team1",
    organizationId: "org_2",
    createdAt: "2023-04-05",
  },
];

export const apiActions: ApiAction[] = [
    { id: "action_1", key: "default_model", value: "gemini-1.5-pro", environmentId: "env_1", createdAt: "2023-05-01" },
    { id: "action_2", key: "timeout_ms", value: "30000", environmentId: "env_1", createdAt: "2023-05-02" },
    { id: "action_3", key: "FIND", value: "/integrations/reports/find", environmentId: "env_1", createdAt: "2023-05-03" },
];

    
