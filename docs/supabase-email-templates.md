# Supabase Email Templates — SSSGC Houston

All email templates are configured in **Supabase Dashboard → Authentication → Email Templates**.

To change the sender name from "Supabase Auth", set up Custom SMTP under **Settings → Authentication → SMTP Settings**.

---

## 1. Confirm Signup

**Subject:**
```
Welcome to SSSGC Houston — Confirm Your Email
```

**Body (HTML):**
```html
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FDF8F0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #6B1D2A; font-size: 22px; margin: 0;">Sri Sathya Sai Center</h2>
    <p style="color: #7A6B5F; font-size: 13px; margin: 4px 0 0;">Greater Houston</p>
  </div>

  <div style="background: #ffffff; border-radius: 12px; padding: 28px 24px; border: 1px solid rgba(107,29,42,0.08);">
    <h3 style="color: #2C1810; font-size: 18px; margin: 0 0 12px;">Sai Ram! Welcome 🙏</h3>
    <p style="color: #7A6B5F; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      Thank you for joining the SSSGC Houston community. Please confirm your email address to activate your account.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="{{ .ConfirmationURL }}" target="_blank"
         style="display: inline-block; background: #6B1D2A; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
        Confirm My Email
      </a>
    </div>

    <p style="color: #A89888; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
      If you didn't create an account with SSSGC Houston, you can safely ignore this email.
    </p>
  </div>

  <p style="text-align: center; color: #A89888; font-size: 11px; margin-top: 20px;">
    Sai Ram — SSSGC Houston &middot; sssgc-houston-ui.vercel.app
  </p>
</div>
```

---

## 2. Reset Password

**Subject:**
```
Reset Your SSSGC Houston Password
```

**Body (HTML):**
```html
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FDF8F0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #6B1D2A; font-size: 22px; margin: 0;">Sri Sathya Sai Center</h2>
    <p style="color: #7A6B5F; font-size: 13px; margin: 4px 0 0;">Greater Houston</p>
  </div>

  <div style="background: #ffffff; border-radius: 12px; padding: 28px 24px; border: 1px solid rgba(107,29,42,0.08);">
    <h3 style="color: #2C1810; font-size: 18px; margin: 0 0 12px;">Reset Your Password</h3>
    <p style="color: #7A6B5F; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      We received a request to reset your password. Click the button below to set a new one.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="{{ .ConfirmationURL }}" target="_blank"
         style="display: inline-block; background: #6B1D2A; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
        Reset Password
      </a>
    </div>

    <p style="color: #A89888; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
      If you didn't request this, you can safely ignore this email. This link will expire in 24 hours.
    </p>
  </div>

  <p style="text-align: center; color: #A89888; font-size: 11px; margin-top: 20px;">
    Sai Ram — SSSGC Houston &middot; sssgc-houston-ui.vercel.app
  </p>
</div>
```

---

## 3. Magic Link

**Subject:**
```
Your SSSGC Houston Sign In Link
```

**Body (HTML):**
```html
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FDF8F0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #6B1D2A; font-size: 22px; margin: 0;">Sri Sathya Sai Center</h2>
    <p style="color: #7A6B5F; font-size: 13px; margin: 4px 0 0;">Greater Houston</p>
  </div>

  <div style="background: #ffffff; border-radius: 12px; padding: 28px 24px; border: 1px solid rgba(107,29,42,0.08);">
    <h3 style="color: #2C1810; font-size: 18px; margin: 0 0 12px;">Sign In to SSSGC Houston</h3>
    <p style="color: #7A6B5F; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      Click the button below to sign in to your account. This link is valid for a single use.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="{{ .ConfirmationURL }}" target="_blank"
         style="display: inline-block; background: #6B1D2A; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
        Sign In
      </a>
    </div>

    <p style="color: #A89888; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
      If you didn't request this link, you can safely ignore this email.
    </p>
  </div>

  <p style="text-align: center; color: #A89888; font-size: 11px; margin-top: 20px;">
    Sai Ram — SSSGC Houston &middot; sssgc-houston-ui.vercel.app
  </p>
</div>
```

---

## 4. Change Email

**Subject:**
```
SSSGC Houston — Confirm Email Change
```

