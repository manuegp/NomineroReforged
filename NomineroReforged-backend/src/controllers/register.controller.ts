import { RegisterService } from "@/services/register.service";
import { AppError } from "../utils/errorHandler";
import { Request, Response, NextFunction } from "express";
import path from "path";
import fs from 'fs';

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
      const registers = await this.registerService.getAllRegistersByUserId(
        id,
        from as string,
        to as string
      );
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
        message: "Register added successfully",
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
      const registerId = await this.registerService.updateRegister(
        registerData,
        id
      );

      res.status(201).json({
        message: "Register updated successfully",
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
        message: "Register deleted successfully",
        registerId,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateReport(req: Request, res: Response, next: NextFunction) {
    try {
      const reportData = req.body;
      const filesData = await this.registerService.generateReport(reportData);
  
      const xlsxFilePath = path.resolve(__dirname, '..', '..', 'data', 'temporary', 'json', `${filesData.xlsxName}`);
      const jsonFilePath = path.resolve(__dirname, '..', '..', 'data', 'temporary', 'json', `${filesData.jsonName}`);
  
      res.sendFile(xlsxFilePath, async (err) => {
        if (err) {
          console.error('Error al enviar el archivo:', err);
          return res.status(404).send('Archivo no encontrado');
        }
  
        // Eliminar archivos solo después de que se haya enviado el archivo correctamente
        try {
          await fs.promises.unlink(jsonFilePath);
          console.log('Archivo JSON borrado exitosamente.');
        } catch (error) {
          console.error('Error al borrar el archivo JSON:', error);
        }
  
        try {
          await fs.promises.unlink(xlsxFilePath);
          console.log('Archivo XLSX borrado exitosamente.');
        } catch (error) {
          console.error('Error al borrar el archivo XLSX:', error);
        }
      });
    } catch (error) {
      console.error('Error generando el reporte:', error);
      res.status(500).send(`Error: ${error}`);
    }
  }
  
}
