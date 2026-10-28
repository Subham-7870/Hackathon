export type Department = "Track" | "Signal" | "Traction";
export type Priority = "Critical" | "High" | "Medium" | "Low";
export type TrainType = "Superfast" | "Express" | "Freight";

export interface MaintenanceRequest {
  request_id: string;
  department: Department;
  location_sector: string;
  track_line: string;
  start_km: number;
  end_km: number;
  duration_minutes: number;
  priority: Priority;
  work_description: string;
  machine_required?: string;
  status: string;
}

export interface TimetableWindow {
  timetable_id: string;
  location_sector: string;
  track_line: string;
  start_time: string;
  end_time: string;
  available_duration_minutes: number;
  traffic_status: string;
}

export interface TrainSchedule {
  train_number: string;
  train_name: string;
  train_type: TrainType;
  priority_weight: number;
  origin: string;
  destination: string;
  route_sectors: string[];
  entry_time_minutes: number;
  normal_transit_minutes: number;
  delay_minutes: number;
  assigned_line: string;
  status: string;
  initial_km?: number;
  current_km?: number;
  loco_type?: string;
  speed_kmh?: number;
  speed?: number;
}

export interface AssignedRequestDetail {
  request_id: string;
  department: Department;
  work_description: string;
  duration_minutes: number;
  machine_required?: string;
}

export interface SolvedBlock {
  block_id: string;
  location_sector: string;
  track_line: string;
  start_time_offset_minutes: number;
  end_time_offset_minutes: number;
  start_time_iso: string;
  end_time_iso: string;
  total_block_duration_minutes: number;
  effective_work_duration_minutes: number;
  available_window_duration_minutes: number;
  capacity_utilized_percent: number;
  departments_involved: Department[];
  assigned_requests: AssignedRequestDetail[];
  is_shadow_block: boolean;
  ohe_power_isolated: boolean;
  elementary_section?: string;
  post_block_speed_restriction_kmh: number;
  controller_approved: boolean;
}

export interface DisruptionEvent {
  event_type: string;
  location_sector: string;
  affected_train_number?: string;
  delay_added_minutes: number;
  description: string;
}

export interface OptimizationMetrics {
  total_requests_processed: number;
  requests_allocated: number;
  shadow_blocks_created: number;
  corridor_closure_hours_saved: number;
  superfast_train_delay_minutes: number;
  express_train_delay_minutes: number;
  freight_trains_looped: number;
  track_capacity_gain_percent: number;
  solver_execution_time_seconds: number;
  solver_status: string;
}

export interface OptimizationResponse {
  metrics: OptimizationMetrics;
  solved_blocks: SolvedBlock[];
  updated_trains: TrainSchedule[];
  unassigned_requests: MaintenanceRequest[];
  operational_justification: string;
}

export interface CautionOrderForm {
  form_id: string;
  form_type: string;
  division: string;
  section_controller_name: string;
  station_from: string;
  station_to: string;
  block_section: string;
  km_start: number;
  km_end: number;
  speed_restriction_kmh: number;
  reason: string;
  effective_from: string;
  effective_to: string;
  authorized_timestamp: string;
}

export interface GeoStation {
  code: string;
  name: string;
  lat: number;
  lng: number;
  division: string;
}

export interface GeoSector {
  id: string;
  name: string;
  from: string;
  to: string;
  distance_km: number;
  lines: number;
  loops: number;
}

export type PlanningHorizon = 'daily' | 'weekly' | 'monthly';

export interface DefectItem {
  id: string;
  source_system: 'TMS' | 'SMMS' | 'TDMS';
  department: Department;
  location: string;
  track_line: string;
  start_km: number;
  end_km: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  defect_type: string;
  description: string;
  days_overdue: number;
  speed_restriction_if_unattended_kmh: number;
  recommended_shadow_window_minutes: number;
  allocated_block_id?: string;
}

export interface RecommendedRoute {
  id: string;
  title: string;
  priority_impact: 'High' | 'Medium' | 'Safety Critical';
  train_number: string;
  train_name: string;
  current_route: string;
  recommended_route: string;
  rationale: string;
  capacity_unlocked_minutes: number;
  passenger_delay_prevented_minutes: number;
  switch_points_to_set: string[];
  applied: boolean;
}

