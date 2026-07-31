"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createSupportTicket",
          payload: {
            customer: name.trim(),
            email: email.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim()
          }
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setError(data.error || "Failed to submit message. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to submit message due to a connection issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col justify-center animate-fade-in">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Contact Support
        </h1>
        <p className="mt-3 text-sm text-brand-text-muted">
          Have questions about digital gift cards or payments? Send us a message, and our customer support team will reply within 24 hours.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Support Channels */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-brand-border/40 bg-brand-card/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-purple/10 border border-brand-purple/20 text-brand-purple shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Email Support</h4>
                <p className="text-[11px] text-brand-text-muted mt-1 truncate">support@solcart.io</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-brand-border/40 bg-brand-card/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-green/10 border border-brand-green/20 text-brand-green shrink-0">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Help Ticket</h4>
                <p className="text-[11px] text-brand-text-muted mt-1 leading-relaxed">Submit details here to track active inquiries.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-2xl border border-brand-border/40 bg-brand-card/20 shadow-xl">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex p-3 rounded-full bg-green-500/10 border border-green-500/20 text-brand-green mb-2">
                <CheckCircle className="h-10 w-10 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-white">Feedback Submitted Successfully!</h3>
              <p className="text-xs text-brand-text-muted max-w-sm mx-auto">
                Thank you for reaching out! A customer support representative has received your ticket and will follow up with you shortly.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-5 py-2.5 text-xs font-bold bg-brand-purple hover:bg-brand-purple/95 rounded-lg text-white mt-4 cursor-pointer"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-10 px-3.5 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3.5 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="General Inquiry / Bulk purchase / Order query"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full h-10 px-3.5 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-brand-text-muted uppercase tracking-wider mb-1.5">Message / Feedback</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your query here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 bg-brand-dark/40 border border-brand-border rounded-lg text-xs text-white placeholder-brand-text-muted/40 focus:outline-none focus:border-brand-purple/40 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-brand-purple hover:bg-brand-purple/95 disabled:bg-brand-purple/50 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/10 hover:shadow-brand-purple/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
