export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  try {
    const body = await request.json();
    const { name, phone, email, date, time, type, notes, callback, privacy } = body;

    // Validation
    if (!name || !phone || !date || !time || !type) {
      return new Response(
        JSON.stringify({ success: false, error: "Campi obbligatori mancanti" }),
        { status: 400, headers: corsHeaders }
      );
    }

    if (!privacy) {
      return new Response(
        JSON.stringify({ success: false, error: "Devi accettare la Privacy Policy" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate date is not Sunday (0) or Monday (1)
    const selectedDate = new Date(date + "T00:00:00");
    const dayOfWeek = selectedDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 1) {
      return new Response(
        JSON.stringify({ success: false, error: "Siamo chiusi la domenica e il lunedi" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Save to D1
    if (env.DB) {
      await env.DB.prepare(
        `INSERT INTO bookings (name, phone, email, date, time, type, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(name, phone, email || "", date, time, type, notes || "", new Date().toISOString())
        .run();
    }

    // Send email notification via Resend
    if (env.RESEND_API_KEY) {
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Prenotazione Sito Web <noreply@pescherialacquariomolinella.com>",
          to: ["pescherialacquario@outlook.it"],
          reply_to: email || undefined,
          subject: `[Prenotazione] ${type} - ${name} - ${date} ore ${time}`,
          text: [
            `Nuova prenotazione dal sito web`,
            ``,
            `Nome: ${name}`,
            `Telefono: ${phone}`,
            `Email: ${email || "Non specificata"}`,
            `Data ritiro: ${date}`,
            `Ora ritiro: ${time}`,
            `Tipo ordine: ${type}`,
            `Note: ${notes || "Nessuna"}`,
            ``,
            `Ricontattare per conferma: ${callback ? "Si" : "No"}`,
          ].join("\n"),
        }),
      });

      if (!emailResponse.ok) {
        console.error("Resend error:", await emailResponse.text());
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Prenotazione ricevuta" }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("Booking form error:", err);
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
