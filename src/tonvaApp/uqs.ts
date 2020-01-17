import { Tuid, Map, Query, Action, Sheet } from "tonva";

export interface Task {
    Company: Tuid;
    QueryCompany: Query;
    Department: Tuid;
    QueryDepartment: Query;
    QueryAllDepartment: Query;
    QueryDepartments: Query;
    StaffMember: Tuid;
    QueryStaffMember:Query;
    SaveStaffDepartment:Action;
}

export interface UQs {
    task: Task;
}

