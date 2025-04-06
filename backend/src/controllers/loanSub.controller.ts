import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Create a new loan application
export const createLoanSub = async (req: Request, res: Response) => {
  try {
    const { 
      amount, 
      term, 
      purpose, 
      employmentStatus, 
      employerName,
      employerAddress, 
      userId 
    } = req.body;
    
    // Validate required fields
    if (!amount || !term || !purpose || !employmentStatus || !employerAddress || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required loan information' 
      });
    }

    // Create the loan using the LoanSub model
    const loan = await prisma.loanSub.create({
      data: {
        id: uuidv4(),
        amount: parseFloat(amount.toString()),
        term: parseInt(term.toString()),
        purpose,
        employmentStatus,
        employerName: employerName || '',
        employerAddress,
        status: 'PENDING',
        userId
      }
    });

    console.log('Loan application submitted successfully:', loan);

    return res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: loan
    });
  } catch (error) {
    console.error('Error creating loan application:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your loan application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get loans for a specific user
export const getUserLoanSubs = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const loans = await prisma.loanSub.findMany({
      where: {
        userId
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePicture: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      success: true,
      data: loans
    });
  } catch (error) {
    console.error('Error getting user loan applications:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching loan applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all loans (for admin/verifier)
export const getAllLoanSubs = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    // Only admin and verifier can see all loans
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'VERIFIER') {
      return res.status(403).json({ message: 'Unauthorized to access all loan applications' });
    }

    const status = req.query.status as string | undefined;
    
    const loans = await prisma.loanSub.findMany({
      where: status ? { status } : {},
      include: {
        User: {
          select: {
            id: true,
            username: true,
            email: true,
            profilePicture: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: loans
    });
  } catch (error) {
    console.error('Error getting all loan applications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to retrieve loan applications' 
    });
  }
};

// Update loan status (for verifier)
export const verifyLoanSub = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { status, comment } = req.body;
    
    // @ts-ignore - user is added by auth middleware
    const verifierId = req.user?.id;
    // @ts-ignore - user is added by auth middleware
    const userRole = req.user?.role;
    
    if (userRole !== 'VERIFIER' && userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: 'Only verifiers can verify loans' 
      });
    }
    
    // Check if loan exists
    const loan = await prisma.loanSub.findUnique({
      where: { id: loanId }
    });
    
    if (!loan) {
      return res.status(404).json({ 
        success: false,
        message: 'Loan application not found' 
      });
    }
    
    // Validate status transition
    if (loan.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false,
        message: 'Only pending loans can be verified' 
      });
    }
    
    // Update the loan
    const updatedLoan = await prisma.loanSub.update({
      where: { id: loanId },
      data: {
        status: status === 'VERIFIED' ? 'VERIFIED' : 'REJECTED',
        verifierId,
        verifierComment: comment,
        verifiedAt: new Date()
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: updatedLoan
    });
  } catch (error) {
    console.error('Error updating loan status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update loan status' 
    });
  }
};

// Update loan status (for admin)
export const adminProcessLoanSub = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { status, comment } = req.body;
    
    // @ts-ignore - user is added by auth middleware
    const adminId = req.user?.id;
    // @ts-ignore - user is added by auth middleware
    const userRole = req.user?.role;
    
    if (userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: 'Only admins can approve or reject loans' 
      });
    }
    
    // Check if loan exists
    const loan = await prisma.loanSub.findUnique({
      where: { id: loanId }
    });
    
    if (!loan) {
      return res.status(404).json({ 
        success: false,
        message: 'Loan application not found' 
      });
    }
    
    // Validate status transition for approval
    if (status === 'APPROVED' && loan.status !== 'VERIFIED') {
      return res.status(400).json({ 
        success: false,
        message: 'Only verified loans can be approved' 
      });
    }
    
    // Update the loan
    const updatedLoan = await prisma.loanSub.update({
      where: { id: loanId },
      data: {
        status: status,
        adminId,
        adminComment: comment,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        rejectedAt: status === 'REJECTED' ? new Date() : null
      },
      include: {
        User: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: updatedLoan
    });
  } catch (error) {
    console.error('Error processing loan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process loan' 
    });
  }
};

// Cancel a loan application (only the owner or an admin can cancel)
export const cancelLoanSub = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    
    // Check if loan exists
    const loan = await prisma.loanSub.findUnique({
      where: { id: loanId }
    });
    
    if (!loan) {
      return res.status(404).json({ 
        success: false,
        message: 'Loan application not found' 
      });
    }
    
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;
    // @ts-ignore - user is added by auth middleware
    const userRole = req.user?.role;
    
    // Only the loan owner or an admin can cancel the loan
    if (loan.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ 
        success: false,
        message: 'You can only cancel your own loans' 
      });
    }
    
    // Only pending loans can be cancelled
    if (loan.status !== 'PENDING') {
      return res.status(400).json({ 
        success: false,
        message: 'Only pending loans can be cancelled' 
      });
    }
    
    // Cancel the loan
    const updatedLoan = await prisma.loanSub.update({
      where: { id: loanId },
      data: { status: 'CANCELLED' }
    });
    
    res.json({
      success: true,
      data: updatedLoan,
      message: 'Loan application cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling loan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to cancel loan application' 
    });
  }
}; 