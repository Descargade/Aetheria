import { Resend } from "resend";

const FROM = "AETHERIA <onboarding@resend.dev>";
const ADMIN_EMAIL = "solsaldena@gmail.com";

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured - skipping email");
    return null;
  }
  return new Resend(apiKey);
}

function itemsHtml(items: { productName: string; quantity: number; price: number; selectedSize?: string | null; selectedColor?: string | null }[]) {
  return items.map((i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px">${i.productName}${i.selectedSize ? ` (${i.selectedSize})` : ""}${i.selectedColor ? ` - ${i.selectedColor}` : ""}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:right">$${Number(i.price).toLocaleString("es-AR")}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:right">$${(i.quantity * Number(i.price)).toLocaleString("es-AR")}</td>
    </tr>
  `).join("");
}

function baseHtml(content: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden">
      <tr><td style="padding:32px 40px;background:#000;text-align:center">
        <h1 style="color:#fff;font-size:24px;margin:0;letter-spacing:4px;text-transform:uppercase">AETHERIA</h1>
      </td></tr>
      <tr><td style="padding:32px 40px">${content}</td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

export async function sendOrderNotification(order: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  total: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  paymentMethodName?: string | null;
  shippingMethodName?: string | null;
  items: { productName: string; quantity: number; price: number; selectedSize?: string | null; selectedColor?: string | null }[];
}) {
  const resend = getResend();
  if (!resend) return;

  const itemsHtmlStr = itemsHtml(order.items);

  const html = baseHtml(`
    <p style="font-size:16px;color:#333;margin:0 0 4px">¡Nuevo pedido <strong>#${order.id}</strong>!</p>
    <p style="font-size:14px;color:#666;margin:0 0 24px">Recibido el ${new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="font-size:12px;color:#888;padding-bottom:4px;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:1px" colspan="2">Cliente</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#333">${order.firstName} ${order.lastName}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#333">${order.email}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#333">${order.phone}</td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="font-size:12px;color:#888;padding-bottom:4px;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:1px" colspan="2">Envío</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#333">${order.address}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#333">${order.city}, ${order.province} (CP ${order.postalCode})</td></tr>
      ${order.shippingMethodName ? `<tr><td style="padding:4px 0;font-size:14px;color:#333">Método: ${order.shippingMethodName}</td></tr>` : ""}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="font-size:12px;color:#888;padding-bottom:4px;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:1px">Producto</td>
          <td style="font-size:12px;color:#888;padding-bottom:4px;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:1px;text-align:center">Cant</td>
          <td style="font-size:12px;color:#888;padding-bottom:4px;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:1px;text-align:right">Precio</td>
          <td style="font-size:12px;color:#888;padding-bottom:4px;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:1px;text-align:right">Subtotal</td></tr>
      ${itemsHtmlStr}
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="padding:4px 0;font-size:14px;color:#666;text-align:right">Subtotal:</td><td style="padding:4px 0;font-size:14px;color:#333;text-align:right;width:120px">$${order.subtotal.toLocaleString("es-AR")}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#666;text-align:right">Descuento:</td><td style="padding:4px 0;font-size:14px;color:#e74c3c;text-align:right">-$${order.discount.toLocaleString("es-AR")}</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#666;text-align:right">Envío:</td><td style="padding:4px 0;font-size:14px;color:#333;text-align:right">$${order.shippingCost.toLocaleString("es-AR")}</td></tr>
      <tr><td style="padding:8px 0 4px;font-size:16px;font-weight:bold;color:#000;text-align:right;border-top:2px solid #000">Total:</td>
          <td style="padding:8px 0 4px;font-size:16px;font-weight:bold;color:#000;text-align:right;border-top:2px solid #000">$${order.total.toLocaleString("es-AR")}</td></tr>
      ${order.paymentMethodName ? `<tr><td style="padding:4px 0;font-size:12px;color:#888;text-align:right;text-transform:uppercase;letter-spacing:1px">${order.paymentMethodName}</td></tr>` : ""}
    </table>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `Nuevo pedido #${order.id} — AETHERIA`,
      html,
    });
    console.log(`Admin notification sent for order #${order.id}`);
  } catch (err) {
    console.error("Failed to send admin notification:", err);
  }
}

