export type Organization = {
  id: string;
  name: string;
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
};

export const organizations: Organization[] = [
  { id: "org_1", name: "Acme Inc.", createdAt: "2023-01-15" },
  { id: "org_2", name: "Startup LLC", createdAt: "2023-02-20" },
  { id: "org_3", name: "Innovate Corp", createdAt: "2023-03-10" },
];

export const apiKeys: ApiKey[] = [
  { id: "key_1", key: "ek_ext_xxxxxxxxxxxxxxxxxxxx1234", organization: "Acme Inc.", environment: "external.radpair.com", createdAt: "2023-01-16" },
  { id: "key_2", key: "ek_ext_xxxxxxxxxxxxxxxxxxxxx5678", organization: "Startup LLC", environment: "external.radpair.com", createdAt: "2023-02-21" },
];

export const environments: Environment[] = [
  { id: "env_1", name: "external.radpair.com" },
];
