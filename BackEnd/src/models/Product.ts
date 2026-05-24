import { Farmer } from "./Farmer";

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sale_price: number;
  unit_measure?: string;
  product_origin?: string;
  production_method?: string;
  status: number;

  created_at: string | Date;
  updated_at: string | Date;

  farmer_id: number;
  category_id?: number;
  category: string;
  images?: ProductImage[]; 
}

export interface ProductImage {
  id?: number;
  image_url: string;
  display_order: number; 
  uploaded_at?: string | Date;
  public_id: string; 
}

export type CreateProductDTO = {
    name: string;
    description?: string;
    price: number;
    sale_price: number;
    unit_measure?: string;
    product_origin?: string;
    production_method?: string;
    status: number;
    farmer_id?: number;
    category_id?: number;
};

export type ProductWithFarmerDTO = {
    product: Product;
    farmer: Farmer;
};