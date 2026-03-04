import { html } from "hono/html";

export function cameraScript(
  BOX_W: number,
  BOX_HEADER_H: number,
  ROW_H: number,
) {
  return html`<script>
    (function () {
      var container = document.getElementById("diagram-viewport");
      var wrap = document.getElementById("canvas-wrap");
      var BW = ${BOX_W},
        BH = ${BOX_HEADER_H},
        RH = ${ROW_H};

      // ── Camera ────────────────────────────────────────────────
      var camera = { x: 0, y: 0, z: 1 };

      function applyCamera() {
        wrap.style.transform =
          "scale(" +
          camera.z +
          ") translate(" +
          camera.x +
          "px," +
          camera.y +
          "px)";
        document.documentElement.style.setProperty("--pb-zoom", camera.z);
        var el = document.getElementById("zoom-level");
        if (el) el.textContent = Math.round(camera.z * 100) + "%";
      }

      function zoomCamera(cx, cy, dz) {
        var z1 = camera.z;
        var z2 = Math.max(0.1, Math.min(8, z1 - dz * z1));
        var p1x = cx / z1 - camera.x,
          p1y = cy / z1 - camera.y;
        var p2x = cx / z2 - camera.x,
          p2y = cy / z2 - camera.y;
        camera = {
          x: camera.x + (p2x - p1x),
          y: camera.y + (p2y - p1y),
          z: z2,
        };
        applyCamera();
      }

      container.addEventListener(
        "wheel",
        function (e) {
          e.preventDefault();
          var rect = container.getBoundingClientRect();
          const origin = {
            x: e.clientX - window.innerWidth / 2 - rect.left,
            y: e.clientY - window.innerHeight / 2 - rect.top,
          };
          if (e.ctrlKey || e.metaKey) {
            zoomCamera(
              origin.x - rect.left,
              origin.y - rect.top,
              e.deltaY / 100,
            );
          } else {
            camera = {
              x: camera.x - e.deltaX / camera.z,
              y: camera.y - e.deltaY / camera.z,
              z: camera.z,
            };
            applyCamera();
          }
        },
        { passive: false },
      );

      // ── Box positions ─────────────────────────────────────────
      var pos = {};
      wrap.querySelectorAll("[data-table]").forEach(function (el) {
        pos[el.dataset.table] = {
          x: parseFloat(el.style.left),
          y: parseFloat(el.style.top),
          h: parseFloat(el.dataset.h),
        };
      });

      // ── Path builder (mirrors server-side routePath) ──────────
      function buildCP(pts, R) {
        var d = "M" + pts[0].x + "," + pts[0].y;
        for (var i = 1; i < pts.length - 1; i++) {
          var prev = pts[i - 1],
            curr = pts[i],
            next = pts[i + 1];
          var dx1 = curr.x - prev.x,
            dy1 = curr.y - prev.y;
          var dx2 = next.x - curr.x,
            dy2 = next.y - curr.y;
          var len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1),
            len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (len1 < 0.5 || len2 < 0.5) continue;
          var r = Math.min(R, len1 / 2, len2 / 2);
          d +=
            " L" +
            (curr.x - (dx1 / len1) * r) +
            "," +
            (curr.y - (dy1 / len1) * r);
          d +=
            " Q" +
            curr.x +
            "," +
            curr.y +
            " " +
            (curr.x + (dx2 / len2) * r) +
            "," +
            (curr.y + (dy2 / len2) * r);
        }
        d += " L" + pts[pts.length - 1].x + "," + pts[pts.length - 1].y;
        return d;
      }
      function isHB(x1, x2, y) {
        var xl = x1 < x2 ? x1 : x2,
          xr = x1 > x2 ? x1 : x2;
        for (var k in pos) {
          var p = pos[k];
          if (
            xl < p.x + BW - 2 &&
            xr > p.x + 2 &&
            y > p.y + 2 &&
            y < p.y + p.h - 2
          )
            return true;
        }
        return false;
      }
      function isVB(x, ya, yb) {
        var yt = ya < yb ? ya : yb,
          ybt = ya > yb ? ya : yb;
        for (var k in pos) {
          var p = pos[k];
          if (
            x > p.x + 2 &&
            x < p.x + BW - 2 &&
            yt < p.y + p.h - 2 &&
            ybt > p.y + 2
          )
            return true;
        }
        return false;
      }
      function bp(f, t, fc, tc, lo) {
        var ST = 10,
          R = 16,
          MARGIN = 24;
        lo = lo || 0;
        var y1 = f.y + BH + fc * RH + RH / 2,
          y2 = t.y + BH + tc * RH + RH / 2;
        var sv = y2 >= y1 ? 1 : -1,
          sh = t.x >= f.x ? 1 : -1;
        var px1 = sh > 0 ? f.x + BW : f.x,
          px2 = sh > 0 ? t.x : t.x + BW;
        var adx = t.x > f.x ? t.x - f.x : f.x - t.x;
        var willFold = sh > 0 ? !(px2 - px1 >= 50) : !(px1 - px2 >= 50);
        if (!(adx >= 2) || willFold) {
          var cx = (f.x > t.x ? f.x : t.x) + BW + ST;
          for (var i = 0; i < 20 && isVB(cx, y1, y2); i++) cx += R * 2;
          cx += lo;
          var vd = y2 > y1 ? y2 - y1 : y1 - y2,
            r = vd / 2 > R ? R : vd / 2;
          if (!(r > 0.5))
            return "M" + (f.x + BW) + "," + y1 + " H" + cx + " H" + (t.x + BW);
          var ud =
            "M" +
            (f.x + BW) +
            "," +
            y1 +
            " H" +
            (cx - r) +
            " Q" +
            cx +
            "," +
            y1 +
            " " +
            cx +
            "," +
            (y1 + sv * r);
          if (vd - 2 * r > 0.5) ud += " V" + (y2 - sv * r);
          ud +=
            " Q" +
            cx +
            "," +
            y2 +
            " " +
            (cx - r) +
            "," +
            y2 +
            " H" +
            (t.x + BW);
          return ud;
        }
        var ax = px1 + sh * ST,
          bx = px2 - sh * ST;
        var yMin = y1 < y2 ? y1 : y2,
          yMax = y1 > y2 ? y1 : y2;
        if (!(Math.abs(y2 - y1) >= 2) && !isHB(ax, bx, y1))
          return "M" + px1 + "," + y1 + " H" + px2;
        var vx = (ax + bx) / 2;
        for (var iter = 0; iter < 8; iter++) {
          for (var k in pos) {
            var bb = pos[k];
            if (
              vx > bb.x + 2 &&
              bb.x + BW - 2 > vx &&
              bb.y + bb.h > yMin &&
              yMax > bb.y
            ) {
              vx = vx - bb.x <= bb.x + BW - vx ? bb.x - R : bb.x + BW + R;
            }
          }
        }
        if (sh > 0) {
          if (!(vx >= ax + R)) vx = ax + R;
          if (vx > bx - R) vx = bx - R;
        } else {
          if (vx > ax - R) vx = ax - R;
          if (!(vx >= bx + R)) vx = bx + R;
        }
        vx += lo;
        if (!isHB(ax, vx, y1) && !isVB(vx, y1, y2) && !isHB(vx, bx, y2)) {
          var r2 = Math.abs(y2 - y1) / 2 > R ? R : Math.abs(y2 - y1) / 2;
          var c1x = vx - sh * r2,
            c1y = y1 + sv * r2,
            c2y = y2 - sv * r2,
            c2x = vx + sh * r2;
          var d = "M" + px1 + "," + y1 + " H" + ax;
          if (Math.abs(ax - c1x) > 0.5) d += " H" + c1x;
          d += " Q" + vx + "," + y1 + " " + vx + "," + c1y;
          if (Math.abs(c1y - c2y) > 0.5) d += " V" + c2y;
          d += " Q" + vx + "," + y2 + " " + c2x + "," + y2;
          if (Math.abs(c2x - bx) > 0.5) d += " H" + bx;
          d += " H" + px2;
          return d;
        }
        var xL = (ax < bx ? ax : bx) - R,
          xR = (ax > bx ? ax : bx) + R;
        var topY = Infinity,
          botY = -Infinity;
        for (var j in pos) {
          var p2 = pos[j];
          if (p2.x + BW > xL && p2.x < xR) {
            if (p2.y < topY) topY = p2.y;
            if (p2.y + p2.h > botY) botY = p2.y + p2.h;
          }
        }
        var safeYA = (topY === Infinity ? y1 : topY) - MARGIN;
        var safeYB = (botY === -Infinity ? y1 : botY) + MARGIN;
        var safeY =
          (Math.abs(y1 - safeYA) + Math.abs(y2 - safeYA) <=
          Math.abs(y1 - safeYB) + Math.abs(y2 - safeYB)
            ? safeYA
            : safeYB) + lo;
        return buildCP(
          [
            { x: px1, y: y1 },
            { x: ax, y: y1 },
            { x: ax, y: safeY },
            { x: bx, y: safeY },
            { x: bx, y: y2 },
            { x: px2, y: y2 },
          ],
          R,
        );
      }

      function computeVx(f, t, fc, tc) {
        var ST = 10,
          R = 16;
        var y1 = f.y + BH + fc * RH + RH / 2,
          y2 = t.y + BH + tc * RH + RH / 2;
        var sh = t.x >= f.x ? 1 : -1;
        var px1 = sh > 0 ? f.x + BW : f.x,
          px2 = sh > 0 ? t.x : t.x + BW;
        var adx = t.x > f.x ? t.x - f.x : f.x - t.x;
        var willFold = sh > 0 ? !(px2 - px1 >= 50) : !(px1 - px2 >= 50);
        if (!(adx >= 2) || willFold) {
          var cx = (f.x > t.x ? f.x : t.x) + BW + ST;
          for (var i = 0; i < 20 && isVB(cx, y1, y2); i++) cx += R * 2;
          return cx;
        }
        var ax = px1 + sh * ST,
          bx = px2 - sh * ST;
        var yMin = y1 < y2 ? y1 : y2,
          yMax = y1 > y2 ? y1 : y2;
        var vx = (ax + bx) / 2;
        for (var iter = 0; iter < 8; iter++) {
          for (var k in pos) {
            var bb = pos[k];
            if (
              vx > bb.x + 2 &&
              bb.x + BW - 2 > vx &&
              bb.y + bb.h > yMin &&
              yMax > bb.y
            ) {
              vx = vx - bb.x <= bb.x + BW - vx ? bb.x - R : bb.x + BW + R;
            }
          }
        }
        return sh > 0
          ? Math.max(ax + R, Math.min(bx - R, vx))
          : Math.min(ax - R, Math.max(bx + R, vx));
      }

      function updatePaths() {
        var entries = [];
        wrap.querySelectorAll("path[data-from]").forEach(function (p) {
          var f = pos[p.dataset.from],
            t = pos[p.dataset.to];
          if (!f || !t) return;
          var fc = +p.dataset.fromCol,
            tc = +p.dataset.toCol;
          var vx = computeVx(f, t, fc, tc);
          var y1 = f.y + BH + fc * RH + RH / 2,
            y2 = t.y + BH + tc * RH + RH / 2;
          entries.push({
            el: p,
            f: f,
            t: t,
            fc: fc,
            tc: tc,
            vx: vx,
            y1: y1,
            y2: y2,
            lo: 0,
          });
        });
        // Detect overlapping vertical segments and assign lane offsets
        var used = entries.map(function () {
          return false;
        });
        for (var i = 0; i < entries.length; i++) {
          if (used[i]) continue;
          var group = [i];
          used[i] = true;
          for (var j = i + 1; j < entries.length; j++) {
            if (used[j]) continue;
            var a = entries[i],
              b = entries[j];
            var aMin = a.y1 < a.y2 ? a.y1 : a.y2,
              aMax = a.y1 > a.y2 ? a.y1 : a.y2;
            var bMin = b.y1 < b.y2 ? b.y1 : b.y2,
              bMax = b.y1 > b.y2 ? b.y1 : b.y2;
            if (
              Math.abs(a.vx - b.vx) < 2 &&
              Math.min(aMax, bMax) > Math.max(aMin, bMin)
            ) {
              group.push(j);
              used[j] = true;
            }
          }
          var n = group.length;
          for (var r = 0; r < n; r++)
            entries[group[r]].lo = n > 1 ? (r - (n - 1) / 2) * 10 : 0;
        }
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          e.el.setAttribute("d", bp(e.f, e.t, e.fc, e.tc, e.lo));
        }
      }

      // ── Unified mousedown: table drag or canvas pan ───────────
      var isDragging = false,
        dragEl = null,
        dragStart = null,
        dragElStart = null;
      var isPanning = false,
        panStart = null,
        cameraAtStart = null;

      container.addEventListener("pointerdown", function (e) {
        var header = e.target.closest("[data-header]");
        if (header) {
          var box = header.closest("[data-table]");
          if (!box) return;
          pos[box.dataset.table] = {
            x: parseFloat(box.style.left),
            y: parseFloat(box.style.top),
            h: parseFloat(box.dataset.h),
          };
          isDragging = true;
          dragEl = box;
          dragStart = { x: e.clientX, y: e.clientY };
          dragElStart = {
            x: pos[box.dataset.table].x,
            y: pos[box.dataset.table].y,
          };
          header.style.cursor = "grabbing";
          e.preventDefault();
          return;
        }
        if (e.target.closest("[data-table]")) return;
        isPanning = true;
        panStart = { x: e.clientX, y: e.clientY };
        cameraAtStart = { x: camera.x, y: camera.y, z: camera.z };
        container.style.cursor = "grabbing";
        e.preventDefault();
      });

      window.addEventListener("pointermove", function (e) {
        if (isDragging) {
          var dx = (e.clientX - dragStart.x) / camera.z;
          var dy = (e.clientY - dragStart.y) / camera.z;
          var nx = dragElStart.x + dx,
            ny = dragElStart.y + dy;
          pos[dragEl.dataset.table] = {
            x: nx,
            y: ny,
            h: pos[dragEl.dataset.table].h,
          };
          dragEl.style.left = nx + "px";
          dragEl.style.top = ny + "px";
          updatePaths();
        }
        if (isPanning) {
          camera = {
            x: cameraAtStart.x + (e.clientX - panStart.x) / cameraAtStart.z,
            y: cameraAtStart.y + (e.clientY - panStart.y) / cameraAtStart.z,
            z: cameraAtStart.z,
          };
          applyCamera();
        }
      });

      window.addEventListener("pointerup", function () {
        if (isDragging) {
          dragEl.querySelector("[data-header]").style.cursor = "grab";
          isDragging = false;
          dragEl = null;
        }
        if (isPanning) {
          isPanning = false;
          container.style.cursor = "";
        }
      });

      // ── Zoom buttons ──────────────────────────────────────────
      var btnIn = document.getElementById("zoom-in");
      var btnOut = document.getElementById("zoom-out");
      var btnReset = document.getElementById("reset-view");
      function zoomStep(dir) {
        var rect = container.getBoundingClientRect();
        var i = Math.round(camera.z * 100) / 25;
        var next = Math.max(0.25, (i + dir) * 0.25);
        wrap.style.transition =
          "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        zoomCamera(rect.width / 2, rect.height / 2, camera.z - next);
        wrap.addEventListener("transitionend", function onDone() {
          wrap.style.transition = "";
          wrap.removeEventListener("transitionend", onDone);
        });
      }
      if (btnIn)
        btnIn.addEventListener("click", function () {
          zoomStep(1);
        });
      if (btnOut)
        btnOut.addEventListener("click", function () {
          zoomStep(-1);
        });
      if (btnReset)
        btnReset.addEventListener("click", function () {
          camera = { x: 0, y: 0, z: 1 };
          wrap.style.transition =
            "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          applyCamera();
          wrap.addEventListener("transitionend", function onDone() {
            wrap.style.transition = "";
            wrap.removeEventListener("transitionend", onDone);
          });
        });

      // ── Dash animation ────────────────────────────────────────
      var dashOffset = 0,
        dashLastTs = null;
      function animateDash(ts) {
        if (dashLastTs !== null)
          dashOffset -= ((14 / 0.75) * (ts - dashLastTs)) / 1000 / camera.z;
        dashLastTs = ts;
        wrap.querySelectorAll("path[data-from]").forEach(function (p) {
          p.style.strokeDashoffset = dashOffset;
        });
        requestAnimationFrame(animateDash);
      }
      requestAnimationFrame(animateDash);

      applyCamera();
    })();
  </script>`;
}
