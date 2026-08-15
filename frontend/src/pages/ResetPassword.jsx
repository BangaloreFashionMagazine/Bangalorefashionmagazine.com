import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { API } from "@/lib/config";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  
  // Forgot password mode (no token)
  const [forgotMode, setForgotMode] = useState(!token);
  const [forgotEmail, setForgotEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  
  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setVerifying(false);
      setForgotMode(true);
    }
  }, [token]);
  
  const verifyToken = async () => {
    try {
      const res = await axios.get(`${API}/verify-reset-token/${token}`);
      setTokenValid(res.data.valid);
      setEmail(res.data.email || "");
    } catch (err) {
      setTokenValid(false);
    }
    setVerifying(false);
  };
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/forgot-password`, { email: forgotEmail });
      setEmailSent(true);
      toast({ title: "Reset link sent!", description: "Check your email for the reset link" });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.detail || "Failed to send reset link", variant: "destructive" });
    }
    setLoading(false);
  };
  
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/reset-password`, {
        token: token,
        new_password: newPassword
      });
      setResetComplete(true);
      toast({ title: "Password reset successfully!" });
    } catch (err) {
      toast({ title: "Reset failed", description: err.response?.data?.detail || "Failed to reset password", variant: "destructive" });
    }
    setLoading(false);
  };
  
  if (verifying) {
    return (
      <div className="min-h-screen bg-[#050A14] flex items-center justify-center">
        <div className="text-[#D4AF37]">Verifying reset link...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#050A14] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#0A1628] rounded-lg p-8 border border-[#D4AF37]/20">
          {/* Logo */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[#D4AF37]">BFM</h1>
            <p className="text-[#A0A5B0] text-sm">Bangalore Fashion Magazine</p>
          </div>
          
          {/* Forgot Password Mode */}
          {forgotMode && !emailSent && (
            <>
              <h2 className="text-xl font-bold text-[#F5F5F0] text-center mb-6">Forgot Password</h2>
              <p className="text-[#A0A5B0] text-sm text-center mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-[#A0A5B0] text-sm">Email Address</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A5B0]" size={18} />
                    <Input 
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10 bg-[#050A14] border-[#D4AF37]/30 text-[#F5F5F0]"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#D4AF37] text-[#050A14] hover:bg-[#F5D76E]"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              
              <div className="mt-6 text-center">
                <Link to="/login" className="text-[#D4AF37] text-sm hover:underline flex items-center justify-center gap-2">
                  <ArrowLeft size={16} /> Back to Login
                </Link>
              </div>
            </>
          )}
          
          {/* Email Sent Confirmation */}
          {forgotMode && emailSent && (
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="text-[#D4AF37]" size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#F5F5F0] mb-2">Check Your Email</h2>
              <p className="text-[#A0A5B0] text-sm mb-6">
                We've sent a password reset link to<br/>
                <span className="text-[#D4AF37]">{forgotEmail}</span>
              </p>
              <p className="text-[#A0A5B0] text-xs mb-6">
                The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
              <Button 
                onClick={() => { setEmailSent(false); setForgotEmail(""); }}
                variant="outline"
                className="border-[#D4AF37]/30 text-[#D4AF37]"
              >
                Send Another Link
              </Button>
            </div>
          )}
          
          {/* Invalid Token */}
          {token && !tokenValid && !forgotMode && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-red-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#F5F5F0] mb-2">Invalid or Expired Link</h2>
              <p className="text-[#A0A5B0] text-sm mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Button 
                onClick={() => setForgotMode(true)}
                className="bg-[#D4AF37] text-[#050A14] hover:bg-[#F5D76E]"
              >
                Request New Link
              </Button>
            </div>
          )}
          
          {/* Reset Password Form */}
          {token && tokenValid && !resetComplete && (
            <>
              <h2 className="text-xl font-bold text-[#F5F5F0] text-center mb-6">Reset Password</h2>
              <p className="text-[#A0A5B0] text-sm text-center mb-6">
                Enter a new password for <span className="text-[#D4AF37]">{email}</span>
              </p>
              
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-[#A0A5B0] text-sm">New Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A5B0]" size={18} />
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pl-10 pr-10 bg-[#050A14] border-[#D4AF37]/30 text-[#F5F5F0]"
                      required
                      minLength={8}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#A0A5B0]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="text-[#A0A5B0] text-sm">Confirm Password</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A0A5B0]" size={18} />
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pl-10 bg-[#050A14] border-[#D4AF37]/30 text-[#F5F5F0]"
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#D4AF37] text-[#050A14] hover:bg-[#F5D76E]"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            </>
          )}
          
          {/* Reset Complete */}
          {resetComplete && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="text-green-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#F5F5F0] mb-2">Password Reset Complete</h2>
              <p className="text-[#A0A5B0] text-sm mb-6">
                Your password has been successfully reset. You can now login with your new password.
              </p>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-[#D4AF37] text-[#050A14] hover:bg-[#F5D76E]"
              >
                Go to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
