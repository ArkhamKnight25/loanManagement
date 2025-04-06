import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Create a new loan application
export const createLoan = async (req: Request, res: Response) => {
  try {
    const { 
      amount, 
      termMonths, 
      purpose, 
      employmentStatus, 
      employerAddress,
      creditCheckConsent, 
      userId 
    } = req.body;
    
    // Validate required fields
    if (!amount || !termMonths || !purpose || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required loan information' 
      });
    }

    // Create the loan using the existing Loan model
    const loan = await prisma.loan.create({
      data: {
        amount: parseFloat(amount.toString()),
        termMonths: parseInt(termMonths.toString()),
        purpose,
        employmentStatus,
        employerAddress,
        creditCheckConsent: Boolean(creditCheckConsent),
        status: 'PENDING',
        userId
      }
    });

    console.log('Loan created successfully:', loan);

    return res.status(201).json({
      success: true,
      message: 'Loan application submitted successfully',
      data: loan
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your loan application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get loans for a specific user
export const getUserLoans = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const loans = await prisma.loan.findMany({
      where: {
        userId
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
    console.error('Error getting user loans:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching loans',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all loans (for admin/verifier)
export const getAllLoans = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    // Only admin and verifier can see all loans
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'VERIFIER') {
      return res.status(403).json({ message: 'Unauthorized to access all loans' });
    }

    const status = req.query.status as string | undefined;
    
    const loans = await prisma.loan.findMany({
      where: status ? { status } : {},
      include: {
        user: {
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

    res.json(loans);
  } catch (error) {
    console.error('Error getting all loans:', error);
    res.status(500).json({ message: 'Failed to retrieve loan applications' });
  }
};

// Update loan status (for admin/verifier)
export const updateLoanStatus = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const { status, verifierId, verifierComment, adminId, adminComment } = req.body;
    
    // First, validate the requested status change based on role
    // @ts-ignore - user is added by auth middleware
    const userRole = req.user?.role;
    
    if (status === 'VERIFIED' && userRole !== 'VERIFIER' && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Only verifiers can verify loans' });
    }
    
    if ((status === 'APPROVED' || status === 'REJECTED') && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can approve or reject verified loans' });
    }
    
    // Check if loan exists
    const loan = await prisma.loan.findUnique({
      where: { id: loanId }
    });
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found' });
    }
    
    // Validate status transition
    if (status === 'VERIFIED' && loan.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending loans can be verified' });
    }
    
    if ((status === 'APPROVED' || status === 'REJECTED') && loan.status !== 'VERIFIED') {
      return res.status(400).json({ message: 'Only verified loans can be approved or rejected' });
    }
    
    // Update the loan
    const updateData: any = { status };
    
    if (status === 'VERIFIED' && verifierId) {
      updateData.verifierId = verifierId;
      updateData.verifierComment = verifierComment || null;
    }
    
    if ((status === 'APPROVED' || status === 'REJECTED') && adminId) {
      updateData.adminId = adminId;
      updateData.adminComment = adminComment || null;
    }
    
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json(updatedLoan);
  } catch (error) {
    console.error('Error updating loan status:', error);
    res.status(500).json({ message: 'Failed to update loan status' });
  }
};

// Cancel a loan application (only the owner or an admin can cancel)
export const cancelLoan = async (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    
    // Check if loan exists
    const loan = await prisma.loan.findUnique({
      where: { id: loanId }
    });
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found' });
    }
    
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;
    // @ts-ignore - user is added by auth middleware
    const userRole = req.user?.role;
    
    // Only the loan owner or an admin can cancel the loan
    if (loan.userId !== userId && userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'You can only cancel your own loans' });
    }
    
    // Only pending loans can be cancelled
    if (loan.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending loans can be cancelled' });
    }
    
    // Update the loan status to 'CANCELLED'
    const updatedLoan = await prisma.loan.update({
      where: { id: loanId },
      data: { status: 'CANCELLED' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    
    res.json(updatedLoan);
  } catch (error) {
    console.error('Error cancelling loan:', error);
    res.status(500).json({ message: 'Failed to cancel loan application' });
  }
};

export const getPendingLoans = async (req: Request, res: Response) => {
  try {
    const loans = await prisma.loan.findMany({
      where: {
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
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
    console.error('Error getting pending loans:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching pending loans',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 