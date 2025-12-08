// Core domain types for InnoCivic platform

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: 'user' | 'contributor' | 'admin';
  affiliation?: string;
  userType: 'student' | 'researcher' | 'journalist' | 'developer' | 'other';
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface Dataset {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  format: 'CSV' | 'JSON' | 'XML' | 'XLSX' | 'PDF';
  fileSize: number;
  fileUrl: string;
  source: string;
  license: string;
  geographicCoverage: string;
  timePeriod: { start: string; end: string };
  uploadedBy: User;
  uploadedAt: string;
  lastUpdated: string;
  downloadCount: number;
  viewCount: number;
  qualityScore: number;
  status: 'pending' | 'approved' | 'rejected';
  metadata: Record<string, any>;
  version: string;
  isPublic: boolean;
  previewData?: any[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  parentId?: string;
  children?: Category[];
  datasetCount?: number;
}

export interface Visualization {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'map' | 'table';
  datasetIds: string[];
  config: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
    filters?: Record<string, any>;
    colors?: string[];
    mapCenter?: { lat: number; lng: number };
    mapZoom?: number;
  };
  createdBy: User;
  createdAt: string;
  isPublic: boolean;
  description?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  replies?: Comment[];
  likes: number;
  isLiked: boolean;
}

export interface Notification {
  id: string;
  type: 'dataset_approved' | 'dataset_rejected' | 'new_comment' | 'new_follower' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface SearchFilters {
  query?: string;
  categories?: string[];
  formats?: string[];
  dateRange?: { start: string; end: string };
  tags?: string[];
  qualityScore?: { min: number; max: number };
  uploadedBy?: string;
  isPublic?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

// Component prop types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export interface SelectProps extends BaseComponentProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  wrapperClassName?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: number;
}

export interface PaginationProps {
  current: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
}

// Chart types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description?: string;
  data?: any;
}

// Form types
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormData {
  [key: string]: any;
}

// Upload types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

// Search types
export interface SearchResult<T = any> {
  item: T;
  score: number;
  highlights?: string[];
}

export interface SearchSuggestion {
  text: string;
  type: 'dataset' | 'category' | 'tag' | 'user';
  count?: number;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  timestamp: string;
  userId?: string;
}

export interface UserStats {
  datasetsUploaded: number;
  datasetsDownloaded: number;
  visualizationsCreated: number;
  commentsPosted: number;
  totalViews: number;
  reputation: number;
}

// API types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

// AI types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface AIChatRequest {
  messages: ChatMessage[];
  dataset_context?: Record<string, any>;
  system_prompt?: string;
}

export interface AIChatResponse {
  success: boolean;
  response: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface DatasetInsightsRequest {
  dataset: Record<string, any>;
  preview_data?: any[];
}

export interface DatasetInsightsResponse {
  success: boolean;
  insights: string;
  model: string;
}

export interface GenerateDescriptionRequest {
  dataset: Record<string, any>;
  preview_data?: any[];
}

export interface GenerateDescriptionResponse {
  success: boolean;
  description: string;
  model: string;
}


// Theme types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
  breakpoints: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}
