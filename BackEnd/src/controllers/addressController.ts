import { Request, Response } from "express";
import addressRepository from "../repositories/AddressRepository";
import pool from '../config/database';

export const deleteAddress = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);

        const deleted = await addressRepository.deleteAddress(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Address não encontrado' });
        }

        return res.json({ message: 'Address deletado com sucesso' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao deletar address' });
    }
};



export const getAddressByFarmer = async (req: Request, res: Response) => {
    try {
        const farmer_id = Number(req.params.farmer_id);

        const address = await addressRepository.getAddressByFarmerId(farmer_id);

        if (!address) {
            return res.status(404).json({
                message: 'Address não encontrado para o farmer'
            });
        }

        return res.json(address);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao buscar address' });
    }
};

export default {
    deleteAddress,
    getAddressByFarmer
};