# 🚀 Quick Start Checklist

Complete these steps to get your Persona-Based AI Chatbot running locally.

## Step 1: Prerequisites (5 minutes)

- [ ] Install Node.js 18+ from https://nodejs.org
- [ ] Install Git from https://git-scm.com
- [ ] Get Gemini API key from Google AI Studio

## Step 2: Setup (2 minutes)

- [ ] `cp .env.example .env.local`
- [ ] Edit `.env.local` and paste your Gemini API key
- [ ] Verify `.env.local` is in your `.gitignore` (should be already)

## Step 3: Install & Run (3 minutes)

```bash
npm install
npm run dev
```

- [ ] Open http://localhost:3000
- [ ] Verify the chat interface loads

## Step 4: Test Features (5 minutes)

- [ ] Click on Anshuman tab → verify it highlights
- [ ] Click on Abhimanyu tab → verify chat clears
- [ ] Click on Kshitij tab → verify chat clears again
- [ ] Click a suggestion chip → verify message is sent
- [ ] Wait for response → verify typing indicator appears
- [ ] See response → verify it matches persona

## Step 5: Verify All Personas

**Anshuman (First-Principles Master)**

- [ ] Ask: "How do I solve the two-sum problem?"
- [ ] Expected: Socratic questions, no complete code

**Abhimanyu (System Architecture)**

- [ ] Ask: "Should I use SQL or NoSQL?"
- [ ] Expected: Architecture trade-offs, production focus

**Kshitij (Full-Stack Mentor)**

- [ ] Ask: "My app is slow on page load"
- [ ] Expected: Specific debugging steps, actionable advice

## Step 6: Mobile Test (2 minutes)

- [ ] Open DevTools (F12)
- [ ] Click mobile icon (Cmd+Shift+M)
- [ ] Resize to 375×667
- [ ] Verify layout looks good
- [ ] Try sending a message

## Step 7: Prepare for Deployment (5 minutes)

- [ ] Verify `.env.local` is NOT tracked by Git: `git status`
- [ ] Check `.gitignore` contains `.env.local`
- [ ] Run `npm run build` — should succeed with no errors
- [ ] Delete `.next` folder if build fails: `rm -r .next`
- [ ] Rebuild: `npm run build`

## Step 8: Deploy to Vercel (10 minutes)

- [ ] Push to GitHub: `git add . && git commit -m "Initial commit" && git push`
- [ ] Go to https://vercel.com
- [ ] Click "New Project" → Import Git Repo
- [ ] Select your repository
- [ ] Go to Settings → Environment Variables
- [ ] Add: `GOOGLE_API_KEY = your_actual_key`
- [ ] Click Deploy
- [ ] Wait 30-60 seconds
- [ ] Click "Visit" to see your live app
- [ ] Test all three personas in production

## Troubleshooting

**Q: "Cannot find module 'next'"**

- A: Run `npm install`

**Q: "Gemini API key not configured"**

- A: Check `.env.local` has `GOOGLE_API_KEY=your_key_here` (no quotes)

**Q: API returns "401 Unauthorized"**

- A: API key is wrong or expired. Get a new one from Google AI Studio

**Q: Typing indicator doesn't show**

- A: Clear browser cache or use Incognito mode

**Q: Vercel deployment fails**

- A: Check build logs. Usually missing `.env` variable

## What to Do Next

1. **Read the Docs**
   - Full setup: [README.md](README.md)
   - Development: [DEVELOPMENT.md](DEVELOPMENT.md)
   - Deployment: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
   - Prompts: [prompts.md](prompts.md)

2. **Customize**
   - Change colors in `tailwind.config.ts`
   - Edit system prompts in `app/api/chat/route.ts`
   - Add suggestion chips in `app/page.tsx`

3. **Share**
   - Send your live URL to friends
   - Get feedback on personas
   - Iterate on system prompts

4. **Submit**
   - Share GitHub repo link
   - Share live app URL
   - Include both in submission form

---

## Success Criteria

You'll know it's working when:

✅ All three personas appear in the UI
✅ Switching personas resets the conversation
✅ Suggestion chips send messages
✅ Typing indicator animates while waiting
✅ Each persona has distinct responses
✅ No console errors (F12 → Console tab)
✅ Mobile layout looks good
✅ Vercel deployment shows live URL

---

**Estimated Time:** ~30 minutes from start to live deployment

**Questions?** Check [README.md](README.md) or [DEVELOPMENT.md](DEVELOPMENT.md)
