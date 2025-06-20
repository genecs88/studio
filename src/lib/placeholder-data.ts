export type Organization = {
  id: string;
  name: string;
  environmentId: string;
  patientIdentifiers: { key: string; value: string }[];
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

export const organizations: Organization[] = [
  {
    id: "org_1",
    name: "Acme Inc.",
    environmentId: "env_1",
    patientIdentifiers: [{ key: "MRN", value: "medical_record_number" }],
    createdAt: "2023-01-15",
  },
  {
    id: "org_2",
    name: "Startup LLC",
    environmentId: "env_1",
    patientIdentifiers: [{ key: "PatientID", value: "patient_identifier" }],
    createdAt: "2023-02-20",
  },
  {
    id: "org_3",
    name: "Innovate Corp",
    environmentId: "env_1",
    patientIdentifiers: [],
    createdAt: "2023-03-10",
  },
];

export const apiKeys: ApiKey[] = [
  { id: "key_1", key: "ek_ext_xxxxxxxxxxxxxxxxxxxx1234", organization: "Acme Inc.", environment: "external.radpair.com", createdAt: "2023-01-16" },
  { id: "key_2", key: "ek_ext_xxxxxxxxxxxxxxxxxxxxx5678", organization: "Startup LLC", environment: "external.radpair.com", createdAt: "2023-02-21" },
];

export const environments: Environment[] = [
  { id: "env_1", name: "external.radpair.com", url: "https://external.radpair.com" },
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
