import React, { createContext, useReducer, useContext } from "react"
import { StudentRoll } from "../../shared/models/roll"

let rolls: StudentRoll[] = []

let Obj: any
export const RollContext = createContext(Obj)

const initialState = {
  currentRolls: rolls,
}

// Actions
export const ADD_NEW_ROLL = "ADD_NEW_ROLL"
export const UPDATE_ROLLS = "UPDATE_ROLLS"
export const RESET_ROLLS = "RESET_ROLLS"

// Action creators
export const addNewRoll = (payload: any) => {
  return { type: ADD_NEW_ROLL, payload }
}

export const updateRolls = (payload: any) => {
  return { type: UPDATE_ROLLS, payload }
}

export const resetRolls = () => {
  return { type: RESET_ROLLS }
}

export function rollReducer(state: any, action: any) {
  switch (action.type) {
    case ADD_NEW_ROLL:
      let newRoll = action.payload
      return {
        ...state,
        currentRolls: [...state.currentRolls, newRoll],
      }
    case UPDATE_ROLLS:
      let id = action.payload.studentId
      let updatedState = action.payload.state
      return {
        ...state,
        currentRolls: state.currentRolls.map((roll: any) => {
          return roll.student_id === id ? { ...roll, roll_state: updatedState } : roll
        }),
      }
    case RESET_ROLLS:
      let resetRolls: StudentRoll[] = []
      return {
        ...state,
        currentRolls: resetRolls,
      }
    default:
      return state
  }
}

function RollProvider(props: any) {
  const [rollDetails, dispatch] = useReducer(rollReducer, initialState)

  const rollData = { rollDetails, dispatch }

  return <RollContext.Provider value={rollData} {...props} />
}

function useRollContext() {
  return useContext(RollContext)
}

export { RollProvider, useRollContext }
