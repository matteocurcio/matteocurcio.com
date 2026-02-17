---
title: "WD EX2 Ultra to QNAP: Plex Migration"
date: "2026-01-10"
excerpt: "A field report from a failed “quick” NAS migration that became a reliability exercise in automation, recovery strategy, and not trusting optimistic transfer assumptions."
cover: "https://matteocurcio.com/wp-content/uploads/4477FA15-10DB-4934-AF3C-D0AD0F7B9684.png"
coverAlt: "From WD EX2 Ultra to QNAP: migrating a PLEX media library the hard way (and surviving it)"
tags: []
draft: false
originalUrl: "https://matteocurcio.com/from-wd-ex2-ultra-to-qnap-migrating-a-plex-media-library-the-hard-way-and-surviving-it"
---

<p>At some point every home-lab setup reaches a tipping point. Mine arrived quietly, disguised as a perfectly reasonable idea: <em>“I’ll just move my media library from my old WD EX2 Ultra to a new QNAP NAS.”</em></p>



<p>What followed was a week-long lesson in how optimistic assumptions meet aging hardware, watchdog timers, and very large video files.</p>



<figure class="wp-block-image size-full is-style-default"><img width="1536" height="1024" src="https://matteocurcio.com/wp-content/uploads/4477FA15-10DB-4934-AF3C-D0AD0F7B9684.png" alt="" srcset="https://matteocurcio.com/wp-content/uploads/4477FA15-10DB-4934-AF3C-D0AD0F7B9684.png 1536w, https://matteocurcio.com/wp-content/uploads/4477FA15-10DB-4934-AF3C-D0AD0F7B9684-768x512.png 768w" sizes="auto, (max-width: 1536px) 100vw, 1536px" /></figure>



<p>This post is about how I eventually got the migration done, why the <strong>WD EX2 Ultra kept rebooting itself under load</strong>, and how I ended up writing a <strong>self-healing rsync script</strong> that patiently waits, detects stalls, survives crashes, and resumes transfers without human babysitting.<br><br>If you’ve ever watched a copy job crawl along at 3 a.m. wondering whether it’s <em>stuck</em> or just <em>thinking</em>, this is for you.</p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h2 class="wp-block-heading"><strong>The setup</strong></h2>



<h3 class="wp-block-heading"><strong>The old world</strong></h3>



<ul class="wp-block-list">
<li><strong>WD My Cloud EX2 Ultra</strong></li>



<li>Years of accumulated media</li>



<li>Thousands of files, many of them large video containers</li>



<li>ARM CPU, limited RAM, consumer firmware</li>
</ul>



<p>The EX2 Ultra is fine for <em>serving</em> media. It is <strong>not fine</strong> for sustained, high-pressure I/O over SSH.</p>



<h3 class="wp-block-heading"><strong>The new world</strong></h3>



<ul class="wp-block-list">
<li><strong>QNAP NAS</strong></li>



<li>Clean filesystem</li>



<li>Faster disks</li>



<li>Proper headroom</li>



<li>In its own NAS VLan, behind a OPNSense Firewall</li>



<li>Mounted inside a <strong>custom-built 10-inch rack</strong>, because if I’m rebuilding, I’m rebuilding properly</li>
</ul>



<p>The goal was simple: move the entire PLEX library across, intact, with permissions preserved where they matter and ignored where they don’t.</p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h2 class="wp-block-heading"><strong>The problem: rsync meets reality</strong></h2>



<p>The first attempt was textbook:</p>



<pre class="wp-block-code"><code>rsync -av sshd@wd:/media /qnap/media</code></pre>



<p>It worked. Then it didn’t.</p>



<p>After a few tens of gigabytes, the WD would:</p>



<ul class="wp-block-list">
<li>drop the SSH connection</li>



<li>reboot itself</li>



<li>announce a filesystem check</li>



<li>politely pretend nothing had happened</li>
</ul>



<p>This wasn’t corruption. It was <strong>resource exhaustion</strong>.</p>



<p>The EX2 Ultra simply cannot handle:</p>



<ul class="wp-block-list">
<li>large directory walks</li>



<li>sustained SSH encryption</li>



<li>aggressive writeback</li>



<li>and big files all at once.</li>
</ul>



