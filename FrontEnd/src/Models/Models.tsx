import type { LucideIcon } from "lucide-react";


// 🔹 Address
export type Address = {
  id: number;
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
};

// 🔹 Farmer
export interface Farmer {
  id: string;
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
  address: Address;
}

// Update
export type FarmerUpdate = Partial<Omit<Farmer, "id" | "address">> & {
  id: string;
  address: Partial<Address>;
};

// 🔹 Product Image (UNIFICADO)
export interface ProductImage {
  id?: number;
  image_url: string;
  display_order?: number;
  uploaded_at?: Date;
  public_id?: string; // 🔥 campo do cloudinary

  // 🔥 campo do front
  isNew?: boolean;
}

// 🔹 Base Product
export type BaseProduct = {
  name: string;
  description?: string;
  price: number;
  sale_price: number;
  unit_measure?: string;
  product_origin?: string;
  production_method?: string;
  status: number;
};

// 🔹 Produto (API)
export interface Product extends BaseProduct {
  id: string;
  images?: ProductImage[];
  created_at: string;
  updated_at: string;
  farmer?: {
    id: string;
    first_name: string;
    display_name: string;
    profession: string;
    phone: string;
  };
  category?: string;
  category_id?: number;
  distance_km?: number; 
}

// 🔹 DTO (envio pra API)
export type CreateProductDTO = BaseProduct & {
  fk_farmer_id?: string;
  fk_category_id?: number;
};

// 🔹 Form (FRONT)
export type ProductFormData = BaseProduct & {
  category?: string;
  category_id: number;
  images: ProductImage[];
};


export interface GetProductDetailsResponse {
    product: Product;
    farmer: Farmer;
    deliveryMethods: deliveryMethods[];
    paymentMethods: paymentMethods[];
}

export interface GetAllCategories{
  id: number;
  name: string;
}

export interface paymentMethods {
    id: number;
    method_name: string;
    icon: LucideIcon;
    description: string;
    status: number;
    accepted: boolean;
}


export interface deliveryMethods {
    id: number;
    option_name: string;
    type: number;
    icon: LucideIcon;
    type_name: string;
    estimated_time: number;
    cost: string;
    notes: string;
    description: string;
    addresses: Address[];
}