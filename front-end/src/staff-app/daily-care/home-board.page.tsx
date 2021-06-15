import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { RollInput } from "shared/models/roll"
import { useApi } from "shared/hooks/use-api"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { buildActivities } from "../../api/get-activities"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { useRollContext, resetRolls } from "../contexts/roll-context"
import { useStudentContext, updateStudentSearch, updateFilterRollState, updateDisplayedStudents, updateSortBy, updateSortDirection } from "../contexts/student-context"
import "antd/dist/antd.css"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [saveRoll] = useApi({ url: "save-roll" })
  let { studentDetails, dispatch } = useStudentContext()
  let { rollDetails } = useRollContext()
  let rollDispatch = useRollContext().dispatch

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
  }

  const onActiveRollAction = async (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
      await dispatch(updateFilterRollState("all"))
      dispatch(
        updateDisplayedStudents({
          rolls: rollDetails.currentRolls,
        })
      )
    } else if (action === "complete") {
      setIsRollMode(false)
      if (rollDetails.currentRolls && rollDetails.currentRolls.length > 0) {
        let newRollInput: RollInput = {
          student_roll_states: rollDetails.currentRolls,
        }
        await saveRoll(newRollInput)
        buildActivities()
        rollDispatch(resetRolls())
      }
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && studentDetails.displayedStudents && (
          <>
            {studentDetails.displayedStudents.map((s: any) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
    </>
  )
}

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick } = props
  let { studentDetails, dispatch } = useStudentContext()
  let { rollDetails } = useRollContext()

  const onSearchStudents = async (event: any) => {
    await dispatch(updateStudentSearch(event.target.value))
    dispatch(
      updateDisplayedStudents({
        rolls: rollDetails.currentRolls,
      })
    )
  }

  const getNextSortDirection = () => {
    switch (studentDetails.sortDirection) {
      case "ascending":
        return "descending"
      case "descending":
        return "none"
      case "none":
        return "ascending"
      default:
        return "none"
    }
  }

  const onSortByChange = async (event: any) => {
    await dispatch(updateSortBy(event.target.value))
    dispatch(
      updateDisplayedStudents({
        rolls: rollDetails.currentRolls,
      })
    )
  }

  const onSortClick = async () => {
    await dispatch(updateSortDirection(getNextSortDirection()))
    dispatch(
      updateDisplayedStudents({
        rolls: rollDetails.currentRolls,
      })
    )
  }

  return (
    <S.ToolbarContainer>
      <S.SelectAndSort>
        <S.Select value={studentDetails.sortBy} onChange={(e) => onSortByChange(e)}>
          <S.Option value="first_name">First Name</S.Option>
          <S.Option value="last_name">Last Name</S.Option>
        </S.Select>
        <S.SortDiv>
          <S.SortUp sortdirection={studentDetails.sortDirection} onClick={onSortClick} />
          <S.SortDown sortdirection={studentDetails.sortDirection} onClick={onSortClick} />
        </S.SortDiv>
      </S.SelectAndSort>
      <S.Input placeholder="Search" value={studentDetails.searchValue} onChange={(e) => onSearchStudents(e)} />
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
  Input: styled.input`
    && {
      height: 50%;
      background-color: ${Colors.blue.base};
      color: #fff;
      font-weight: ${FontWeight.normal};
      border-radius: 5px;
      width: 50%;
      border-color: grey;
    }
    ::placeholder {
      color: #fff;
      font-weight: ${FontWeight.mediumStrong};
      text-align: center;
      opacity: 1;
    }
    :focus {
      border-color: darkgray;
    }
  `,
  Select: styled.select`
    && {
      height: 50%;
      background-color: ${Colors.blue.base};
      color: #fff;
      font-weight: ${FontWeight.strong};
    }
  `,
  Option: styled.option`
    && {
      color: #fff;
      font-weight: ${FontWeight.mediumStrong};
    }
    :hover {
      background-color: red;
    }
  `,
  SortDiv: styled.div`
    && {
      display: flex;
      flex-direction: column;
      margin-left: 5px;
    }
  `,
  SelectAndSort: styled.div`
    && {
      display: flex;
      flex-direction: row;
    }
  `,
  SortUp: styled(CaretUpOutlined)<{ sortdirection: string }>`
    && {
      color: ${({ sortdirection }) => (sortdirection === "ascending" ? Colors.white : Colors.grey)};
    }
  `,
  SortDown: styled(CaretDownOutlined)<{ sortdirection: string }>`
    && {
      color: ${({ sortdirection }) => (sortdirection === "descending" ? Colors.white : Colors.grey)};
    }
  `,
}
