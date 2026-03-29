export interface Farmer {
    id:string,
    first_name: string;
    last_name: string;
    display_name: string;
    cpf: string;
    phone: string;
    email: string;
    profession: string;
    description: string;
    password: string;
    confirm_password?: string;
    status?: string;
    gender?: string;
    address: {
        address_type?: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
        zip_code: string;
        latitude?: number;
        longitude?: number;
        is_primary?: boolean;
        
    }
}

export interface FarmerUpdate {
    id:string,
    first_name?: string;
    last_name?: string;
    display_name?: string;
    phone: string;
    cpf:string;
    email?: string;
    profession?: string;
    description?: string;
    password?: string;
    status?: string;
    gender?: string;

 address: {
        address_type?: string;
        street: string;
        number: string;
        complement: string;
        neighborhood: string;
        city: string;
        state: string;
        zip_code: string;
        latitude?: number;
        longitude?: number;
        is_primary?: boolean;
        
    }
}