import React, { useContext, useEffect, useState } from "react"
import { RolllStateType } from "shared/models/roll"
import { useApi } from "shared/hooks/use-api"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"
import { addNewRoll, updateRolls, useRollContext } from "../../contexts/roll-context";

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType) => void
  studentId: number
}
export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, onStateChange, studentId }) => {
  let { rollDetails, dispatch } = useRollContext()
  const getRollState = (studentId: any) => {
    let rollState: RolllStateType = 'unmark'
    rollDetails.currentRolls.map((roll:any) => {
      if(roll.student_id === studentId){
        rollState = roll.roll_state;
      }
      return ''
    })
    return rollState
  }
  
  const [rollState, setRollState] = useState<RolllStateType>(getRollState(studentId))
  const [saveRoll, data, loadState] = useApi({ url: "save-roll" })

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (rollState === "unmark" || rollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === rollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const findWithAttr = (array: any[], attr: string | number, value: any) => {
    for (var i = 0; i < array.length; i += 1) {
      if (array[i][attr] === value) {
        return i;
      }
    }
    return -1;
  }

  const onClick = (studentId: number) => {
    const next = nextState()
    setRollState(next)
    if (onStateChange) {
      onStateChange(next)
    }
    let rollObj = {
      student_id: studentId,
      roll_state: next
    }
    if (rollDetails.currentRolls && rollDetails.currentRolls.length > 0) {
      let rolls: any[] = rollDetails.currentRolls
      if (findWithAttr(rolls, "student_id", studentId) !== -1) {
        dispatch(updateRolls({
          studentId: studentId,
          state: next
        }))
      } else {
        dispatch(addNewRoll(rollObj))
      }
    } else {
      dispatch(addNewRoll(rollObj))
    }
  }

  return <RollStateIcon type={rollState} size={size} onClick={() => onClick(studentId)} />
}
