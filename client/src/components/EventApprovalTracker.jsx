import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useEventApprovals } from "@/hooks/useEventApprovals";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Shield,
  User,
  Loader2,
} from "lucide-react";

export const EventApprovalTracker = ({ eventId, showActions = true }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState({});
  const [approving, setApproving] = useState(null);

  const {
    approvals,
    isLoading,
    error,
    approveEvent,
    rejectEvent,
    refetch,
  } = useEventApprovals(eventId);

  const handleApprove = async (adminEmail, status, comment = "") => {
    try {
      setApproving(adminEmail);

      let result;
      if (status === "approved") {
        result = await approveEvent(adminEmail, comment);
      } else {
        result = await rejectEvent(adminEmail, comment);
      }

      if (result.error) throw new Error(result.error);

      setComments((prev) => ({ ...prev, [adminEmail]: "" }));
      toast({
        title: "Success",
        description: `Approval ${status === "approved" ? "granted" : "rejected"} successfully.`,
      });

      await refetch(); // refresh list
    } catch (err) {
      console.error("Error updating approval:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to update approval status",
        variant: "destructive",
      });
    } finally {
      setApproving(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return (
          <Badge className="bg-success/20 text-success border-success/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-destructive/20 text-destructive border-destructive/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const canUserApprove = (adminEmail, status) =>
    user?.email === adminEmail && showActions && status === "pending";

  if (isLoading) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            Loading Approvals...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="text-foreground">Error Loading Approvals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Approval Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {approvals.length === 0 ? (
          <p className="text-muted-foreground">No approvals found for this event.</p>
        ) : (
          approvals.map((approval) => (
            <div key={approval.id} className="border border-border rounded-lg p-4 bg-card/50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <h4 className="font-medium text-foreground">
                      {approval.admin_name || "Admin"}
                    </h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {approval.admin_role?.replace("_", " ") || "Reviewer"} (Order:{" "}
                      {approval.approval_order})
                    </p>
                  </div>
                </div>
                {getStatusBadge(approval.status)}
              </div>

              {approval.comments && (
                <div className="mb-3 text-sm text-muted-foreground flex items-start">
                  <MessageSquare className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-400" />
                  <p className="bg-muted/50 rounded p-3 border border-border flex-1">
                    {approval.comments}
                  </p>
                </div>
              )}

              {canUserApprove(approval.admin_email, approval.status) && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <Textarea
                    placeholder="Add a comment (optional)"
                    value={comments[approval.admin_email] || ""}
                    onChange={(e) =>
                      setComments((prev) => ({
                        ...prev,
                        [approval.admin_email]: e.target.value,
                      }))
                    }
                    className="text-sm bg-background border-border"
                  />
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleApprove(approval.admin_email, "rejected", comments[approval.admin_email])
                      }
                      disabled={approving === approval.admin_email}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10"
                    >
                      {approving === approval.admin_email ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Reject"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        handleApprove(approval.admin_email, "approved", comments[approval.admin_email])
                      }
                      disabled={approving === approval.admin_email}
                      className="bg-success/20 border-success/30 text-success hover:bg-success/30"
                    >
                      {approving === approval.admin_email ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Approve"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {approval.approved_at && (
                <div className="text-xs text-muted-foreground mt-2">
                  {approval.status === "approved" ? "Approved" : "Updated"} on{" "}
                  {new Date(approval.approved_at).toLocaleDateString()}
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default EventApprovalTracker;
