import { Request, Response } from 'express';
export declare class ShipmentController {
    static createShipment(req: Request, res: Response): Promise<void>;
    static getUserShipments(req: Request, res: Response): Promise<void>;
    static getShipment(req: Request, res: Response): Promise<void>;
    static updateShipmentStatus(req: Request, res: Response): Promise<void>;
    static cancelShipment(req: Request, res: Response): Promise<void>;
    static getShipmentStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=shipment.controller.d.ts.map