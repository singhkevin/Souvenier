'use server'

import puppeteer from 'puppeteer'
import { supabaseAdmin as supabase } from '@/supabase/admin'

interface Product {
  id: string
  name: string
  image_url: string
  sale_price: number
}

interface ClientData {
  id: string
  name: string
  logo_url: string
  primary_color: string
}

export async function generateCatalogPdf(clientSlug: string, userId: string) {
  try {
    // 1. Fetch Client Data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, logo_url, primary_color, margin_percent')
      .eq('slug', clientSlug)
      .single()

    if (clientError || !client) throw new Error('Client not found')

    // 2. Fetch Products
    const { data: productItems, error: productError } = await supabase
      .from('client_products')
      .select(`
        products (
          id,
          name,
          image_url,
          procurement_price
        )
      `)
      .eq('client_id', client.id)

    if (productError) throw new Error('Error fetching products')

    const products = (productItems as any[]).map((item) => {
      const p = item.products
      const salePrice = (p.procurement_price || 0) * (1 + (client.margin_percent || 0) / 100)
      return {
        id: p.id,
        name: p.name,
        image_url: p.image_url,
        sale_price: salePrice,
      }
    })

    // 3. Track Download in Supabase
    const { error: trackError } = await supabase
      .from('catalog_downloads')
      .insert({
        user_id: userId,
        client_id: client.id,
        downloaded_at: new Date().toISOString(),
      })

    if (trackError) {
      console.error('Failed to track download:', trackError)
      // We don't throw here to allow the PDF generation to continue
    }

    // 4. Generate HTML for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; color: #111; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${client.primary_color || '#8b5cf6'}; padding-bottom: 20px; margin-bottom: 40px; }
          .logo { height: 60px; object-fit: contain; }
          .client-name { font-size: 24px; font-weight: 900; color: ${client.primary_color || '#8b5cf6'}; }
          .catalog-title { font-size: 48px; font-weight: 900; text-align: center; margin: 40px 0; letter-spacing: -1px; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
          .product-card { border: 1px solid #eee; border-radius: 12px; overflow: hidden; padding: 0; }
          .product-image { width: 100%; aspect-ratio: 1; background-color: #f9f9f9; object-fit: cover; }
          .product-info { padding: 20px; }
          .product-name { font-size: 18px; font-weight: 700; margin: 0 0 10px 0; }
          .product-price { font-size: 20px; font-weight: 900; color: ${client.primary_color || '#8b5cf6'}; }
          .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          ${client.logo_url ? `<img src="${client.logo_url}" class="logo" />` : `<div class="client-name">${client.name}</div>`}
          <div style="text-align: right">
            <div style="font-weight: 700">LOOKBOOK 2024</div>
            <div style="color: #666">Prepared exclusively for ${client.name}</div>
          </div>
        </div>

        <h1 class="catalog-title">Curated Collection</h1>

        <div class="grid">
          ${products.map(p => `
            <div class="product-card">
              <img src="${p.image_url || 'https://via.placeholder.com/400'}" class="product-image" />
              <div class="product-info">
                <div class="product-name">${p.name}</div>
                <div class="product-price">$${p.sale_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="footer">
          &copy; 2024 ${client.name} Gifting Platform. All rights reserved. Professional B2B Catalog.
        </div>
      </body>
      </html>
    `

    // 5. Use Puppeteer to generate PDF
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true })
    await browser.close()

    return {
      success: true,
      pdfBase64: Buffer.from(pdfBuffer).toString('base64'),
    }

  } catch (error: any) {
    console.error('PDF Generation Error:', error)
    return { success: false, error: error.message }
  }
}
