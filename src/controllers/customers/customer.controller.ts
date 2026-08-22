import { Request, Response } from "express";

import customerService from "../../services/customer/customer.service";
import { AuthenticatedRequest } from "../../middleware/auth.middleware";

class CustomerController {
  // =====================================================
  // CREATE CUSTOMER
  // =====================================================

  async createCustomer(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { name, phone, email, address } = req.body;

      const customer = await customerService.createCustomer(
        userId,
        name,
        phone,
        email,
        address,
      );

      return res.status(201).json({
        success: true,
        message: "Customer created successfully",
        data: customer,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to create customer",
      });
    }
  }

  // =====================================================
  // GET ALL CUSTOMERS
  // =====================================================

  async getCustomers(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const customers = await customerService.getCustomers(userId);

      return res.status(200).json({
        success: true,
        data: customers,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to fetch customers",
      });
    }
  }

  // =====================================================
  // GET CUSTOMER BY PHONE
  // =====================================================

  async getCustomerByPhone(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      const phone = String(req.params.phone);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const customer = await customerService.getCustomerByPhone(userId, phone);

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to fetch customer",
      });
    }
  }

  // =====================================================
  // GET CUSTOMER BY ID
  // =====================================================

  async getCustomerById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      const customerId = String(req.params.customerId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const customer = await customerService.getCustomerById(
        userId,
        customerId,
      );

      return res.status(200).json({
        success: true,
        data: customer,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to fetch customer",
      });
    }
  }

  // =====================================================
  // UPDATE CUSTOMER
  // =====================================================

  async updateCustomer(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      const customerId = String(req.params.customerId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const customer = await customerService.updateCustomer(
        userId,
        customerId,
        req.body,
      );

      return res.status(200).json({
        success: true,
        message: "Customer updated successfully",
        data: customer,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to update customer",
      });
    }
  }

  // =====================================================
  // DEACTIVATE CUSTOMER
  // =====================================================

  async deleteCustomer(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.userId;

      const customerId = String(req.params.customerId);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const customer = await customerService.deactivateCustomer(
        userId,
        customerId,
      );

      return res.status(200).json({
        success: true,
        message: "Customer deactivated successfully",
        data: customer,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.message || "Failed to deactivate customer",
      });
    }
  }
}

export default new CustomerController();
