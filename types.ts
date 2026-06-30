export type Category = "carrinho" | "entradinhas" | "porcoes" | "sobremesas" | "servicos";

export interface CategoryMeta {
  label: string;
  icon: string;
}

export interface MenuItem {
  id: string;
  cat: Category;
  name: string;
  desc: string | null;
  price: number | null;
  unit: string | null;
  image: string; // Product photo URL
}
