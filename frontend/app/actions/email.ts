"use server";

import { Resend } from 'resend';

// Initialize Resend with API key
// In production, use environment variables
const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function sendOrderConfirmationEmail(
  email: string, 
  orderDetails: {
    items: Array<{
      title: string;
      price: number;
      quantity: number;
    }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  }
) {
  try {
    // Format order items for email
    const itemsList = orderDetails.items.map(item => 
      `${item.title} - $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    // Create email content
    const emailContent = `
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
      
      <h2>Order Details:</h2>
      <div>${itemsList}</div>
      
      <h3>Order Summary:</h3>
      <p>Subtotal: $${orderDetails.subtotal.toFixed(2)}</p>
      <p>Shipping: $${orderDetails.shipping.toFixed(2)}</p>
      <p>Tax: $${orderDetails.tax.toFixed(2)}</p>
      <p><strong>Total: $${orderDetails.total.toFixed(2)}</strong></p>
      
      <p>We'll notify you when your order ships.</p>
      <p>Thank you for shopping with SimpleShop!</p>
    `;

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'simpleshop@resend.dev', // Resend test email that works without domain verification
      to: [email],
      subject: 'Your SimpleShop Order Confirmation',
      html: emailContent,
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: unknown) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return { success: false, error: errorMessage };
  }
}
