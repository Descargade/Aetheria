import { db } from "@workspace/db";
import {
  categoriesTable,
  productsTable,
  shippingProvidersTable,
  shippingMethodsTable,
  paymentMethodsTable,
  storePickupConfigTable,
  couponsTable,
} from "@workspace/db";

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Categories ────────────────────────────────────────────────
  const cats = await db.insert(categoriesTable).values([
    { name: "Remeras", slug: "remeras", description: "Remeras oversize, básicas y estampadas", active: true },
    { name: "Pantalones", slug: "pantalones", description: "Pantalones cargo, jogging y jeans", active: true },
    { name: "Buzos", slug: "buzos", description: "Buzos con capucha y canguros", active: true },
    { name: "Camperas", slug: "camperas", description: "Camperas rompevientos y chalecos", active: true },
    { name: "Accesorios", slug: "accesorios", description: "Gorras, riñoneras y medias", active: true },
  ]).returning();
  console.log(`  ✓ ${cats.length} categorías creadas`);

  const [remeras, pantalones, buzos, camperas, accesorios] = cats;

  // ─── Products ──────────────────────────────────────────────────
  const products = await db.insert(productsTable).values([
    {
      name: "Remera Oversize Black",
      sku: "RM-OVS-001",
      description: "Remera oversize en algodón peinado 240gsm. Corte holgado, costuras reforzadas y cuello ribeteado. Ideal para uso diario con estilo urbano.",
      shortDescription: "Algodón peinado 240gsm · Corte oversize",
      categoryId: remeras.id,
      price: "15900",
      salePrice: "12900",
      images: ["/images/remera-oversize-black.webp"],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Blanco", "Gris", "Verde Oliva"],
      stock: 50,
      featured: true,
      isNew: false,
      active: true,
    },
    {
      name: "Remera Basic White",
      sku: "RM-BSC-002",
      description: "Remera básica de manga corta. Algodón 180gsm, corte regular. Un básico que no puede faltar en tu placard.",
      shortDescription: "Algodón 180gsm · Corte regular",
      categoryId: remeras.id,
      price: "9900",
      images: ["/images/remera-basic-white.webp"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blanco", "Negro", "Gris"],
      stock: 80,
      featured: false,
      isNew: false,
      active: true,
    },
    {
      name: "Remera Estampada Street",
      sku: "RM-ST-003",
      description: "Remera con estampa serigráfica frontal. Algodón 220gsm, corte oversize. Diseño exclusivo de la colección.",
      shortDescription: "Estampa serigráfica · 220gsm",
      categoryId: remeras.id,
      price: "18900",
      images: ["/images/remera-estampada-street.webp"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Blanco", "Rojo"],
      stock: 35,
      featured: true,
      isNew: true,
      active: true,
    },
    {
      name: "Remera Thermal Long Sleeve",
      sku: "RM-TH-004",
      description: "Remera térmica manga larga. Algodón jersey 240gsm. Perfecta para las temporadas de frío.",
      shortDescription: "Manga larga · Jersey 240gsm",
      categoryId: remeras.id,
      price: "17900",
      images: ["/images/remera-thermal-ls.webp"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negro", "Blanco", "Gris Melange"],
      stock: 40,
      featured: false,
      isNew: true,
      active: true,
    },
    {
      name: "Pantalón Cargo Negro",
      sku: "PL-CG-001",
      description: "Pantalón cargo con múltiples bolsillos. Tela ripstop resistente, corte recto y ajuste en botines con elástico.",
      shortDescription: "Ripstop · Corte recto · Bolsillos múltiples",
      categoryId: pantalones.id,
      price: "28900",
      salePrice: "24900",
      images: ["/images/pantalon-cargo-black.webp"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Verde Militar", "Beige"],
      stock: 30,
      featured: true,
      isNew: false,
      active: true,
    },
    {
      name: "Jogging Essential",
      sku: "PL-JG-002",
      description: "Jogging en fleece 320gsm. Cintura con cordón, bolsillos laterales y puños acanalados en tobillos.",
      shortDescription: "Fleece 320gsm · Cintura con cordón",
      categoryId: pantalones.id,
      price: "22900",
      images: ["/images/jogging-essential.webp"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negro", "Gris", "Azul Marino"],
      stock: 45,
      featured: false,
      isNew: false,
      active: true,
    },
    {
      name: "Jean Recto raw",
      sku: "PL-JN-003",
      description: "Jean de corte recto en denim raw sin lavar. 100% algodón, 14oz. Cierre con botón y bragueta de cremallera.",
      shortDescription: "Denim raw 14oz · Corte recto",
      categoryId: pantalones.id,
      price: "35900",
      images: ["/images/jean-raw.webp"],
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Raw", "Lavado Claro", "Negro"],
      stock: 25,
      featured: true,
      isNew: true,
      active: true,
    },
    {
      name: "Buzo Canguro Oversize",
      sku: "BZ-CG-001",
      description: "Buzo canguro oversize en fleepe 400gsm. Capucha amplia forrada, bolsillo frontal tipo canguro y puños acanalados.",
      shortDescription: "Fleece 400gsm · Capucha forrada",
      categoryId: buzos.id,
      price: "32900",
      salePrice: "27900",
      images: ["/images/buzo-canguro-oversize.webp"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Gris Melange", "Verde Oliva", "Burdeo"],
      stock: 35,
      featured: true,
      isNew: false,
      active: true,
    },
    {
      name: "Buzo con Capucha Basic",
      sku: "BZ-CH-002",
      description: "Buzo con capucha en fleece 350gsm. Corte regular, bolsillo canguro y cordón ajustable en capucha.",
      shortDescription: "Fleece 350gsm · Cordón ajustable",
      categoryId: buzos.id,
      price: "26900",
      images: ["/images/buzo-capucha-basic.webp"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negro", "Gris", "Azul Marino", "Blanco"],
      stock: 40,
      featured: false,
      isNew: false,
      active: true,
    },
    {
      name: "Buzo Polar Cierre",
      sku: "BZ-PL-003",
      description: "Buzo polar con cierre frontal completo. Microfibra 320gsm suave al tacto, cuello alto y bolsillos laterales con cierre.",
      shortDescription: "Microfibra 320gsm · Cierre frontal",
      categoryId: buzos.id,
      price: "31900",
      images: ["/images/buzo-polar-cierre.webp"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Gris", "Azul"],
      stock: 20,
      featured: false,
      isNew: true,
      active: true,
    },
    {
      name: "Campera Rompevientos",
      sku: "CK-RV-001",
      description: "Campera rompevientos con tejido Nylon Ripstop. Resistente al agua, capucha plegable y bolsillos con cierre. Ideal para entretiempo.",
      shortDescription: "Nylon Ripstop · Resistente al agua",
      categoryId: camperas.id,
      price: "45900",
      salePrice: "39900",
      images: ["/images/campera-rompevientos.webp"],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negro", "Verde Militar", "Amarillo", "Rojo"],
      stock: 20,
      featured: true,
      isNew: false,
      active: true,
    },
    {
      name: "Chaleco Acolchado",
      sku: "CK-CH-002",
      description: "Chaleco acolchado con relleno de fibra sintética. Liviano, cálido y con bolsillos con cierre. Ideal para superponer.",
      shortDescription: "Acolchado · Liviano · Bolsillos con cierre",
      categoryId: camperas.id,
      price: "38900",
      images: ["/images/chaleco-acolchado.webp"],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Negro", "Gris", "Azul Marino"],
      stock: 15,
      featured: false,
      isNew: true,
      active: true,
    },
    {
      name: "Gorra Dad Hat",
      sku: "AC-GR-001",
      description: "Gorra estilo dad hat con visera curva. Algodón 100%, ajuste metálico trasero y logo bordado frontal.",
      shortDescription: "Algodón · Visera curva · Logo bordado",
      categoryId: accesorios.id,
      price: "8900",
      images: ["/images/gorra-dad-hat.webp"],
      sizes: ["Único"],
      colors: ["Negro", "Beige", "Verde Oliva", "Blanco"],
      stock: 60,
      featured: true,
      isNew: false,
      active: true,
    },
    {
      name: "Riñonera Essential",
      sku: "AC-RN-002",
      description: "Riñonera en nylon resistente al agua. Compartimento principal con cierre y bolsillo frontal. Correa ajustable.",
      shortDescription: "Nylon · Resistente al agua · Correa ajustable",
      categoryId: accesorios.id,
      price: "12900",
      images: ["/images/rinonera-essential.webp"],
      sizes: ["Único"],
      colors: ["Negro", "Beige", "Gris"],
      stock: 40,
      featured: false,
      isNew: false,
      active: true,
    },
    {
      name: "Pack Medias 3 Pares",
      sku: "AC-MD-003",
      description: "Pack de 3 pares de medias tubo en algodón peinado. Costura reforzada en puntas y talón.",
      shortDescription: "3 pares · Algodón peinado · Tubo",
      categoryId: accesorios.id,
      price: "6900",
      images: ["/images/pack-medias.webp"],
      sizes: ["Único"],
      colors: ["Negro", "Blanco", "Pack Mix"],
      stock: 100,
      featured: false,
      isNew: false,
      active: true,
    },
    {
      name: "Mochila Urbana 25L",
      sku: "AC-MC-004",
      description: "Mochila urbana 25 litros en poliéster resistente. Compartimento para notebook, bolsillo frontal organizador y correas acolchadas.",
      shortDescription: "25L · Para notebook · Correas acolchadas",
      categoryId: accesorios.id,
      price: "25900",
      salePrice: "21900",
      images: ["/images/mochila-urbana.webp"],
      sizes: ["Único"],
      colors: ["Negro", "Gris", "Verde Militar"],
      stock: 25,
      featured: false,
      isNew: true,
      active: true,
    },
  ]).returning();
  console.log(`  ✓ ${products.length} productos creados`);

  // ─── Shipping Providers ────────────────────────────────────────
  const providers = await db.insert(shippingProvidersTable).values([
    { code: "correo-argentino", name: "Correo Argentino", description: "Envíos a todo el país con Correo Argentino", active: true, config: {} },
    { code: "andreani", name: "Andreani", description: "Logística Andreani para envíos exprés", active: true, config: {} },
    { code: "oca", name: "OCA", description: "Envíos con OCA a todo el país", active: true, config: {} },
    { code: "pickup", name: "Retiro en Local", description: "Retirá sin costo en nuestro local", active: true, config: {} },
  ]).returning();
  console.log(`  ✓ ${providers.length} proveedores de envío creados`);

  // ─── Shipping Methods ──────────────────────────────────────────
  const methods = await db.insert(shippingMethodsTable).values([
    { name: "Envío Estándar (Correo Argentino)", description: "5-10 días hábiles", price: "4500", estimatedDays: "5-10", active: true, provider: "correo-argentino", config: { zonePrices: { "1": "4500", "2": "5500", "3": "7000", "4": "8500" } }, originZip: "1429" },
    { name: "Envío Express (Correo Argentino)", description: "2-4 días hábiles", price: "6500", estimatedDays: "2-4", active: true, provider: "correo-argentino", config: { zonePrices: { "1": "6500", "2": "7500", "3": "9000", "4": "11000" } }, originZip: "1429" },
    { name: "Envío Estándar (Andreani)", description: "3-7 días hábiles", price: "5500", estimatedDays: "3-7", active: true, provider: "andreani", config: { zonePrices: { "1": "5500", "2": "6500", "3": "8500", "4": "10000" } }, originZip: "1429" },
    { name: "Envío Express (Andreani)", description: "1-3 días hábiles", price: "8000", estimatedDays: "1-3", active: true, provider: "andreani", config: { zonePrices: { "1": "8000", "2": "9500", "3": "12000", "4": "15000" } }, originZip: "1429" },
    { name: "Envío Estándar (OCA)", description: "4-8 días hábiles", price: "4000", estimatedDays: "4-8", active: true, provider: "oca", config: { zonePrices: { "1": "4000", "2": "5000", "3": "6500", "4": "8000" } }, originZip: "1429" },
    { name: "Envío Express (OCA)", description: "1-2 días hábiles", price: "7500", estimatedDays: "1-2", active: true, provider: "oca", config: { zonePrices: { "1": "7500", "2": "9000", "3": "11000", "4": "14000" } }, originZip: "1429" },
    { name: "Retiro en Local", description: "Sin costo · Retirá en nuestro showroom", price: "0", estimatedDays: "1", active: true, provider: "pickup", config: {}, originZip: null },
  ]).returning();
  console.log(`  ✓ ${methods.length} métodos de envío creados`);

  // ─── Payment Methods ───────────────────────────────────────────
  const payments = await db.insert(paymentMethodsTable).values([
    { name: "Transferencia Bancaria", description: "10% de descuento pagando por transferencia", discount: "10", active: true, instructions: "Transferí el monto total a la cuenta que te enviamos por mail. Una vez acreditado, procesamos tu pedido." },
    { name: "Efectivo (Depósito)", description: "5% de descuento pagando en efectivo", discount: "5", active: true, instructions: "Depositá el monto total en efectivo en nuestra cuenta bancaria. Enviá el comprobante por WhatsApp." },
    { name: "Mercado Pago", description: "Pagá con tarjeta, débito o saldo de Mercado Pago", discount: "0", active: true, instructions: "Serás redirigido a Mercado Pago para completar el pago de forma segura." },
    { name: "Tarjeta de Crédito", description: "Hasta 6 cuotas sin interés", discount: "0", active: true, instructions: "Pagá con tu tarjeta de crédito a través de nuestro procesador seguro." },
  ]).returning();
  console.log(`  ✓ ${payments.length} métodos de pago creados`);

  // ─── Store Pickup Config ───────────────────────────────────────
  await db.insert(storePickupConfigTable).values({
    enabled: true,
    address: "Av. Corrientes 1234, Local 5",
    city: "CABA",
    province: "CABA",
    phone: "11 2345-6789",
    hours: "Lun a Vie 10:00-19:00 · Sáb 10:00-14:00",
    instructions: "Presentar DNI y número de pedido. Estacionamiento gratuito en la zona.",
  });
  console.log("  ✓ Configuración de retiro en local creada");

  // ─── Coupons ───────────────────────────────────────────────────
  await db.insert(couponsTable).values([
    { code: "BIENVENIDA", description: "15% de descuento en tu primera compra", discountType: "percentage", discountValue: "15", minPurchase: "5000", active: true, usageLimit: 100 },
    { code: "ENVIOGRATIS", description: "Envío gratis en compras mayores a $30.000", discountType: "percentage", discountValue: "0", minPurchase: "30000", active: true, usageLimit: 50 },
    { code: "FLASH20", description: "20% off por tiempo limitado", discountType: "percentage", discountValue: "20", minPurchase: "10000", active: true, usageLimit: 30 },
  ]);
  console.log("  ✓ Cupones de descuento creados");

  console.log("\n✅ Seed completado exitosamente!");
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
