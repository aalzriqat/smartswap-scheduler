
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, AlertTriangle, Users } from 'lucide-react';
import { SwapChain } from '@/types/api';
import { useSwapChains } from '@/hooks/useSwapChains';
import { useAuth } from '@/contexts/AuthContext';
import { ChainVisualization } from './ChainVisualization';

interface ChainApprovalModalProps {
  chain: SwapChain | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChainApprovalModal: React.FC<ChainApprovalModalProps> = ({
  chain,
  isOpen,
  onClose,
}) => {
  const [reason, setReason] = useState('');
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const { approveChain, rejectChain, isApproving, isRejecting } = useSwapChains();
  const { user, userProfile } = useAuth();

  if (!chain || !user || !userProfile) return null;

  const userParticipant = chain.participants.find(p => p.userId === userProfile.id);
  const canRespond = userParticipant?.approvalStatus === 'pending' && 
                    (chain.status === 'proposed' || chain.status === 'pending');

  const handleApprove = () => {
    if (!chain) return;
    approveChain({ chainId: chain.chainId, reason });
    onClose();
  };

  const handleReject = () => {
    if (!chain || !reason.trim()) return;
    rejectChain({ chainId: chain.chainId, reason });
    onClose();
  };

  const getImpactDescription = () => {
    if (!userParticipant) return '';
    
    const userStep = chain.swapSteps.find(step => step.fromUserId === userProfile.id);
    const receivingStep = chain.swapSteps.find(step => step.toUserId === userProfile.id);
    
    if (userStep && receivingStep) {
      return `You will give up your shift and receive a new shift as part of this ${chain.participants.length}-person swap chain.`;
    }
    return 'You are part of this multi-hop swap chain.';
  };

  const getBenefits = () => {
    const benefits = [];
    
    if (chain.chainScore >= 85) {
      benefits.push('High compatibility score - excellent match for all participants');
    }
    
    if (chain.participants.length === 3) {
      benefits.push('Simple 3-person circular swap - easy to coordinate');
    } else if (chain.participants.length > 3) {
      benefits.push(`Complex ${chain.participants.length}-person chain - solves multiple scheduling conflicts`);
    }
    
    const approvedCount = chain.participants.filter(p => p.approvalStatus === 'approved').length;
    if (approvedCount > 0) {
      benefits.push(`${approvedCount} participant${approvedCount > 1 ? 's' : ''} already approved`);
    }
    
    return benefits;
  };

  const getRisks = () => {
    const risks = [];
    
    if (chain.chainScore < 70) {
      risks.push('Lower compatibility score - may have some scheduling challenges');
    }
    
    const violationSteps = chain.swapSteps.filter(step => !step.businessRuleValidation.isValid);
    if (violationSteps.length > 0) {
      risks.push(`${violationSteps.length} step${violationSteps.length > 1 ? 's' : ''} have business rule violations`);
    }
    
    const expiresIn = new Date(chain.expiresAt).getTime() - new Date().getTime();
    const hoursUntilExpiry = Math.floor(expiresIn / (1000 * 60 * 60));
    
    if (hoursUntilExpiry < 24) {
      risks.push(`Chain expires in ${hoursUntilExpiry} hours - limited time to coordinate`);
    }
    
    if (chain.participants.length > 4) {
      risks.push('Large chain - requires coordination from many participants');
    }
    
    return risks;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Multi-hop Swap Chain Approval</span>
          </DialogTitle>
          <DialogDescription>
            Review the details of this swap chain and decide whether to participate.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chain Visualization */}
          <ChainVisualization chain={chain} showDetails={false} />

          {/* User's Role */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Your Role in This Chain</h3>
            <p className="text-blue-800 text-sm">
              {getImpactDescription()}
            </p>
            {userParticipant && (
              <div className="mt-2">
                <Badge 
                  variant={userParticipant.approvalStatus === 'approved' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  Status: {userParticipant.approvalStatus}
                </Badge>
              </div>
            )}
          </div>

          {/* Benefits */}
          {getBenefits().length > 0 && (
            <div>
              <h3 className="font-medium text-green-900 mb-2 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                Benefits
              </h3>
              <ul className="space-y-1">
                {getBenefits().map((benefit, index) => (
                  <li key={index} className="text-sm text-green-800 flex items-start">
                    <span className="w-1 h-1 bg-green-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risks */}
          {getRisks().length > 0 && (
            <div>
              <h3 className="font-medium text-amber-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Considerations
              </h3>
              <ul className="space-y-1">
                {getRisks().map((risk, index) => (
                  <li key={index} className="text-sm text-amber-800 flex items-start">
                    <span className="w-1 h-1 bg-amber-600 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {risk}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Business Rule Violations */}
          {chain.swapSteps.some(step => !step.businessRuleValidation.isValid) && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This chain has business rule violations that may prevent execution. 
                Please review carefully before approving.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Selection */}
          {canRespond && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Your Decision</Label>
                <div className="flex space-x-4 mt-2">
                  <Button
                    variant={action === 'approve' ? 'default' : 'outline'}
                    onClick={() => setAction('approve')}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </Button>
                  <Button
                    variant={action === 'reject' ? 'destructive' : 'outline'}
                    onClick={() => setAction('reject')}
                    className="flex items-center space-x-2"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </Button>
                </div>
              </div>

              {action && (
                <div>
                  <Label htmlFor="reason">
                    {action === 'approve' ? 'Reason (optional)' : 'Reason for rejection (required)'}
                  </Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={
                      action === 'approve' 
                        ? 'Optional: Add a note about your approval...'
                        : 'Please explain why you are rejecting this chain...'
                    }
                    className="mt-1"
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {/* Already Responded */}
          {!canRespond && userParticipant && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                You have already {userParticipant.approvalStatus} this chain.
                {userParticipant.approvalStatus === 'approved' && userParticipant.approvedAt && (
                  <span className="block mt-1 text-sm">
                    Approved on {new Date(userParticipant.approvedAt).toLocaleDateString()}
                  </span>
                )}
                {userParticipant.approvalStatus === 'rejected' && userParticipant.rejectedAt && (
                  <span className="block mt-1 text-sm">
                    Rejected on {new Date(userParticipant.rejectedAt).toLocaleDateString()}
                    {userParticipant.rejectionReason && (
                      <span className="block">Reason: {userParticipant.rejectionReason}</span>
                    )}
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canRespond && action && (
            <Button
              onClick={action === 'approve' ? handleApprove : handleReject}
              disabled={
                (action === 'reject' && !reason.trim()) || 
                isApproving || 
                isRejecting
              }
              variant={action === 'approve' ? 'default' : 'destructive'}
            >
              {isApproving || isRejecting ? 'Processing...' : 
               action === 'approve' ? 'Approve Chain' : 'Reject Chain'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
