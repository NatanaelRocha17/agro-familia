import { Address } from "./Address";

export interface Farmer {
    id: number;
    first_name: string;
    last_name: string;
    display_name: string;
    cpf: string;
    phone: string;
    email: string;
    profession: string;
    description: string;
    password_hash: string;
    confirm_password: string;
    status: string;
    gender: string;
    Address: Address[];
}