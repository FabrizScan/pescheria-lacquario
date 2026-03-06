export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();
    const { name, phone, email, subject, message, privacy } = body;

    // Validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Campi obbligatori mancanti" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Email non valida" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!privacy) {
      return new Response(
        JSON.stringify({ success: false, error: "Devi accettare la Privacy Policy" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Send email via Resend
    if (env.RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Contatto Sito Web <noreply@pescherialacquariomolinella.com>",
          to: ["pescherialacquario@outlook.it"],
          reply_to: email,
          subject: `[Sito Web] ${subject || "Nuovo messaggio"} - ${name}`,
          text: [
            `Nuovo messaggio dal sito web`,
            ``,
            `Nome: ${name}`,
            `Telefono: ${phone || "Non specificato"}`,
            `Email: ${email}`,
            `Oggetto: ${subject || "Non specificato"}`,
            ``,
            `Messaggio:`,
            message,
          ].join("\n"),
        }),
      });

      if (!emailResponse.ok) {
        console.error("Resend error:", await emailResponse.text());
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Messaggio inviato" }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Contact form error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Errore interno del server" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
