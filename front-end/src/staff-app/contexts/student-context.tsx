import React, { createContext, useReducer, useContext } from "react";
import { get, LocalStorageKey } from "../../shared/helpers/local-storage";

let Obj: any
export const StudentContext = createContext(Obj)
let allStudents: any[] | undefined = get(LocalStorageKey.students)

const initialState = {
  displayedStudents: get(LocalStorageKey.students),
  searchValue: '',
  filteredRollState: null,
  sortBy: 'first_name',
  sortDirection: 'none'
};

// Actions
export const ADD_STUDENTS = "ADD_STUDENTS";
export const UPDATE_DISPLAYED_STUDENTS = "UPDATE_DISPLAYED_STUDENTS";
export const UPDATE_STUDENT_SEARCH_FIELD = "UPDATE_STUDENT_SEARCH_FIELD"
export const UPDATE_FILTER_ROLL_STATE = "UPDATE_FILTER_ROLL_STATE";
export const UPDATE_SORT_BY = "UPDATE_SORT_BY";
export const UPDATE_SORT_DIRECTION = "UPDATE_SORT_DIRECTION";

// Action creators
export const addStudents = (payload: any) => {
  return { type: ADD_STUDENTS, payload };
}

export const updateDisplayedStudents = (payload: any) => {
  return { type: UPDATE_DISPLAYED_STUDENTS, payload };
}

export const updateFilterRollState = (payload: any) => {
  return { type: UPDATE_FILTER_ROLL_STATE, payload };
}

export const updateStudentSearch = (payload: any) => {
  return { type: UPDATE_STUDENT_SEARCH_FIELD, payload };
}

export const updateSortBy = (payload: any) => {
  return { type: UPDATE_SORT_BY, payload };
}

export const updateSortDirection = (payload: any) => {
  return { type: UPDATE_SORT_DIRECTION, payload };
}

const getSortedStudents = (students: any[] | undefined, sortBy: any, sortDirection: any) => {
  return students && students.sort((a: any, b: any) => {
    let as = a[sortBy].toLowerCase()
    let bs = b[sortBy].toLowerCase()
    if (sortDirection === 'ascending') {
      if (as < bs)
        return -1;
      if (as > bs)
        return 1
      return 0
    } else if (sortDirection === 'descending') {
      if (as < bs)
        return 1;
      if (as > bs)
        return -1
      return 0
    }
    return 0
  })
}

export function studentReducer(state: any, action: any) {
  switch (action.type) {
    case ADD_STUDENTS:
      return {
        ...state,
        displayedStudents: action.payload
      };
    case UPDATE_DISPLAYED_STUDENTS:
      let stateTobeFiltered = state.filteredRollState
      let searchKeyword = state.searchValue
      let rolls = action.payload.rolls
      let sortBy = state.sortBy
      let sortDirection = state.sortDirection
      let studentIdsFiltered = rolls.map((roll: any) => {
        return roll.roll_state === stateTobeFiltered && roll.student_id
      })
      let serachFilteredStudents: any[] | undefined = []
      if (searchKeyword === '') {
        serachFilteredStudents = allStudents
      } else {
        serachFilteredStudents = allStudents?.filter((student: any) => {
          return student.first_name.toLowerCase().indexOf(searchKeyword.toLowerCase()) > -1 || student.last_name.toLowerCase().indexOf(searchKeyword.toLowerCase()) > -1
        })
      }
      return {
        ...state,
        displayedStudents: (stateTobeFiltered === 'all' || !stateTobeFiltered) ? getSortedStudents(serachFilteredStudents, sortBy, sortDirection) : serachFilteredStudents && getSortedStudents(serachFilteredStudents, sortBy, sortDirection)?.filter((student: any) => {
          return studentIdsFiltered.indexOf(student.id) > -1
        })
      };
    case UPDATE_FILTER_ROLL_STATE:
      return {
        ...state,
        filteredRollState: action.payload
      };
    case UPDATE_STUDENT_SEARCH_FIELD:
      return {
        ...state,
        searchValue: action.payload
      };
    case UPDATE_SORT_BY:
      return {
        ...state,
        sortBy: action.payload
      };
    case UPDATE_SORT_DIRECTION:
      return {
        ...state,
        sortDirection: action.payload
      };
    default:
      return state;
  }
}

function StudentProvider(props: any) {
  const [studentDetails, dispatch] = useReducer(studentReducer, initialState);

  const studentData = { studentDetails, dispatch };

  return <StudentContext.Provider value={studentData} {...props} />;
}

function useStudentContext() {
  return useContext(StudentContext);
}

export { StudentProvider, useStudentContext };