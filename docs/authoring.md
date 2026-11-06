# Private authoring workflow

`ajmeese7/meese.rs` owns the site code, styles, dependencies, and published
content. `ajmeese7/meese-rs-authoring` keeps a private copy of that code plus
unpublished drafts. Its GitHub Codespace runs the visual editor.

Public site changes do not automatically reach the private repo. Merge public
`master` into private `master` when you want updated presentation, editor code,
or dependencies. Publishing goes the other direction through the editor's
**Prepare public PR** action, which copies the selected post and its referenced
images into a PR against the public repo.

## Update the authoring repo

Run these commands in the **authoring Codespace terminal**, from the
`meese-rs-authoring` repository directory. This updates the running workspace as
well as the private GitHub repo.

1. Finish editing, click **Sync now**, and wait for **Private: synced**. Close
   the editor tab so autosave does not create commits during the merge.
2. Check the checkout and remotes:

   ```bash
   git status --short --branch
   git remote -v
   ```

   Commit any remaining work before continuing. `origin` must point to
   `ajmeese7/meese-rs-authoring`; `public` must point to `ajmeese7/meese.rs`.
   If `public` is missing, add it once:

   ```bash
   git remote add public https://github.com/ajmeese7/meese.rs.git
   ```

3. Update private `master`, then merge the public changes:

   ```bash
   git switch master
   git pull --ff-only origin master
   git fetch public
   git merge public/master
   ```

   This preserves private draft commits while bringing in public changes. If
   Git reports conflicts, resolve them and commit the merge before continuing.
   To cancel an unfinished merge, use `git merge --abort`.

4. Install the dependencies recorded in the updated lockfile, check types, and
   save the merged branch to the private repo:

   ```bash
   pnpm install --frozen-lockfile
   pnpm check
   git push origin master
   ```

   If installation or type checking fails, fix the reported issue before
   pushing. Push this branch to private `origin`; it contains private drafts.

5. Stop the Codespace using its GitHub menu, then reopen it. The startup hook
   starts the editor with the updated code and dependencies. If the update
   changes `.devcontainer/devcontainer.json`, rebuild the container instead.
   Open the editor using the instructions below.

You can also merge and push from a local clone of `meese-rs-authoring`. After
doing so, the Codespace still needs `git pull --ff-only origin master`,
`pnpm install --frozen-lockfile`, and a restart to use those changes. A local
clone does not enable the Codespace-only private sync and publication actions.

## Open the editor

The startup hook runs `.devcontainer/start-editor.sh`. It starts Astro in the
background, binds to all interfaces, forwards port **4321**, and writes server
output to `/tmp/meese-editor.log`.

In the **Codespace terminal**, find the editor path:

```bash
grep 'meese-editor.*open' /tmp/meese-editor.log
```

Then:

1. Open the **Ports** tab in VS Code.
2. Keep port **4321** visibility **Private** and open its forwarded URL.
3. Append the complete `/editor?key=…` path printed in the log to that URL.

The forwarded root `/` serves the normal blog. The visual editor lives at
`/editor` and is available only from the development server. A production
build or `pnpm preview` does not include it.

The keyed URL establishes a browser session and redirects to `/editor`. You
can reopen `/editor` in that browser while its session remains valid. To open
it on another device, sign into GitHub and use the keyed forwarded URL there.

### Recover the editor link

If the editor line is missing from the log, retrieve the saved key:

```bash
cat /workspaces/.meese-editor/key
```

Visit `<forwarded-port-url>/editor?key=<saved-key>`. Treat that URL and key as
private credentials. The startup script reuses the saved key across restarts.

If the server is not running, start it from the repository directory:

```bash
bash .devcontainer/start-editor.sh
tail -n 60 /tmp/meese-editor.log
```

Wait for Astro's ready message, then retrieve the editor path again. The script
does not restart an existing server; use the Codespace stop/reopen procedure
above after dependency updates. If `/editor` loads the site header but no
editor controls, try a hard refresh to reload its scripts and inspect browser
console errors if it persists.
