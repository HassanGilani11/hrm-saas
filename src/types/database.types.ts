// Database Types for HRM SaaS
// Auto-generated types for Supabase tables

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            organizations: {
                Row: {
                    id: string
                    name: string
                    slug: string
                    email: string
                    phone: string | null
                    address: Json | null
                    logo_url: string | null
                    subscription_plan: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
                    subscription_status: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'CANCELLED'
                    settings: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                    email: string
                    phone?: string | null
                    address?: Json | null
                    logo_url?: string | null
                    subscription_plan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
                    subscription_status?: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'CANCELLED'
                    settings?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                    email?: string
                    phone?: string | null
                    address?: Json | null
                    logo_url?: string | null
                    subscription_plan?: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'
                    subscription_status?: 'ACTIVE' | 'INACTIVE' | 'TRIAL' | 'CANCELLED'
                    settings?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            users: {
                Row: {
                    id: string
                    organization_id: string
                    email: string
                    role: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    organization_id: string
                    email: string
                    role?: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    email?: string
                    role?: 'SUPER_ADMIN' | 'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            departments: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    description: string | null
                    head_id: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    name: string
                    description?: string | null
                    head_id?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    name?: string
                    description?: string | null
                    head_id?: string | null
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            designations: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    description: string | null
                    level: number
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    name: string
                    description?: string | null
                    level?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    name?: string
                    description?: string | null
                    level?: number
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            employees: {
                Row: {
                    id: string
                    organization_id: string
                    user_id: string | null
                    employee_id: string
                    first_name: string
                    last_name: string
                    email: string
                    phone: string
                    date_of_birth: string
                    gender: 'MALE' | 'FEMALE' | 'OTHER'
                    blood_group: string | null
                    marital_status: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
                    profile_image_url: string | null
                    department_id: string
                    designation_id: string
                    manager_id: string | null
                    employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
                    joining_date: string
                    confirmation_date: string | null
                    resignation_date: string | null
                    status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED'
                    current_address: Json | null
                    permanent_address: Json | null
                    emergency_contacts: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    user_id?: string | null
                    employee_id: string
                    first_name: string
                    last_name: string
                    email: string
                    phone: string
                    date_of_birth: string
                    gender: 'MALE' | 'FEMALE' | 'OTHER'
                    blood_group?: string | null
                    marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
                    profile_image_url?: string | null
                    department_id: string
                    designation_id: string
                    manager_id?: string | null
                    employment_type: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
                    joining_date: string
                    confirmation_date?: string | null
                    resignation_date?: string | null
                    status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED'
                    current_address?: Json | null
                    permanent_address?: Json | null
                    emergency_contacts?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    user_id?: string | null
                    employee_id?: string
                    first_name?: string
                    last_name?: string
                    email?: string
                    phone?: string
                    date_of_birth?: string
                    gender?: 'MALE' | 'FEMALE' | 'OTHER'
                    blood_group?: string | null
                    marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED'
                    profile_image_url?: string | null
                    department_id?: string
                    designation_id?: string
                    manager_id?: string | null
                    employment_type?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERN'
                    joining_date?: string
                    confirmation_date?: string | null
                    resignation_date?: string | null
                    status?: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED'
                    current_address?: Json | null
                    permanent_address?: Json | null
                    emergency_contacts?: Json | null
                    created_at?: string
                    updated_at?: string
                }
            }
            leave_types: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    code: string
                    description: string | null
                    default_days: number
                    carry_forward: boolean
                    max_carry_forward: number | null
                    is_paid: boolean
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    name: string
                    code: string
                    description?: string | null
                    default_days: number
                    carry_forward?: boolean
                    max_carry_forward?: number | null
                    is_paid?: boolean
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    name?: string
                    code?: string
                    description?: string | null
                    default_days?: number
                    carry_forward?: boolean
                    max_carry_forward?: number | null
                    is_paid?: boolean
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            leave_balances: {
                Row: {
                    id: string
                    organization_id: string
                    employee_id: string
                    leave_type_id: string
                    year: number
                    allocated: number
                    used: number
                    pending: number
                    available: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    employee_id: string
                    leave_type_id: string
                    year: number
                    allocated: number
                    used?: number
                    pending?: number
                    available?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    employee_id?: string
                    leave_type_id?: string
                    year?: number
                    allocated?: number
                    used?: number
                    pending?: number
                    available?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            attendances: {
                Row: {
                    id: string
                    organization_id: string
                    employee_id: string
                    date: string
                    check_in: string | null
                    check_out: string | null
                    check_in_location: Json | null
                    check_out_location: Json | null
                    working_hours: number | null
                    overtime_hours: number | null
                    status: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'WEEKEND'
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    employee_id: string
                    date: string
                    check_in?: string | null
                    check_out?: string | null
                    check_in_location?: Json | null
                    check_out_location?: Json | null
                    working_hours?: number | null
                    overtime_hours?: number | null
                    status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'WEEKEND'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    employee_id?: string
                    date?: string
                    check_in?: string | null
                    check_out?: string | null
                    check_in_location?: Json | null
                    check_out_location?: Json | null
                    working_hours?: number | null
                    overtime_hours?: number | null
                    status?: 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'LEAVE' | 'HOLIDAY' | 'WEEKEND'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            leaves: {
                Row: {
                    id: string
                    organization_id: string
                    employee_id: string
                    leave_type_id: string
                    start_date: string
                    end_date: string
                    days: number
                    is_half_day: boolean
                    reason: string
                    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
                    approver_id: string | null
                    approver_notes: string | null
                    approved_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    employee_id: string
                    leave_type_id: string
                    start_date: string
                    end_date: string
                    days: number
                    is_half_day?: boolean
                    reason: string
                    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
                    approver_id?: string | null
                    approver_notes?: string | null
                    approved_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    employee_id?: string
                    leave_type_id?: string
                    start_date?: string
                    end_date?: string
                    days?: number
                    is_half_day?: boolean
                    reason?: string
                    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
                    approver_id?: string | null
                    approver_notes?: string | null
                    approved_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            holidays: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    date: string
                    type: 'PUBLIC' | 'RESTRICTED' | 'COMPANY'
                    is_optional: boolean
                    description: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    name: string
                    date: string
                    type?: 'PUBLIC' | 'RESTRICTED' | 'COMPANY'
                    is_optional?: boolean
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    name?: string
                    date?: string
                    type?: 'PUBLIC' | 'RESTRICTED' | 'COMPANY'
                    is_optional?: boolean
                    description?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            salary_structures: {
                Row: {
                    id: string
                    organization_id: string
                    name: string
                    description: string | null
                    components: Json
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    name: string
                    description?: string | null
                    components: Json
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    name?: string
                    description?: string | null
                    components?: Json
                    is_active?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            employee_salary_settings: {
                Row: {
                    id: string
                    organization_id: string
                    employee_id: string
                    salary_structure_id: string | null
                    base_salary: number
                    payment_method: string
                    bank_details: Json
                    effective_date: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    employee_id: string
                    salary_structure_id?: string | null
                    base_salary: number
                    payment_method?: string
                    bank_details?: Json
                    effective_date: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    employee_id?: string
                    salary_structure_id?: string | null
                    base_salary?: number
                    payment_method?: string
                    bank_details?: Json
                    effective_date?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            salaries: {
                Row: {
                    id: string
                    organization_id: string
                    employee_id: string
                    month: number
                    year: number
                    basic_salary: number
                    earnings: Json | null
                    deductions: Json | null
                    gross_salary: number
                    net_salary: number
                    status: 'DRAFT' | 'PROCESSED' | 'APPROVED' | 'PAID'
                    payment_date: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    employee_id: string
                    month: number
                    year: number
                    basic_salary: number
                    earnings?: Json | null
                    deductions?: Json | null
                    gross_salary: number
                    net_salary: number
                    status?: 'DRAFT' | 'PROCESSED' | 'APPROVED' | 'PAID'
                    payment_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    employee_id?: string
                    month?: number
                    year?: number
                    basic_salary?: number
                    earnings?: Json | null
                    deductions?: Json | null
                    gross_salary?: number
                    net_salary?: number
                    status?: 'DRAFT' | 'PROCESSED' | 'APPROVED' | 'PAID'
                    payment_date?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            documents: {
                Row: {
                    id: string
                    organization_id: string
                    employee_id: string
                    type: 'RESUME' | 'ID_PROOF' | 'ADDRESS_PROOF' | 'EDUCATION_CERTIFICATE' | 'EXPERIENCE_LETTER' | 'OFFER_LETTER' | 'EMPLOYMENT_CONTRACT' | 'OTHER'
                    name: string
                    file_url: string
                    file_size: number | null
                    mime_type: string | null
                    expiry_date: string | null
                    uploaded_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    employee_id: string
                    type: 'RESUME' | 'ID_PROOF' | 'ADDRESS_PROOF' | 'EDUCATION_CERTIFICATE' | 'EXPERIENCE_LETTER' | 'OFFER_LETTER' | 'EMPLOYMENT_CONTRACT' | 'OTHER'
                    name: string
                    file_url: string
                    file_size?: number | null
                    mime_type?: string | null
                    expiry_date?: string | null
                    uploaded_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    employee_id?: string
                    type?: 'RESUME' | 'ID_PROOF' | 'ADDRESS_PROOF' | 'EDUCATION_CERTIFICATE' | 'EXPERIENCE_LETTER' | 'OFFER_LETTER' | 'EMPLOYMENT_CONTRACT' | 'OTHER'
                    name?: string
                    file_url?: string
                    file_size?: number | null
                    mime_type?: string | null
                    expiry_date?: string | null
                    uploaded_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}

// Helper types
export type Employee = Database['public']['Tables']['employees']['Row']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export type Department = Database['public']['Tables']['departments']['Row']
export type Designation = Database['public']['Tables']['designations']['Row']
export type LeaveType = Database['public']['Tables']['leave_types']['Row']
export type LeaveBalance = Database['public']['Tables']['leave_balances']['Row']

// Emergency Contact type (from employees.emergency_contacts JSONB)
export interface EmergencyContact {
    name: string
    relationship: string
    phone: string
}

// Address type (from employees.current_address/permanent_address JSONB)
export interface Address {
    street?: string
    city?: string
    state?: string
    postal_code?: string
    country?: string
}

export type UserRole = Database['public']['Tables']['users']['Row']['role']
