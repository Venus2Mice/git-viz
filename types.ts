
export interface Commit {
  id: string;
  parents: string[];
  message: string;
  x: number;
  y: number;
}

export interface Branch {
  name: string;
  commitId: string;
}

export interface Tag {
  name: string;
  commitId: string;
}

export type Head = {
  type: 'branch';
  name: string;
} | {
  type: 'detached';
  commitId: string;
};