export async function sendOrderConfirmationToCustomer(order: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  total: number;
  paymentMethodName?: string | null;
  shippingMethodName?: string | null;
}) {
  const resend = getResend();
  if (!resend) return;

  const html = baseHtml(`
    <p style="font-size:16px;color:#333;margin:0 0 4px">¡Hola ${order.firstName}! 🎉</p>
    <p style="font-size:14px;color:#666;margin:0 0 24px">Tu pedido <strong>#${order.id}</strong> fue procesado correctamente.</p>

    <div style="background:#f8f8f8;padding:20px;margin-bottom:24px;border-left:3px solid #e91e63">
      <p style="font-size:13px;color:#333;margin:0 0 8px"><strong>DATOS PARA TRANSFERENCIA</strong></p>
      <p style="font-size:13px;color:#666;margin:0">Te contactaremos pronto para coordinar el pago y el envío.</p>
    </div>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="font-size:12px;color:#888;padding-bottom:4px;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:1px" colspan="2">Resumen</td></tr>
      <tr><td style="padding:4px 0;font-size:14px;color:#333">Total:</td><td style="padding:4px 0;font-size:14px;color:#333;font-weight:bold">$${order.total.toLocaleString("es-AR")}</td></tr>
      ${order.shippingMethodName ? `<tr><td style="padding:4px 0;font-size:14px;color:#333">Envío:</td><td style="padding:4px 0;font-size:14px;color:#333">${order.shippingMethodName}</td></tr>` : ""}
      ${order.paymentMethodName ? `<tr><td style="padding:4px 0;font-size:14px;color:#333">Pago:</td><td style="padding:4px 0;font-size:14px;color:#333">${order.paymentMethodName}</td></tr>` : ""}
    </table>

    <p style="font-size:12px;color:#999;text-align:center;margin:0;padding-top:16px;border-top:1px solid #eee">
      AETHERIA — Te enviaremos una confirmación cuando el pedido sea aprobado.
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Pedido #${order.id} recibido — AETHERIA`,
      html,
    });
    console.log(`Confirmation sent to customer #${order.id}`);
  } catch (err) {
    console.error("Failed to send customer confirmation:", err);
  }
}

export async function sendOrderConfirmedToCustomer(order: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  paymentMethodName?: string | null;
  shippingMethodName?: string | null;
}) {
  const resend = getResend();
  if (!resend) return;

  const html = baseHtml(`
    <p style="font-size:16px;color:#333;margin:0 0 4px">¡Hola ${order.firstName}! ✅</p>
    <p style="font-size:14px;color:#666;margin:0 0 24px">Tu pedido <strong>#${order.id}</strong> ha sido <strong style="color:#2e7d32">confirmado</strong>.</p>

    <p style="font-size:14px;color:#333;margin-bottom:24px">Estamos preparando tu pedido para el envío. Te avisaremos cuando esté en camino.</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
      <tr><td style="font-size:12px;color:#888;padding-bottom:4px;border-bottom:1px solid #ddd;text-transform:uppercase;letter-spacing:1px" colspan="2">Detalles</td></tr>
      ${order.shippingMethodName ? `<tr><td style="padding:4px 0;font-size:14px;color:#333">Envío:</td><td style="padding:4px 0;font-size:14px;color:#333">${order.shippingMethodName}</td></tr>` : ""}
      ${order.paymentMethodName ? `<tr><td style="padding:4px 0;font-size:14px;color:#333">Pago:</td><td style="padding:4px 0;font-size:14px;color:#333">${order.paymentMethodName}</td></tr>` : ""}
    </table>

    <p style="font-size:12px;color:#999;text-align:center;margin:0;padding-top:16px;border-top:1px solid #eee">
      AETHERIA — Gracias por tu compra ❤️
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Pedido #${order.id} confirmado — AETHERIA ✅`,
      html,
    });
    console.log(`Order confirmed email sent to customer #${order.id}`);
  } catch (err) {
    console.error("Failed to send order confirmed email:", err);
  }
}

export async function sendOrderShippedToCustomer(order: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  shippingMethodName?: string | null;
  trackingCode?: string | null;
}) {
  const resend = getResend();
  if (!resend) return;

  const html = baseHtml(`
    <p style="font-size:16px;color:#333;margin:0 0 4px">¡Hola ${order.firstName}! 🚚</p>
    <p style="font-size:14px;color:#666;margin:0 0 24px">Tu pedido <strong>#${order.id}</strong> ya fue <strong style="color:#1565c0">enviado</strong>.</p>

    <p style="font-size:14px;color:#333;margin-bottom:24px">Tu compra está en camino. A continuación tenés los datos del envío:</p>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;background:#f9f9f9;border:1px solid #eee">
      <tr><td style="font-size:12px;color:#888;padding:12px 16px 4px;text-transform:uppercase;letter-spacing:1px" colspan="2">Datos del envío</td></tr>
      ${order.shippingMethodName ? `<tr><td style="padding:8px 16px;font-size:14px;color:#333">Método:</td><td style="padding:8px 16px;font-size:14px;color:#333">${order.shippingMethodName}</td></tr>` : ""}
      ${order.trackingCode ? `<tr><td style="padding:8px 16px;font-size:14px;color:#333">Tracking:</td><td style="padding:8px 16px;font-size:14px;color:#333;font-weight:bold">${order.trackingCode}</td></tr>` : ""}
    </table>

    <p style="font-size:12px;color:#999;text-align:center;margin:0;padding-top:16px;border-top:1px solid #eee">
      AETHERIA — Gracias por tu compra ❤️
    </p>
  `);

  try {
    await resend.emails.send({
      from: FROM,
      to: order.email,
      subject: `Pedido #${order.id} enviado — AETHERIA 🚚`,
      html,
    });
    console.log(`Order shipped email sent to customer #${order.id}`);
  } catch (err) {
    console.error("Failed to send order shipped email:", err);
  }
}