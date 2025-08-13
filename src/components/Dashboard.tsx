import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProposalCard } from './ProposalCard';
import { ProposalDetailsModal } from './ProposalDetailsModal';
import { useEventProposals, EventProposal } from '@/hooks/useEventProposals';
import { 
  Search, 
  Filter, 
  Plus, 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart3,
  Calendar,
  Users,
  DollarSign
} from 'lucide-react';

const DEPARTMENTS = [
  'All Departments',
  'Computer Science',
  'Graduate Studies',
  'Environmental Science',
  'Engineering',
  'Business Administration',
  'Liberal Arts',
  'Sciences'
];

const EVENT_TYPES = [
  'All Types',
  'Conference',
  'Workshop',
  'Seminar',
  'Academic',
  'Social',
  'Cultural',
  'Sports'
];

export const Dashboard = () => {
  const { proposals, isLoading, updateProposalStatus } = useEventProposals();
  const [selectedProposal, setSelectedProposal] = useState<EventProposal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [eventTypeFilter, setEventTypeFilter] = useState('All Types');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProposals = useMemo(() => {
    return proposals.filter(proposal => {
      const matchesSearch = proposal.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proposal.primaryOrganizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          proposal.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || proposal.status === statusFilter;
      const matchesDepartment = departmentFilter === 'All Departments' || proposal.department === departmentFilter;
      const matchesEventType = eventTypeFilter === 'All Types' || proposal.eventType === eventTypeFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment && matchesEventType;
    });
  }, [proposals, searchTerm, statusFilter, departmentFilter, eventTypeFilter]);

  const handleViewDetails = (proposal: EventProposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProposal(null);
  };

  const stats = useMemo(() => {
    const total = proposals.length;
    const pending = proposals.filter(p => p.status === 'pending').length;
    const approved = proposals.filter(p => p.status === 'approved').length;
    const rejected = proposals.filter(p => p.status === 'rejected').length;
    const totalBudget = proposals
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.estimatedBudget, 0);

    return { total, pending, approved, rejected, totalBudget };
  }, [proposals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading event proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-dashboard-bg min-h-screen">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Student Council IIIT-Delhi</h1>
        <p className="text-muted-foreground">
          Event Approval Portal - Manage and review event proposals efficiently
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time submissions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-dashboard-status-new" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dashboard-status-new">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-dashboard-status-approved" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dashboard-status-approved">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Ready to proceed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-dashboard-status-rejected" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-dashboard-status-rejected">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Need revision</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalBudget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total allocated</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-gradient-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search Proposals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event name, organizer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Event Type</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDepartmentFilter('All Departments');
                  setEventTypeFilter('All Types');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">
            Proposals ({filteredProposals.length})
          </h2>
          {(searchTerm || statusFilter !== 'all' || departmentFilter !== 'All Departments' || eventTypeFilter !== 'All Types') && (
            <Badge variant="secondary" className="gap-1">
              <Filter className="h-3 w-3" />
              Filtered
            </Badge>
          )}
        </div>
      </div>

      {/* Proposals Grid */}
      {filteredProposals.length === 0 ? (
        <Card className="bg-gradient-card border-0">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== 'all' || departmentFilter !== 'All Departments' || eventTypeFilter !== 'All Types'
                ? 'Try adjusting your filters to see more results.'
                : 'No event proposals have been submitted yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Proposal Details Modal */}
      <ProposalDetailsModal
        proposal={selectedProposal}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusUpdate={updateProposalStatus}
      />
    </div>
  );
};