export interface Group {
  id: string;
  name: string;
  createdAt: string; // ISO8601
}

export interface Project {
  id: string;
  name: string;
  groupId: string | null;
  createdAt: string; // ISO8601
}

export interface Bucket {
  id: string;
  name: string;
  createdAt: string; // ISO8601
}
