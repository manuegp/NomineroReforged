import { RegisterService } from "@/services/register.service";
import { AppError } from "../utils/errorHandler";
import { Request, Response, NextFunction } from "express";

export class RegisterController {
  constructor(private registerService: RegisterService) {}

  async getAllRegistersByUserId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const id = parseInt(req.params.id);
      const { from, to } = req.query;
      if (isNaN(id)) throw new AppError("Invalid type ID", 400);
      const registers = await this.registerService.getAllRegistersByUserId(id, from as string, to as string);
      res.status(200).json(registers);
    } catch (error) {
      next(error);
    }
  }

  async addRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const registerData = req.body; // Asegúrate de que el body contiene los datos necesarios
      const registerId = await this.registerService.addRegister(registerData);
  
      res.status(201).json({
        message: 'Register added successfully',
        registerId,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const registerData = req.body; // Asegúrate de que el body contiene los datos necesarios
      const registerId = await this.registerService.updateRegister(registerData, id);
  
      res.status(201).json({
        message: 'Register updated successfully',
        registerId,
      });
    } catch (error) {
      next(error);
    }
  }
  async deleteRegister(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id);
      const registerId = await this.registerService.deleteRegister(id);
  
      res.status(200).json({
        message: 'Register deleted successfully',
        registerId,
      });
    } catch (error) {
      next(error);
    }
  }
  
}
