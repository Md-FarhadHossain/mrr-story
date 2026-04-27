"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setError("");
    try {
      const res = await signIn.social({ provider: "google", callbackURL: "/dashboard" });
      console.log("signIn res:", res);
      if (res.error) {
        setError(res.error.message || "Failed to sign in with Google.");
        setIsGoogleLoading(false);
      }
    } catch (e: any) {
      console.error("signIn error:", e);
      setError(e.message || "Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .auth-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', sans-serif;
          background: #0a0a0f;
          position: relative;
          overflow: hidden;
        }
        /* big purple radial glow — the hero effect */
        .auth-container::before {
          content: '';
          position: absolute;
          top: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 900px;
          height: 700px;
          background: radial-gradient(ellipse at center, rgba(109, 40, 217, 0.55) 0%, rgba(76, 29, 149, 0.25) 40%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        /* subtle bottom glow */
        .auth-container::after {
          content: '';
          position: absolute;
          bottom: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 400px;
          background: radial-gradient(ellipse at center, rgba(59, 53, 195, 0.18) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(18, 18, 28, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 40px;
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }
        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 32px;
        }
        .auth-logo-icon {
          width: 32px;
          height: 32px;
          background: #6d28d9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.9rem;
          color: #fff;
          box-shadow: 0 0 16px rgba(109, 40, 217, 0.6);
        }
        .auth-logo-text {
          font-weight: 800;
          font-size: 1.2rem;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .auth-title {
          font-size: 1.5rem;
          font-weight: 800;
          color: #fff;
          margin-bottom: 8px;
          text-align: center;
          letter-spacing: -0.4px;
        }
        .auth-subtitle {
          color: rgba(255,255,255,0.5);
          font-size: 0.95rem;
          text-align: center;
          margin-bottom: 28px;
        }
        .auth-btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 13px 20px;
          border-radius: 10px;
          background: rgba(255,255,255,0.07);
          color: #fff;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          border: 1.5px solid rgba(255,255,255,0.12);
          transition: border-color 0.2s, background 0.2s, transform 0.1s;
        }
        .auth-btn-google:hover:not(:disabled) {
          background: rgba(255,255,255,0.11);
          border-color: rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }
        .auth-error {
          margin-bottom: 20px;
          padding: 12px 16px;
          background: rgba(239,68,68,0.12);
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          color: #fca5a5;
          font-size: 0.875rem;
          display: flex;
          gap: 8px;
          align-items: flex-start;
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-card">
          <Link href="/" className="auth-logo">
            <div className="auth-logo-icon">M</div>
            <span className="auth-logo-text" style={{color:'#fff'}}>MRR Story</span>
          </Link>

          <h1 className="auth-title">Admin Portal</h1>
          <p className="auth-subtitle">Restricted Access</p>

          {error && (
            <div className="auth-error">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="auth-btn-google"
          >
            {isGoogleLoading ? (
              <Loader2 style={{ width:'18px', height:'18px', animation:'spin 1s linear infinite' }} />
            ) : (
              <>
                <svg style={{ width:'20px', height:'20px' }} viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <Link href="/" style={{color:'rgba(255,255,255,0.3)', fontSize:'0.75rem', textDecoration:'none', display:'block', marginTop:'24px', textAlign: 'center'}}>← Back to home</Link>
        </div>
      </div>
    </>
  );
}
