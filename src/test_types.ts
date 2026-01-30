import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']
type Attendances = Tables['attendances']
type AttendancesInsert = Attendances['Insert']

const testAttendance: AttendancesInsert = {
    organization_id: '123',
    employee_id: '123',
    date: '2023-01-01',
    // check_in is optional?
    status: 'PRESENT'
    // notes optional
};
