import { Request, Response } from 'express';
import { CargoServiceConfig } from '@cargolink/shared';
export declare class CargoController {
    private static cargoManager;
    static initialize(configs: CargoServiceConfig[]): void;
    static getQuotes(req: Request, res: Response): Promise<void>;
    static getBestQuotes(req: Request, res: Response): Promise<void>;
    static trackShipment(req: Request, res: Response): Promise<void>;
    static createShipment(req: Request, res: Response): Promise<void>;
    static cancelShipment(req: Request, res: Response): Promise<void>;
    static getProviders(req: Request, res: Response): Promise<void>;
    static getProviderCapabilities(req: Request, res: Response): Promise<void>;
    static healthCheck(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=cargo.controller.d.ts.map