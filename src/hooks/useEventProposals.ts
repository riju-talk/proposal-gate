import { useState, useEffect } from 'react';

export interface EventProposal {
  id: string;
  eventName: string;
  eventType: string;
  eventDescription: string;
  eventDate: string;
  startTime: string;
  duration: string;
  preferredVenue: string;
  expectedAttendees: number;
  estimatedBudget: number;
  primaryOrganizer: string;
  emailAddress: string;
  phoneNumber: string;
  department: string;
  specialRequirements: string;
  marketingPlan: string;
  supportingDocuments?: File;
  status: 'new' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewComments?: string;
}

// Mock data - replace with Supabase later
const mockProposals: EventProposal[] = [
  {
    id: '1',
    eventName: 'Annual Tech Symposium 2024',
    eventType: 'Conference',
    eventDescription: 'A comprehensive technology symposium featuring industry leaders, academic researchers, and students. The event will showcase cutting-edge research in AI, blockchain, and sustainable technology.',
    eventDate: '2024-09-15',
    startTime: '09:00',
    duration: '8 hours',
    preferredVenue: 'Main Auditorium',
    expectedAttendees: 250,
    estimatedBudget: 50000,
    primaryOrganizer: 'Dr. Sarah Johnson',
    emailAddress: 'sarah.johnson@university.edu',
    phoneNumber: '+1 555-0123',
    department: 'Computer Science',
    specialRequirements: 'High-speed internet, live streaming setup, accessibility ramps',
    marketingPlan: 'Social media campaign, university newsletter, department websites, industry partnerships',
    status: 'new',
    submittedAt: new Date('2024-08-01T10:30:00'),
  },
  {
    id: '2',
    eventName: 'Student Research Showcase',
    eventType: 'Academic',
    eventDescription: 'An exhibition of outstanding undergraduate and graduate student research projects across all disciplines.',
    eventDate: '2024-09-22',
    startTime: '14:00',
    duration: '4 hours',
    preferredVenue: 'Student Center',
    expectedAttendees: 150,
    estimatedBudget: 15000,
    primaryOrganizer: 'Prof. Michael Chen',
    emailAddress: 'michael.chen@university.edu',
    phoneNumber: '+1 555-0456',
    department: 'Graduate Studies',
    specialRequirements: 'Display boards, poster stands, lighting equipment',
    marketingPlan: 'Department announcements, student portals, faculty recommendations',
    status: 'approved',
    submittedAt: new Date('2024-07-28T15:45:00'),
    reviewedAt: new Date('2024-08-02T11:20:00'),
    reviewedBy: 'admin',
    reviewComments: 'Excellent proposal with clear objectives and budget breakdown. Approved for fall semester.',
  },
  {
    id: '3',
    eventName: 'Environmental Awareness Workshop',
    eventType: 'Workshop',
    eventDescription: 'Interactive workshop focusing on sustainable practices and environmental conservation for campus community.',
    eventDate: '2024-08-30',
    startTime: '10:00',
    duration: '3 hours',
    preferredVenue: 'Green Campus Center',
    expectedAttendees: 80,
    estimatedBudget: 8000,
    primaryOrganizer: 'Lisa Rodriguez',
    emailAddress: 'lisa.rodriguez@university.edu',
    phoneNumber: '+1 555-0789',
    department: 'Environmental Science',
    specialRequirements: 'Recycling materials, outdoor space access, microphone system',
    marketingPlan: 'Eco-club networks, campus sustainability office, student organizations',
    status: 'rejected',
    submittedAt: new Date('2024-07-25T09:15:00'),
    reviewedAt: new Date('2024-08-01T16:30:00'),
    reviewedBy: 'admin',
    reviewComments: 'Budget exceeds departmental allocation for this semester. Please resubmit with revised budget.',
  }
];

export const useEventProposals = () => {
  const [proposals, setProposals] = useState<EventProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const storedProposals = localStorage.getItem('event_proposals');
      if (storedProposals) {
        const parsed = JSON.parse(storedProposals);
        // Convert date strings back to Date objects
        const proposalsWithDates = parsed.map((p: any) => ({
          ...p,
          submittedAt: new Date(p.submittedAt),
          reviewedAt: p.reviewedAt ? new Date(p.reviewedAt) : undefined,
        }));
        setProposals(proposalsWithDates);
      } else {
        setProposals(mockProposals);
        localStorage.setItem('event_proposals', JSON.stringify(mockProposals));
      }
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateProposalStatus = (id: string, status: 'approved' | 'rejected', comments: string) => {
    setProposals(prev => {
      const updated = prev.map(proposal => 
        proposal.id === id 
          ? { 
              ...proposal, 
              status, 
              reviewedAt: new Date(),
              reviewedBy: 'admin',
              reviewComments: comments 
            }
          : proposal
      );
      localStorage.setItem('event_proposals', JSON.stringify(updated));
      return updated;
    });

    // Simulate sending email notification
    const proposal = proposals.find(p => p.id === id);
    if (proposal) {
      console.log(`Email notification sent to ${proposal.emailAddress}: Event "${proposal.eventName}" has been ${status}.`);
    }
  };

  return {
    proposals,
    isLoading,
    updateProposalStatus
  };
};