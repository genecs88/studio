export type Organization = {
  id: string;
  name: string;
  createdAt: string;
};

export type ApiKey = {
  id: string;
  key: string;
  organization: string;
  environment: "Production" | "Staging" | "Development";
  createdAt: string;
};

export type Environment = {
  id: string;
  name: "Production" | "Staging" | "Development";
};

export const organizations: Organization[] = [
  { id: "org_1", name: "Acme Inc.", createdAt: "2023-01-15" },
  { id: "org_2", name: "Startup LLC", createdAt: "2023-02-20" },
  { id: "org_3", name: "Innovate Corp", createdAt: "2023-03-10" },
];

export const apiKeys: ApiKey[] = [
  { id: "key_1", key: "ek_prod_xxxxxxxxxxxxxxxxxxxx1234", organization: "Acme Inc.", environment: "Production", createdAt: "2023-01-16" },
  { id: "key_2", key: "ek_dev_xxxxxxxxxxxxxxxxxxxxx5678", organization: "Acme Inc.", environment: "Development", createdAt: "2023-01-16" },
  { id: "key_3", key: "ek_prod_xxxxxxxxxxxxxxxxxxxxx90ab", organization: "Startup LLC", environment: "Production", createdAt: "2023-02-21" },
  { id: "key_4", key: "ek_stag_xxxxxxxxxxxxxxxxxxxxx_cdef", organization: "Innovate Corp", environment: "Staging", createdAt: "2023-03-11" },
];

export const environments: Environment[] = [
  { id: "env_1", name: "Production" },
  { id: "env_2", name: "Staging" },
  { id: "env_3", name: "Development" },
];
