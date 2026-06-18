const getOTPEmailTemplate = (username, otp, actionName = "Verification") => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Your OTP Verification Code</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7f6;
                margin: 0;
                padding: 0;
                color: #333333;
            }
            .container {
                max-width: 600px;
                margin: 30px auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
                overflow: hidden;
                border: 1px solid #e1e8e6;
            }
            .header {
                background: linear-gradient(135deg, #4f46e5, #7c3aed);
                padding: 40px 20px;
                text-align: center;
                color: #ffffff;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
                letter-spacing: 0.5px;
            }
            .content {
                padding: 40px 30px;
                line-height: 1.6;
            }
            .greeting {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #1f2937;
            }
            .message {
                font-size: 16px;
                margin-bottom: 30px;
                color: #4b5563;
            }
            .otp-container {
                text-align: center;
                margin: 35px 0;
            }
            .otp-code {
                display: inline-block;
                background-color: #f3f4f6;
                color: #4f46e5;
                font-size: 36px;
                font-weight: 700;
                letter-spacing: 6px;
                padding: 15px 30px;
                border-radius: 8px;
                border: 2px dashed #4f46e5;
            }
            .expiry {
                font-size: 13px;
                color: #9ca3af;
                text-align: center;
                margin-top: 10px;
            }
            .footer {
                background-color: #f9fafb;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #9ca3af;
                border-top: 1px solid #f3f4f6;
            }
            .footer a {
                color: #4f46e5;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>OTP ${actionName}</h1>
            </div>
            <div class="content">
                <div class="greeting">Hello ${username},</div>
                <div class="message">
                    You requested an OTP (One-Time Password) for <strong>${actionName}</strong> on our platform. 
                    Please use the following verification code to complete the process:
                </div>
                <div class="otp-container">
                    <div class="otp-code">${otp}</div>
                    <div class="expiry">This code is valid for 5 minutes. Do not share this OTP with anyone.</div>
                </div>
                <div class="message">
                    If you did not make this request, you can safely ignore this email.
                </div>
            </div>
            <div class="footer">
                &copy; 2026 OTP Architecture DevHub. All rights reserved.<br>
                Need help? <a href="#">Contact Support</a>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { getOTPEmailTemplate };
