1. **Optimize `skipVideoAds` in `src/ytAdBlock2.ts`:**
   - In the `skipVideoAds` function, currently there is a `if (!video) return;` check executed *before* we even know if an ad is showing (`adShowingElements.length > 0`) or if a skip button exists (`skipBtnElements[0]`).
   - This means that when there is no `<video>` element on the page, but an ad might be rendering its skip button outside the video tag (unlikely, but possible), we exit early.
   - More importantly, we do a property lookup `videoElements[0]` every 500ms even when no ads are showing.
   - We will refactor this to use a fast-path early return `if (adShowingElements.length === 0 && !skipBtnElements[0]) return;`. This avoids property lookups and property assignments (`Number.isFinite(video.duration)`) for the 99% case where no ads are actively rendering on screen.
2. **Review Changes:** Check if `ytAdBlock2.test.ts` passes.
3. **Run Lint and Build Commands:** `pnpm test`, `pnpm build`, `pnpm lint`.
4. **Pre-commit Checks:** Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
5. **Submit PR:** Create a PR with title `⚡ Bolt: [Performance] Add fast-path early return to avoid redundant DOM checks in YouTube ad skipper`
