export interface Roll {
  id: number
  name: string
  completed_at: Date
  student_roll_states: StudentRoll[]
}

export interface RollInput {
  student_roll_states: StudentRoll[]
}

export interface StudentRoll {
  student_id: number;
  roll_state: RolllStateType
}

export type RolllStateType = "unmark" | "present" | "absent" | "late"
