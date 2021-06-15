import React, { useEffect, useState } from "react"
import styled from "styled-components"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import { get, LocalStorageKey } from "shared/helpers/local-storage";
import { Activity } from "shared/models/activity";
import { Roll } from "shared/models/roll";
import { Person } from "shared/models/person";
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component";
import { useApi } from "shared/hooks/use-api";
import { CenteredContainer } from "shared/components/centered-container/centered-container.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export const ActivityPage: React.FC = () => {
  const [getActivities, data, loadState] = useApi<{ activities: Activity[] }>({ url: "get-activities" })

  useEffect(() => {
    void getActivities()
  }, [getActivities])

  let [open, setOpen] = useState(false)
  let [entity, setEntity] = useState<Roll>({
    id: 0,
    name: '',
    completed_at: new Date(),
    student_roll_states: [],

  })

  const handleViewClick = (entity: Roll) => {
    if (!open) {
      setEntity(entity)
    }
    setOpen(!open)
  }

  const handleClose = () => {
    setOpen(false)
  }

  return <S.Container>
    <S.ToolbarContainer>
      Activities
    </S.ToolbarContainer>

    {loadState === "loading" && (
      <CenteredContainer>
        <FontAwesomeIcon icon="spinner" size="2x" spin />
      </CenteredContainer>
    )}

    {loadState === "loaded" && data?.activities && (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Completed Date/Time</TableCell>
              <TableCell>Entity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.activities.map((activity: any) => (
              <TableRow key={activity.date}>
                <TableCell>{activity.type}</TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell>
                  <a onClick={() => handleViewClick(activity.entity)}>view</a>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <RollModalTable open={open} roll={entity!} onClose={handleClose} />
      </TableContainer>
    )}

    {loadState === "error" && (
      <CenteredContainer>
        <div>Failed to load</div>
      </CenteredContainer>
    )}
  </S.Container>
}

interface RollModalTableProps {
  open: boolean;
  onClose: () => void;
  roll: Roll
}
const RollModalTable: React.FC<RollModalTableProps> = (props) => {
  let students: Person[] = get(LocalStorageKey.students) || []
  let { open, onClose, roll } = props
  let rolls = roll.student_roll_states

  const getFullName = (id: number): string => {
    let fullName: string = ''
    students.map((student: Person) => {
      if (student.id === id) {
        fullName = student.first_name + ' ' + student.last_name
      }
    })
    return fullName
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth={'md'}>
        <Table>
          <S.StyledTableHead>
            <TableRow>
              <S.StyledTableCell>Student ID</S.StyledTableCell>
              <S.StyledTableCell>Student Name</S.StyledTableCell>
              <S.StyledTableCell>Roll State</S.StyledTableCell>
            </TableRow>
          </S.StyledTableHead>
          <TableBody>
            {rolls.map((row: any) => (
              <TableRow key={row.student_id}>
                <TableCell>{row.student_id}</TableCell>
                <TableCell>{getFullName(row.student_id)}</TableCell>
                <TableCell><RollStateIcon type={row.roll_state} size={30} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Dialog>
    </>
  )
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 0;
  `,
  ToolbarContainer: styled.div`
  text-align: center;
  color: #fff;
  background-color: ${Colors.blue.base};
  padding: 6px 14px;
  font-weight: ${FontWeight.strong};
  border-radius: ${BorderRadius.default};
  `,
  StyledTableHead: styled(TableHead)`
  && {
    background-color: ${Colors.blue.base};
  }
  `,
  StyledTableCell: styled(TableCell)`
  && {
    color: #fff
  }
  `,
}
