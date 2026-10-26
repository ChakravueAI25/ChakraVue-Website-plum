# Publishing the preview to preview.chakravue.ai

The preview runs on the E2E trials server (`chakravue-trials`, 151.185.43.178), next to the
trial platform. The server's nginx serves it as plain files behind one team password, with a free
Let's Encrypt certificate, the same way it already serves the `try.chakravue.co.in` sites. It does
not touch the trials, the live chakravue.ai site or anything else on the server.

## One-time setup (you)

1. **DNS (Cloudflare, chakravue.ai zone)**: add a record
   - Type `A`, Name `preview`, IPv4 `151.185.43.178`
   - Proxy status: **DNS only** (grey cloud), so the server can get its own certificate.

2. **Team password (on the server, typed by you; it is never stored on this PC or sent to Claude)**:

   ```
   ssh chakravue-trials
   printf 'team:%s\n' "$(openssl passwd -apr1)" | tee /etc/nginx/chakravue-preview.htpasswd >/dev/null
   ```

   `openssl` asks for the password twice. Your team signs in with user `team` and that password.
   To add a person with their own login, run the same line with their name and `tee -a`.

## Publish (and every update after)

From Git Bash on this PC:

```
cd blueprint-site
ACME_EMAIL=you@example.com ./deploy/deploy.sh   # address for certificate notices
```

It builds the site, checks the DNS record and the password file, uploads the files, gets the
certificate the first time, checks the nginx configuration and reloads it. A re-run replaces the
site in one step (the previous copy is kept as `/var/www/chakravue-preview.old`).

## Remove it later

```
ssh chakravue-trials 'rm /etc/nginx/sites-enabled/chakravue-preview && nginx -t && systemctl reload nginx'
```
