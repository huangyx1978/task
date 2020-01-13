import { Tuid, Map, Query, Action, Sheet } from "tonva";

export interface Task {
    Company: Tuid;
    QueryCompany: Query;
    Department: Tuid;
}

export interface UQs {
    task: Task
}

