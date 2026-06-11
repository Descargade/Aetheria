import { db, pool } from "./index";
import {
  categoriesTable,
  productsTable,
  variantsTable,
  variantImagesTable,
  variantSizesTable,
  promotionsTable,
  couponsTable,
  shippingMethodsTable,
  paymentMethodsTable,
} from "./schema";

async function seed() {
  console.log("Seeding database...");

  // ── Categories ─────────────────────────────────────────────────────────
  const categories = await db.insert(categoriesTable).values([
    { name: "Remeras", slug: "remeras", description: "Remeras urbanas streetwear", image: "/images/categories/remeras.jpg", active: true },
    { name: "Camisas", slug: "camisas", description: "Camisas oversize y slim fit", image: "/images/categories/camisas.jpg", active: true },
    { name: "Buzos", slug: "buzos", description: "Buzos con capucha y canguros", image: "/images/categories/buzos.jpg", active: true },
    { name: "Camperas", slug: "camperas", description: "Camperas rompevientos y térmicas", image: "/images/categories/camperas.jpg", active: true },
    { name: "Pantalones", slug: "pantalones", description: "Pantalones cargo, joggers y más", image: "/images/categories/pantalones.jpg", active: true },
    { name: "Accesorios", slug: "accesorios", description: "Gorros, mochilas, riñoneras", image: "/images/categories/accesorios.jpg", active: true },
  ]).returning();
  console.log(`  ${categories.length} categorías creadas`);

  // ── Helper: get category id by slug ────────────────────────────────────
  const cat = (slug: string) => categories.find((c) => c.slug === slug)!.id;

  // ── Products ───────────────────────────────────────────────────────────

  const productData = [
    // ── REMERAS ──────────────────────────────────────────────────────
    {
      name: "Remera Aetheria OverFit",
      sku: "REM-001",
      description: "Remera de corte oversize con estampado serigráfico frontal. Confeccionada en algodón peinado 240gsm. Costuras reforzadas y cuello ribeteado.",
      shortDescription: "OverFit con estampado frontal. Algodón 240gsm.",
      categoryId: cat("remeras"),
      price: "18900",
      salePrice: "14999",
      images: ["/images/products/remera-overfit-1.png", "/images/products/remera-overfit-2.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Blanco", "Gris", "Burdeo"],
      stock: 150,
      featured: true,
      isNew: true,
    },
    {
      name: "Remera TechWear Base",
      sku: "REM-002",
      description: "Remera técnica de manga larga con paneles transpirables. Ideal para capas intermedias. Tejido DryFit con protección UV.",
      shortDescription: "Manga larga técnica DryFit. Transpirable.",
      categoryId: cat("remeras"),
      price: "22500",
      salePrice: null,
      images: ["/images/products/remera-tech-1.png"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negro", "Carbón"],
      stock: 85,
      featured: false,
      isNew: false,
    },
    {
      name: "Remera Street Logo",
      sku: "REM-003",
      description: "Remera clásica con logo bordado en el pecho y gráfico trasero. Algodón orgánico 200gsm. Corte regular fit.",
      shortDescription: "Logo bordado. Algodón orgánico 200gsm.",
      categoryId: cat("remeras"),
      price: "16500",
      salePrice: "12999",
      images: ["/images/products/remera-logo-1.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Blanco"],
      stock: 200,
      featured: false,
      isNew: true,
    },

    // ── CAMISAS ──────────────────────────────────────────────────────
    {
      name: "Camisa Urban Oversize",
      sku: "CAM-001",
      description: "Camisa de corte oversize con bolsillo frontal. Cierre de botones ocultos y puños ajustables. Tela de algodón con lyocell.",
      shortDescription: "Oversize con bolsillo. Algodón + lyocell.",
      categoryId: cat("camisas"),
      price: "28900",
      salePrice: "24999",
      images: ["/images/products/camisa-urban-1.png", "/images/products/camisa-urban-2.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Beige", "Celeste"],
      stock: 60,
      featured: true,
      isNew: true,
    },
    {
      name: "Camisa Industrial Fit",
      sku: "CAM-002",
      description: "Camisa slim fit con bolsillos utilitarios y cintas reflectivas. Mezcla de algodón y poliéster con tratamiento antimanchas.",
      shortDescription: "Slim fit utilitaria. Antimanchas.",
      categoryId: cat("camisas"),
      price: "32500",
      salePrice: null,
      images: ["/images/products/camisa-industrial-1.png"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negro", "Gris"],
      stock: 40,
      featured: false,
      isNew: true,
    },

    // ── BUZOS ────────────────────────────────────────────────────────
    {
      name: "Buzo Canguro Aetheria",
      sku: "BUZ-001",
      description: "Buzo canguro con capucha ajustable y bolsillo frontal tipo canguro. Forro interior cepillado. Algodón frisa 320gsm.",
      shortDescription: "Canguro con capucha. Algodón frisa 320gsm.",
      categoryId: cat("buzos"),
      price: "35900",
      salePrice: "29999",
      images: ["/images/products/buzo-canguro-1.png", "/images/products/buzo-canguro-2.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Gris Melange", "Verde Militar"],
      stock: 90,
      featured: true,
      isNew: false,
    },
    {
      name: "Buzo Oversize Hoodie",
      sku: "BUZ-002",
      description: "Hoodie de corte oversize con capucha reforzada y cordón metálico. Bolsillo frontal canguro y bolsillo oculto con cierre.",
      shortDescription: "Hoodie oversize con bolsillo oculto.",
      categoryId: cat("buzos"),
      price: "38900",
      salePrice: null,
      images: ["/images/products/hoodie-oversize-1.png"],
      sizes: ["M", "L", "XL", "XXL"],
      colors: ["Negro", "Burdeo"],
      stock: 70,
      featured: false,
      isNew: true,
    },

    // ── CAMPERAS ─────────────────────────────────────────────────────
    {
      name: "Campera Rompevientos Tech",
      sku: "CMP-001",
      description: "Campera rompevientos con tecnología WaterShield. Costuras termoselladas, capucha desmontable y bolsillos con cierre impermeable.",
      shortDescription: "Rompevientos WaterShield. Capucha desmontable.",
      categoryId: cat("camperas"),
      price: "54900",
      salePrice: "45999",
      images: ["/images/products/campera-tech-1.png", "/images/products/campera-tech-2.png", "/images/products/campera-tech-3.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Gris", "Naranja"],
      stock: 35,
      featured: true,
      isNew: true,
    },
    {
      name: "Campera Térmica Invernal",
      sku: "CMP-002",
      description: "Campera acolchada térmica con relleno de fibra hueca siliconada. Capucha forrada con pelo sintético desmontable.",
      shortDescription: "Acolchada térmica. Capucha desmontable.",
      categoryId: cat("camperas"),
      price: "65900",
      salePrice: "54999",
      images: ["/images/products/campera-termica-1.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Verde Militar"],
      stock: 25,
      featured: false,
      isNew: false,
    },

    // ── PANTALONES ───────────────────────────────────────────────────
    {
      name: "Jogger TechWear Cargo",
      sku: "PAN-001",
      description: "Jogger cargo con múltiples bolsillos utilitarios. Cintura elástica con cordón ajustable. Tejido resistente al agua con costuras reforzadas.",
      shortDescription: "Cargo utilitario con bolsillos. Resistente al agua.",
      categoryId: cat("pantalones"),
      price: "32500",
      salePrice: "27999",
      images: ["/images/products/jogger-cargo-1.png", "/images/products/jogger-cargo-2.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Gris", "Verde Militar"],
      stock: 80,
      featured: true,
      isNew: true,
    },
    {
      name: "Pantalón Cargo Suelto",
      sku: "PAN-002",
      description: "Pantalón cargo de corte recto y amplio. Cintura con trabillas para cinturón. Bolsillos laterales tipo cargo con tapa y velcro.",
      shortDescription: "Cargo recto y amplio con bolsillos con tapa.",
      categoryId: cat("pantalones"),
      price: "29900",
      salePrice: null,
      images: ["/images/products/pantalon-cargo-1.png"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Beige", "Oliva"],
      stock: 55,
      featured: false,
      isNew: false,
    },

    // ── ACCESORIOS ───────────────────────────────────────────────────
    {
      name: "Gorra Aetheria 5Panel",
      sku: "ACC-001",
      description: "Gorra 5 panel con visera plana y logo bordado. Correa ajustable con cierre metálico. Algodón twill 280gsm.",
      shortDescription: "5 panel con logo bordado. Algodón twill.",
      categoryId: cat("accesorios"),
      price: "12500",
      salePrice: null,
      images: ["/images/products/gorra-5panel-1.png"],
      sizes: ["Único"],
      colors: ["Negro", "Blanco"],
      stock: 120,
      featured: true,
      isNew: true,
    },
    {
      name: "Riñonera Tech Pouch",
      sku: "ACC-002",
      description: "Riñonera multifunción con compartimentos organizadores. Correa ajustable. Material nylon resistente al agua con costuras termoselladas.",
      shortDescription: "Multicompartimentos. Nylon resistente al agua.",
      categoryId: cat("accesorios"),
      price: "18900",
      salePrice: "15999",
      images: ["/images/products/rinonera-tech-1.png"],
      sizes: ["Único"],
      colors: ["Negro", "Gris", "Naranja"],
      stock: 200,
      featured: false,
      isNew: true,
    },
  ];

  for (const p of productData) {
    const [product] = await db.insert(productsTable).values(p).returning();
    console.log(`  Producto creado: ${product.name} ($${product.price})`);

    // Create one variant per color
    for (const color of p.colors) {
      const colorMap: Record<string, string> = {
        "Negro": "#000000",
        "Blanco": "#FFFFFF",
        "Gris": "#808080",
        "Gris Melange": "#7a7a7a",
        "Carbón": "#36454F",
        "Burdeo": "#800020",
        "Beige": "#F5F5DC",
        "Celeste": "#87CEEB",
        "Verde Militar": "#4B5320",
        "Oliva": "#556B2F",
        "Naranja": "#FF6600",
      };
      const hex = colorMap[color] || "#000000";
      const [variant] = await db.insert(variantsTable).values({
        productId: product.id,
        colorName: color,
        colorHex: hex,
        sortOrder: p.colors.indexOf(color),
      }).returning();

      // Add images for this variant
      for (const img of p.images) {
        await db.insert(variantImagesTable).values({
          variantId: variant.id,
          objectPath: img,
          sortOrder: p.images.indexOf(img),
        });
      }

      // Add sizes with stock for this variant
      const stockPerSize = Math.floor(product.stock / (p.colors.length * p.sizes.length)) || 1;
      for (const size of p.sizes) {
        const sizeStock = Math.floor(stockPerSize + Math.random() * 10);
        await db.insert(variantSizesTable).values({
          variantId: variant.id,
          size: size,
          stock: sizeStock,
        });
      }
    }
  }
  console.log(`  ${productData.length} productos creados con variantes`);

  // ── Promotions ────────────────────────────────────────────────────────
  await db.insert(promotionsTable).values([
    { title: "Bienvenido 10% OFF", discountType: "percentage", discountValue: "10", badge: "NUEVO", active: true, description: "10% OFF en tu primera compra" },
    { title: "Envío gratis", discountType: "free_shipping", discountValue: "0", badge: "ENVÍO", active: true, description: "Envío gratis en compras mayores a $35.000" },
    { title: "20% OFF Aetheria", discountType: "percentage", discountValue: "20", badge: "20%", active: true, description: "20% OFF en compras superiores a $50.000" },
  ]);
  console.log("  3 promociones creadas");

  // ── Coupons ───────────────────────────────────────────────────────────
  await db.insert(couponsTable).values([
    { code: "BIENVENIDO10", description: "10% OFF en tu primera compra", discountType: "percentage", discountValue: "10", minPurchase: "15000", usageLimit: 100, active: true },
    { code: "ENVIOGRATIS", description: "Envío gratis en compras mayores a $35.000", discountType: "free_shipping", discountValue: "0", minPurchase: "35000", usageLimit: 50, active: true },
    { code: "AETHERIA20", description: "20% OFF en compras superiores a $50.000", discountType: "percentage", discountValue: "20", minPurchase: "50000", usageLimit: 30, active: true },
  ]);
  console.log("  3 cupones creados");

  // ── Shipping Methods ──────────────────────────────────────────────────
  await db.insert(shippingMethodsTable).values([
    { name: "Envío estándar", description: "5-7 días hábiles", price: "1500", estimatedDays: "5-7", active: true },
    { name: "Envío exprés", description: "2-3 días hábiles", price: "3500", estimatedDays: "2-3", active: true },
    { name: "Envío gratis", description: "7-10 días hábiles (compras +$35.000)", price: "0", estimatedDays: "7-10", active: true },
    { name: "Retiro en local", description: "Sin costo", price: "0", estimatedDays: "24hs", active: true },
  ]);
  console.log("  4 métodos de envío creados");

  // ── Payment Methods ──────────────────────────────────────────────────
  await db.insert(paymentMethodsTable).values([
    { name: "Tarjeta de crédito", description: "Visa, Mastercard, American Express", discount: "0", active: true },
    { name: "Tarjeta de débito", description: "Visa Débito, Maestro", discount: "0", active: true },
    { name: "Transferencia bancaria", description: "10% de descuento por transferencia", discount: "10", active: true, instructions: "Realizá la transferencia a la cuenta que te enviaremos por mail" },
    { name: "Efectivo", description: "10% de descuento por pago en efectivo", discount: "10", active: true },
  ]);
  console.log("  4 métodos de pago creados");

  console.log("\n✅ Seed completado exitosamente!");
  await pool.end();
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});
