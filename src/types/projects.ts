export enum ProjectStatus {
    Planning = 0,
    Active = 1,
    OnHold = 2,
    Completed = 3,
    Cancelled = 4
}

export enum ProjectPriority {
    Low = 1,
    Medium = 2,
    High = 3,
    Critical = 4
}

export enum ProjectRole {
    TeamMember = 0,
    ProjectLead = 1,
    TechnicalLead = 2,
    ProjectManager = 3
}

// Helper functions for string conversion
export const getProjectStatusString = (status: ProjectStatus): string => {
    switch (status) {
        case ProjectStatus.Planning: return 'Planning'
        case ProjectStatus.Active: return 'Active'
        case ProjectStatus.OnHold: return 'On Hold'
        case ProjectStatus.Completed: return 'Completed'
        case ProjectStatus.Cancelled: return 'Cancelled'
        default: return 'Unknown'
    }
}

export const getProjectPriorityString = (priority: ProjectPriority): string => {
    switch (priority) {
        case ProjectPriority.Low: return 'Low'
        case ProjectPriority.Medium: return 'Medium'
        case ProjectPriority.High: return 'High'
        case ProjectPriority.Critical: return 'Critical'
        default: return 'Unknown'
    }
}

export const getProjectRoleString = (role: ProjectRole): string => {
    switch (role) {
        case ProjectRole.TeamMember: return 'Team Member'
        case ProjectRole.ProjectLead: return 'Project Lead'
        case ProjectRole.TechnicalLead: return 'Technical Lead'
        case ProjectRole.ProjectManager: return 'Project Manager'
        default: return 'Unknown'
    }
}

// Helper functions for parsing from string
export const getProjectStatusFromString = (statusString: string): ProjectStatus => {
    switch (statusString.toLowerCase()) {
        case 'planning': return ProjectStatus.Planning
        case 'active': return ProjectStatus.Active
        case 'onhold': case 'on hold': return ProjectStatus.OnHold
        case 'completed': return ProjectStatus.Completed
        case 'cancelled': return ProjectStatus.Cancelled
        default: return ProjectStatus.Planning
    }
}

export const getProjectPriorityFromString = (priorityString: string): ProjectPriority => {
    switch (priorityString.toLowerCase()) {
        case 'low': return ProjectPriority.Low
        case 'medium': return ProjectPriority.Medium
        case 'high': return ProjectPriority.High
        case 'critical': return ProjectPriority.Critical
        default: return ProjectPriority.Medium
    }
}

export const getProjectRoleFromString = (roleString: string): ProjectRole => {
    switch (roleString.toLowerCase()) {
        case 'teammember': case 'team member': return ProjectRole.TeamMember
        case 'projectlead': case 'project lead': return ProjectRole.ProjectLead
        case 'technicallead': case 'technical lead': return ProjectRole.TechnicalLead
        case 'projectmanager': case 'project manager': return ProjectRole.ProjectManager
        default: return ProjectRole.TeamMember
    }
}