<p>So the question stopped being <em>“How do I copy faster?”</em> and became:</p>



<blockquote class="wp-block-quote is-layout-flow wp-block-quote-is-layout-flow">
<p><strong>How do I copy safely, unattended, and indefinitely, even if the source crashes?</strong></p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>
</blockquote>



<h2 class="wp-block-heading"><strong>The strategy: let it fail, but never lose progress</strong></h2>



<p>The key ideas behind the final solution were:</p>



<ol start="1" class="wp-block-list">
<li><strong>Never assume the WD stays alive</strong></li>



<li><strong>Never restart from zero</strong></li>



<li><strong>Never guess whether the process is “stuck”</strong></li>



<li><strong>Never require human intervention at 2 a.m.</strong></li>
</ol>



<p>That led to a few design decisions:</p>



<ul class="wp-block-list">
<li>Use rsync with --partial so interrupted files can resume</li>



<li>Limit bandwidth to reduce pressure</li>



<li>Run rsync in the background</li>



<li>Monitor progress via a log file, not terminal output</li>



<li>Detect stalls and report them</li>



<li>Detect WD availability (ping + SSH)</li>



<li>Retry automatically when the WD comes back</li>
</ul>



<p>The result is the script below.</p>



<pre class="wp-block-code"><code>#!/bin/sh

# ---- CONFIG ----
SRC="<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="394a4a515d7908091709170f09170b09">[email&#160;protected]</a>:/mnt/HD/HD_a2/PLEX/"
DST="/share/PLEX/"
WD_HOST="10.0.60.20"

PING_INTERVAL=30
SSH_TIMEOUT=5
HEARTBEAT_INTERVAL=30        # how often we print status
STALL_WARNING=120            # seconds without log updates before warning

DEFAULT_BWLIMIT=25000        # KB/s
LOGFILE="/share/PLEX/rsync.log"
# -----------------

# Bandwidth argument
if &#91; -n "$1" ]; then
    BWLIMIT="$1"
else
    BWLIMIT="$DEFAULT_BWLIMIT"
fi

echo "&#91;$(date)] Using rsync bandwidth limit: ${BWLIMIT} KB/s"

while true; do
    echo "&#91;$(date)] Starting rsync..."

    touch "$LOGFILE"

    rsync -av \
      --progress \
      --partial \
      --partial-dir=.rsync-partial \
      --whole-file \
      --numeric-ids \
      --no-perms --no-owner --no-group \
      --size-only \
      --timeout=600 \
      --bwlimit="$BWLIMIT" \
      --exclude='.*' \
      --exclude='rsync.log' \
      --log-file="$LOGFILE" \
      -e "ssh -o ServerAliveInterval=30 -o ServerAliveCountMax=10" \
      "$SRC" "$DST" &amp;

    RSYNC_PID=$!
    echo "&#91;$(date)] rsync started with PID $RSYNC_PID"

    while kill -0 "$RSYNC_PID" 2>/dev/null; do
        sleep "$HEARTBEAT_INTERVAL"

        NOW=$(date +%s)
        LAST_LOG=$(stat -c %Y "$LOGFILE" 2>/dev/null || echo 0)
        DELTA=$((NOW - LAST_LOG))

        if &#91; "$DELTA" -lt "$STALL_WARNING" ]; then
            echo "&#91;$(date)] rsync running, last progress ${DELTA}s ago"
        else
            echo "&#91;$(date)] rsync quiet for ${DELTA}s – likely WD I/O stall"

            if ping -c 1 -W 1 "$WD_HOST" >/dev/null 2>&amp;1; then
                if ssh -o BatchMode=yes -o ConnectTimeout=$SSH_TIMEOUT \
                       sshd@"$WD_HOST" "true" >/dev/null 2>&amp;1; then
                    echo "&#91;$(date)] WD reachable via SSH, continuing to wait"
                else
                    echo "&#91;$(date)] WD pingable but SSH not ready yet"
                fi
            else
                echo "&#91;$(date)] WD not responding to ping"
            fi
        fi
    done

    wait "$RSYNC_PID"
    RC=$?

    if &#91; "$RC" -eq 0 ]; then
        echo "&#91;$(date)] rsync completed successfully."
        break
    fi

    echo "&#91;$(date)] rsync exited with code $RC."
    echo "&#91;$(date)] Waiting for WD to be fully ready before retry..."

    while true; do
        if ping -c 1 -W 1 "$WD_HOST" >/dev/null 2>&amp;1; then
            if ssh -o BatchMode=yes -o ConnectTimeout=$SSH_TIMEOUT \
                   sshd@"$WD_HOST" "test -d /mnt/HD/HD_a2/PLEX" >/dev/null 2>&amp;1; then
                echo "&#91;$(date)] WD fully ready. Resuming rsync."
                break
            fi
        fi

        echo "&#91;$(date)] WD not ready yet. Rechecking in ${PING_INTERVAL}s..."
        sleep "$PING_INTERVAL"
    done
