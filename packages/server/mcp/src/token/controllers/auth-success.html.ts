export const authSuccessHtml = (currentPath?: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Successful</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .container {
      text-align: center;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 60px 40px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      max-width: 500px;
      width: 90%;
    }

    .success-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 30px;
      background: #4CAF50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: scaleIn 0.5s ease-out;
    }

    .success-icon::after {
      content: '✓';
      font-size: 40px;
      color: white;
      font-weight: bold;
    }

    h1 {
      font-size: 32px;
      margin-bottom: 20px;
      font-weight: 600;
      animation: fadeInUp 0.6s ease-out 0.2s both;
    }

    .message {
      font-size: 18px;
      margin-bottom: 30px;
      opacity: 0.9;
      line-height: 1.5;
      animation: fadeInUp 0.6s ease-out 0.4s both;
    }

    .footer {
      font-size: 14px;
      opacity: 0.7;
      animation: fadeInUp 0.6s ease-out 0.8s both;
    }

    @keyframes scaleIn {
      from {
        transform: scale(0);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes fadeInUp {
      from {
        transform: translateY(30px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon"></div>
    <h1>Authentication Successful!</h1>
    <p class="message">
      Your authentication has been completed successfully.<br>
      ${currentPath ? 'Opening file in Cursor...' : 'You can now return to Cursor to continue your work.'}
    </p>
    <p class="footer">You can close this tab manually</p>
  </div>

  <script>
    // Automatically open file in Cursor when page loads
    ${
      currentPath
        ? `
    // Wait a moment for the page to fully load, then open in Cursor
    setTimeout(() => {
      window.location.href = 'cursor://file/${currentPath}';
    }, 1000);
    `
        : ''
    }
  </script>
</body>
</html>
`;
