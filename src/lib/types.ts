export interface LeaveRow {
  employeeName: string;
  mediamintId: string;
  email: string;
  managerName: string;
  leaveType: string; // raw code, e.g. "PTO", "CL"
  daysHours: string; // e.g. "1 Day", "8 Hours"
  appliedOn: string;
  leaveDates: string;
  reason: string;
  day: string; // "Full" | "Half"
  startDate: string;
  endDate: string;
  status: string; // "Approved" | "Pending" | "Rejected" | ...
  country: string; // from a "Country" column if present, else defaults
}

/** Country used when the sheet has no Country column. */
export const DEFAULT_COUNTRY = "India";

/** Maps a Google Sheet header name to the LeaveRow field. Case/space tolerant. */
export const HEADER_MAP: Record<string, keyof LeaveRow> = {
  "employee name": "employeeName",
  "mediamint id": "mediamintId",
  email: "email",
  "manager name": "managerName",
  "leave type": "leaveType",
  "no. of days/hours": "daysHours",
  "no of days/hours": "daysHours",
  "days/hours": "daysHours",
  "applied on": "appliedOn",
  "leave dates": "leaveDates",
  reason: "reason",
  day: "day",
  "start date": "startDate",
  "end date": "endDate",
  status: "status",
  country: "country",
  location: "country",
};