done</code></pre>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h2 class="wp-block-heading"><strong>What the script actually does (in human terms)</strong></h2>



<h3 class="wp-block-heading"><strong>1. Bandwidth is adjustable at runtime</strong></h3>



<p>You can run:</p>



<pre class="wp-block-code"><code>./rsync_plex.sh 30000</code></pre>



<p>and immediately trade speed for stability without editing the script. This matters because the WD’s tolerance changes with temperature, file mix, and sheer bad luck.</p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h3 class="wp-block-heading"><strong>2. rsync runs in the background</strong></h3>



<p>This avoids terminal-dependent progress behavior and lets the script supervise it like a long-running job.</p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h3 class="wp-block-heading"><strong>3. Progress is inferred, not guessed</strong></h3>



<p>Instead of trusting rsync’s live output, the script watches the <strong>log file modification time</strong>.<br>If the log hasn’t changed in 120 seconds, the script doesn’t panic. It says:<br><em>“rsync is quiet. The WD is probably flushing I/O.”</em><br>That distinction matters.</p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h3 class="wp-block-heading"><strong>4. Liveness checks are layered</strong></h3>



<p>When things go quiet, the script checks:</p>



<ul class="wp-block-list">
<li>Can I ping the WD?</li>



<li>Can I open an SSH session?</li>



<li>Is the source path present?</li>
</ul>



<p>This avoids false positives and avoids killing healthy transfers.</p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h3 class="wp-block-heading"><strong>5. Crashes are expected</strong></h3>



<p>If rsync exits non-zero because the WD rebooted:</p>



<ul class="wp-block-list">
<li>the script waits</li>



<li>the WD comes back</li>



<li>rsync resumes automatically</li>



<li>partial files continue where they left off</li>
</ul>



<p>No manual cleanup. No lost sleep.</p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h2 class="wp-block-heading"><strong>The rack, because it matters</strong></h2>



<p>As part of this migration I rebuilt the physical setup into a <strong>custom 10-inch rack</strong>:</p>



<ul class="wp-block-list">
<li>QNAP</li>



<li>network gear</li>



<li>airflow-controlled fan modules</li>



<li>short cable runs</li>



<li>sane thermals</li>
</ul>



<p>The irony is not lost on me that the <em>software</em> solution was more complex than the <em>hardware</em> one. <br>But once everything is in place, the system is quieter, cooler, and easier to reason about.</p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h2 class="wp-block-heading"><strong>Lessons learned</strong></h2>



<ul class="wp-block-list">
<li>Consumer NAS devices are not designed for sustained, hostile workloads</li>



<li>rsync is incredibly powerful, but brutally honest</li>



<li>Observability beats speed</li>



<li>Automation should assume failure, not hope against it</li>
</ul>



<p>Most importantly:<br><strong>If a system keeps failing in the same way, <mark style="background-color:rgba(0, 0, 0, 0)" class="has-inline-color has-luminous-vivid-amber-color">stop fighting it and design around that failure</mark>.</strong></p>



<hr class="wp-block-separator has-alpha-channel-opacity"/>



<h2 class="wp-block-heading"><strong>If this helps you</strong></h2>



<p>Feel free to adapt the script, tune the intervals, or simplify it for your own environment. The core idea is not the exact flags, but the mindset: <strong>make the transfer resilient, not fast</strong>.</p>



<p>Because eventually, the copy <em>will</em> finish.<br>And when it does, it’s deeply satisfying to realize you didn’t have to babysit it at all.</p>
