export type Plant = {
  id: string;
  name: string;
  createdAt: string;
};

export type Task = {
  id: string;
  plantId: string;
  name: string;
  completions: string[];
  color?: string;
};
