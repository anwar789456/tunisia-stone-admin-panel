export interface Profile {
  id: string
  email: string | null
  telephone: string | null
  nom: string | null
  prenom: string | null
  societe: string | null
  category: string | null
  slug: string | null
  avatar_url: string | null
  is_pro: boolean | null
  is_admin?: boolean | null
}

export interface MarketplacePost {
  id: string
  user_id: string
  title: string
  description: string | null
  price: number | null
  location: string | null
  images: string[] | null
  category: string | null
  status: string | null
  contact_info: string | null
  created_at: string
  updated_at: string
}

export interface StockMarbre {
  id: string
  user_id: string
  product_name: string
  type_marbre: string
  quantity: number
  longueur: number
  largeur: number
  epaisseur: number
  images: string[] | null
  created_at: string
  updated_at: string
}

export interface PostDemand {
  id: string
  post_id: string
  sender_id: string
  message: string | null
  status: string | null
  created_at: string
}
