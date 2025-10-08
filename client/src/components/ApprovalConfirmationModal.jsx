import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export const ApprovalConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  action,
  proposal,
  loading = false
}) => {
  if (!proposal) return null;

  // Determine proposal type more robustly
  const proposalType = proposal.type ||
    (proposal.event_name ? 'event' : null) ||
    (proposal.club_name ? 'club' : 'event');

  console.log('ApprovalConfirmationModal - proposal:', proposal);
  console.log('ApprovalConfirmationModal - determined type:', proposalType);

  const actionConfig = {
    approve: {
      title: "Approve Proposal",
      description: `Are you sure you want to approve "${proposal.event_name || proposal.club_name}"? This action is irreversible.`,
      icon: CheckCircle,
      iconColor: "text-green-500",
      buttonText: "Approve",
      buttonVariant: "default",
      buttonClass: "bg-green-500 hover:bg-green-600"
    },
    reject: {
      title: "Reject Proposal",
      description: `Are you sure you want to reject "${proposal.event_name || proposal.club_name}"? This action is irreversible.`,
      icon: XCircle,
      iconColor: "text-red-500",
      buttonText: "Reject",
      buttonVariant: "destructive",
      buttonClass: ""
    }
  };

  const config = actionConfig[action];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full bg-current bg-opacity-10`}>
              <config.icon className={`h-6 w-6 ${config.iconColor}`} />
            </div>
            <div>
              <DialogTitle className="text-lg">{config.title}</DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full bg-primary/10`}>
                {proposalType === 'event' ? (
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-purple-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {proposalType === 'club' ? (
                    <span className="text-purple-600 text-lg font-bold">{proposal.club_name}</span>
                  ) : (
                    proposal.event_name
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  {proposalType === 'event' ? 'Event Proposal' : 'Club Proposal'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            disabled={loading}
            className={config.buttonClass}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              config.buttonText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApprovalConfirmationModal;
