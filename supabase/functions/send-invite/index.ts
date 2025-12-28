import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, groupName, inviterName, bannerUrl = 'https://prowess-two.vercel.app/assets/ringcircles.png' } = await req.json()

        const supabaseAdmin = createClient(
            SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!
        )

        // Determine the redirect URL based on the requester (default to production)
        let redirectTo = 'https://prowess-two.vercel.app/';
        const origin = req.headers.get('origin');
        if (origin && origin.includes('localhost')) {
            redirectTo = origin;
        }

        // 1. Generate the invite link using Supabase Auth (without sending an email)
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: { redirectTo }
        })
        if (inviteError) throw inviteError

        const inviteLink = inviteData.properties.action_link

        // 2. Prepare the dynamic data
        const inviterInitials = inviterName.split(' ').map((n: string) => n[0]).join('').toLowerCase()
        const currentTime = new Date().toLocaleTimeString('en-US', {
            weekday: 'short',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).toUpperCase()

        // 3. The HTML Template (Your design)
        let html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="und" dir="auto" xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>SPLITTR Invite</title>
    <style type="text/css">
        @font-face { font-family: 'Palatino'; src: url('https://prowess-two.vercel.app/assets/Palatino.ttf') format('truetype'); font-weight: normal; }
        @font-face { font-family: 'Optician Sans'; src: url('https://prowess-two.vercel.app/assets/Optician-Sans.otf') format('opentype'); font-weight: normal; }
        @font-face { font-family: 'Instrument Serif'; src: url('https://prowess-two.vercel.app/assets/InstrumentSerif-Italic.ttf') format('truetype'); font-weight: normal; }
        body { margin: 0; padding: 0; background-color: #000000; color: #D6CFBF; }
        .main-table { background-color: #000000; width: 600px; margin: 0 auto; border-spacing: 0; font-family: 'Optician Sans', Arial, sans-serif; }
        .hero-section { background-color: #000000; height: 394px; width: 600px; }
        .label-text { font-size: 16px; letter-spacing: 2.24px; color: #d6cfbf; text-transform: lowercase; }
        .headline { font-family: 'Instrument Serif', Georgia, serif; font-style: italic; font-size: 40px; color: #d6cfbf; font-weight: normal; margin: 0; line-height: 1.1; }
        .avatar { background-color: #191616; border: 1px solid rgba(214, 207, 191, 0.15); border-radius: 50%; width: 44px; height: 44px; text-align: center; color: #d6cfbf; font-size: 18px; }
        .group-underline { background-color: #cc342c; height: 2px; width: 138px; margin: 0 auto; }
        .body-text { font-family: 'Palatino', Georgia, serif; font-size: 16px; color: #9a9287; line-height: 1.5; max-width: 281px; margin: 0 auto; text-align: center; }
        .join-button { background-color: #cc342c; color: #ffffff !important; text-decoration: none; padding: 14px 0; display: block; width: 330px; text-align: center; letter-spacing: 2.56px; text-transform: uppercase; font-size: 15px; }
        .footer-text { color: #3b3b35; font-size: 16px; letter-spacing: 2.24px; text-transform: lowercase; }
    </style>
</head>
<body style="margin:0;padding:0;background-color:#000000;">
    <center style="width:100%;table-layout:fixed;background-color:#000000;">
        <table class="main-table" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td class="hero-section" valign="top" style="background: url('${bannerUrl}') 50% / 100% no-repeat; height: 394px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 20px 20px;">
                        <tr>
                            <td align="left" class="label-text">splittr</td>
                            <td align="right" class="label-text">${currentTime}</td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td align="center" style="padding: 40px 0 0 0;">
                    <h1 class="headline">You have been</h1>
                    <table cellpadding="0" cellspacing="0" border="0" style="padding: 10px 0;">
                        <tr>
                            <td class="headline" style="padding-right: 15px;">invited by</td>
                            <td class="avatar" valign="middle">${inviterInitials}</td>
                            <td class="headline" style="padding-left: 15px;">${inviterName} to</td>
                        </tr>
                    </table>
                    <h1 class="headline" style="padding-bottom: 20px;">join the group</h1>
                    <table cellpadding="0" cellspacing="0" border="0" align="center">
                        <tr><td class="headline" style="font-size: 32px; font-family: 'Palatino', serif; font-style: normal; padding-bottom: 5px;">${groupName}</td></tr>
                        <tr><td class="group-underline"></td></tr>
                    </table>
                    <p class="body-text" style="padding: 30px 0;">Your teammate has invited you to manage shared expenses on PROWESS Splitter.</p>
                    <table align="center" cellpadding="0" cellspacing="0" border="0">
                        <tr><td><a href="${inviteLink}" class="join-button">join</a></td></tr>
                    </table>
                </td>
            </tr>
            <tr>
                <td style="padding: 80px 20px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td align="left" class="footer-text">new invite</td>
                            <td align="right" class="footer-text">from ${inviterName}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>`

        // 4. Send the email via Resend
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'PROWESS Splitter <app@prowess.art>',
                to: [email],
                subject: `You've been invited to ${groupName}`,
                html: html,
            }),
        })

        const resData = await res.json()

        return new Response(JSON.stringify(resData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