**Body (HTML):**
```html
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FDF8F0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #6B1D2A; font-size: 22px; margin: 0;">Sri Sathya Sai Center</h2>
    <p style="color: #7A6B5F; font-size: 13px; margin: 4px 0 0;">Greater Houston</p>
  </div>

  <div style="background: #ffffff; border-radius: 12px; padding: 28px 24px; border: 1px solid rgba(107,29,42,0.08);">
    <h3 style="color: #2C1810; font-size: 18px; margin: 0 0 12px;">Confirm Email Change</h3>
    <p style="color: #7A6B5F; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      You requested to change your email address. Click below to confirm this change.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="{{ .ConfirmationURL }}" target="_blank"
         style="display: inline-block; background: #6B1D2A; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
        Confirm Email Change
      </a>
    </div>

    <p style="color: #A89888; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
      If you didn't request this change, please secure your account by changing your password immediately.
    </p>
  </div>

  <p style="text-align: center; color: #A89888; font-size: 11px; margin-top: 20px;">
    Sai Ram — SSSGC Houston &middot; sssgc-houston-ui.vercel.app
  </p>
</div>
```

---

## 5. Reauthentication

**Subject:**
```
SSSGC Houston — Confirm Your Identity
```

**Body (HTML):**
```html
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FDF8F0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #6B1D2A; font-size: 22px; margin: 0;">Sri Sathya Sai Center</h2>
    <p style="color: #7A6B5F; font-size: 13px; margin: 4px 0 0;">Greater Houston</p>
  </div>

  <div style="background: #ffffff; border-radius: 12px; padding: 28px 24px; border: 1px solid rgba(107,29,42,0.08);">
    <h3 style="color: #2C1810; font-size: 18px; margin: 0 0 12px;">Confirm Your Identity</h3>
    <p style="color: #7A6B5F; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      To complete this action, please verify your identity using the confirmation code below.
    </p>

    <div style="text-align: center; margin: 24px 0; padding: 16px; background: #FDF8F0; border-radius: 10px;">
      <p style="color: #7A6B5F; font-size: 13px; margin: 0 0 8px;">Your verification code</p>
      <p style="color: #6B1D2A; font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 0;">{{ .Token }}</p>
    </div>

    <p style="color: #A89888; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
      If you didn't initiate this request, please secure your account by changing your password immediately.
    </p>
  </div>

  <p style="text-align: center; color: #A89888; font-size: 11px; margin-top: 20px;">
    Sai Ram — SSSGC Houston &middot; sssgc-houston-ui.vercel.app
  </p>
</div>
```

---

## 6. Invite User

**Subject:**
```
You're Invited to Join a Family on SSSGC Houston
```

**Body (HTML):**
```html
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background: #FDF8F0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #6B1D2A; font-size: 22px; margin: 0;">Sri Sathya Sai Center</h2>
    <p style="color: #7A6B5F; font-size: 13px; margin: 4px 0 0;">Greater Houston</p>
  </div>

  <div style="background: #ffffff; border-radius: 12px; padding: 28px 24px; border: 1px solid rgba(107,29,42,0.08);">
    <h3 style="color: #2C1810; font-size: 18px; margin: 0 0 12px;">You've Been Invited! 🙏</h3>
    <p style="color: #7A6B5F; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
      A member of SSSGC Houston has invited you to join their family on our community platform. Click below to accept the invitation and create your account.
    </p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="{{ .ConfirmationURL }}" target="_blank"
         style="display: inline-block; background: #6B1D2A; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-size: 15px; font-weight: 600;">
        Accept Invitation
      </a>
    </div>

    <p style="color: #A89888; font-size: 13px; line-height: 1.5; margin: 20px 0 0;">
      If you weren't expecting this invitation, you can safely ignore this email.
    </p>
  </div>

  <p style="text-align: center; color: #A89888; font-size: 11px; margin-top: 20px;">
    Sai Ram — SSSGC Houston &middot; sssgc-houston-ui.vercel.app
  </p>
</div>
```

---

## Brand Colors Reference

| Color     | Hex       | Usage                          |
|-----------|-----------|--------------------------------|
| Maroon    | `#6B1D2A` | Buttons, headings, invite code |
| Saffron   | `#E8860C` | Accent, SSE badges             |
| Dark text | `#2C1810` | Body headings                  |
| Mid text  | `#7A6B5F` | Body paragraphs                |
| Light text| `#A89888` | Disclaimers, footers           |
| Cream BG  | `#FDF8F0` | Outer background, code box     |
| White     | `#FFFFFF` | Card background                |

## Template Variables (Supabase)

| Variable              | Used In                              |
|-----------------------|--------------------------------------|
| `{{ .ConfirmationURL }}` | Confirm Signup, Reset Password, Magic Link, Change Email, Invite User |
| `{{ .Token }}`           | Reauthentication (OTP code)          |

## Custom SMTP (Optional)

To change the sender from "Supabase Auth" to "SSSGC Houston":

1. Go to **Supabase Dashboard → Settings → Authentication → SMTP Settings**
2. Enable **Custom SMTP**
3. Configure with your email provider (Gmail, SendGrid, Resend, etc.)
4. Set sender name to `SSSGC Houston` and sender email to your preferred address
