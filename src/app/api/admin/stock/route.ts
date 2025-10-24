import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create admin client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// GET - Fetch all stock items for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('stock_marbre')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create a new stock item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.user_id || !body.product_name || !body.type_marbre) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, product_name, type_marbre' },
        { status: 400 }
      )
    }

    if (!body.quantity || body.quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      )
    }

    if (!body.longueur || !body.largeur || !body.epaisseur || 
        body.longueur <= 0 || body.largeur <= 0 || body.epaisseur <= 0) {
      return NextResponse.json(
        { error: 'All dimensions (longueur, largeur, epaisseur) must be greater than 0' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('stock_marbre')
      .insert({
        user_id: body.user_id,
        product_name: body.product_name,
        type_marbre: body.type_marbre,
        quantity: parseInt(body.quantity),
        longueur: parseFloat(body.longueur),
        largeur: parseFloat(body.largeur),
        epaisseur: parseFloat(body.epaisseur),
        images: body.images || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
