/* ============================================================
   madera-scroll-hero  —  scroll-scrubbed video hero
   Wix Studio custom element.

   Setup:
     1. Wix Studio → Dev Mode on → Public folder → new file
        named  madera-scroll-hero.js  → paste this whole file.
     2. Add → Embed Code → Custom Element.
        Tag name:  madera-scroll-hero
        Server URL / source:  pick this file from Public.
     3. Set the element's HEIGHT to 3000px in the editor.
        That height IS the scroll distance. Shorter = faster hero.
        Set width to Full Bleed / stretch.

   Everything below is overridable as an attribute in the
   custom element panel. Defaults are already correct for
   the Coconut Grove clip.
   ============================================================ */

(function () {
  'use strict';

  var VIDEO =
    'https://video.wixstatic.com/video/24d964_8507cc81ce554c409168d1fba8b3f2ff/1080p/mp4/file.mp4';
  var POSTER =
    'https://static.wixstatic.com/media/24d964_8507cc81ce554c409168d1fba8b3f2fff000.jpg';

  var CSS = [
    ':host{display:block;position:relative;width:100%;background:#17120E}',
    '*{box-sizing:border-box;margin:0;padding:0}',

    '.pin{position:absolute;top:0;left:0;width:100%;height:100vh;',
    'height:100svh;overflow:hidden;background:#17120E}',
    '.pin.is-fixed{position:fixed}',
    '.pin.is-end{top:auto;bottom:0}',

    '.media{position:absolute;inset:0}',
    '.media video,.media img{position:absolute;inset:0;width:100%;height:100%;',
    'object-fit:cover;object-position:var(--obj,50% 50%);display:block}',
    '.media img{transition:opacity .35s ease}',
    '.media img.gone{opacity:0}',

    /* copy */
    '.copy{position:absolute;left:0;right:0;z-index:3;',
    'padding:0 clamp(24px,8vw,120px);pointer-events:none;color:#F4EFE6}',
    '.copy .shade{position:absolute;inset:-45vh -8vw -25vh;z-index:-1;',
    'background:linear-gradient(to top,rgba(23,18,14,.72),rgba(23,18,14,0) 62%)}',
    '.a{bottom:14vh}',
    '.b{top:50%;opacity:0}',
    '.b .shade{background:linear-gradient(to top,rgba(23,18,14,.62),rgba(23,18,14,0) 70%)}',
    '.eyebrow{font-size:.68rem;letter-spacing:.34em;text-transform:uppercase;',
    'opacity:.78;margin-bottom:1.1rem;font-weight:400}',
    'h1{font-family:var(--display,"Cormorant Garamond",Didot,Georgia,serif);',
    'font-weight:300;font-size:clamp(2.4rem,7vw,6rem);line-height:.96;',
    'letter-spacing:-.015em}',
    'h1 em{font-style:italic;color:#AF9F8C}',
    '.sub{margin-top:1.3rem;max-width:34ch;line-height:1.65;opacity:.84;',
    'font-size:clamp(.88rem,1.1vw,1.02rem)}',

    '.cue{position:absolute;z-index:3;bottom:3.2vh;left:50%;',
    'transform:translateX(-50%);font-size:.6rem;letter-spacing:.3em;',
    'text-transform:uppercase;color:#F4EFE6;opacity:.6;display:flex;',
    'flex-direction:column;align-items:center;gap:.7rem}',
    '.cue i{display:block;width:1px;height:32px;',
    'background:linear-gradient(#F4EFE6,transparent)}',

    '@media(prefers-reduced-motion:reduce){.cue{display:none}}'
  ].join('');

  function clamp(v, a, b) {
    a = a === undefined ? 0 : a;
    b = b === undefined ? 1 : b;
    return v < a ? a : v > b ? b : v;
  }
  function seg(p, a, b) { return clamp((p - a) / (b - a)); }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  }

  /* "And ends |underfoot" -> italic accent after the pipe */
  function headlineHTML(text) {
    var parts = String(text).split('|');
    var out = esc(parts[0]);
    if (parts.length > 1) out += '<br><em>' + esc(parts[1]) + '</em>';
    return out;
  }

  function define() {
    class MaderaScrollHero extends HTMLElement {
      connectedCallback() {
        if (this._up) return;
        this._up = true;

        var a = this.getAttribute.bind(this);
        this.reduced =
          window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        this.smooth = parseFloat(a('smoothing')) || 0.14;
        this.fallbackH = a('scroll-height') || '320vh';

        var root = this.attachShadow({ mode: 'open' });
        root.innerHTML =
          '<style>' + CSS + '</style>' +
          '<div class="pin" part="pin">' +
            '<div class="media">' +
              '<video playsinline muted preload="auto" ' +
                'disablepictureinpicture ' +
                'src="' + esc(a('video-src') || VIDEO) + '"></video>' +
              '<img alt="" src="' + esc(a('poster-src') || POSTER) + '">' +
            '</div>' +
            '<div class="copy a">' +
              '<div class="shade"></div>' +
              '<p class="eyebrow">' + esc(a('eyebrow') || 'Coconut Grove / Residence I') + '</p>' +
              '<h1>' + headlineHTML(a('headline') || 'Every floor|begins outside') + '</h1>' +
            '</div>' +
            '<div class="copy b">' +
              '<div class="shade"></div>' +
              '<p class="eyebrow">' + esc(a('eyebrow-2') || 'Storia / Large-format porcelain') + '</p>' +
              '<h1>' + headlineHTML(a('headline-2') || 'And ends|underfoot') + '</h1>' +
              (a('sub-2') === '' ? '' :
                '<p class="sub">' + esc(a('sub-2') ||
                'Continuous slabs run from the entry through the great room ' +
                'without a threshold strip \u2014 one plane, wall to wall.') + '</p>') +
            '</div>' +
            '<div class="cue"><i></i>Scroll</div>' +
          '</div>';

        this.pin   = root.querySelector('.pin');
        this.video = root.querySelector('video');
        this.post  = root.querySelector('img');
        this.copyA = root.querySelector('.copy.a');
        this.copyB = root.querySelector('.copy.b');
        this.cue   = root.querySelector('.cue');

        if (a('object-position')) {
          this.style.setProperty('--obj', a('object-position'));
        }
        if (a('z-index')) this.style.zIndex = a('z-index');

        /* the editor sometimes hands back a short box — guarantee scroll room */
        if (this.offsetHeight < window.innerHeight * 1.5) {
          this.style.height = this.fallbackH;
        }

        this.dur = parseFloat(a('duration')) || 0;
        this.cur = 0;
        this.tgt = 0;
        this.ready = false;

        var self = this;
        this.video.addEventListener('loadedmetadata', function () {
          if (!self.dur) self.dur = self.video.duration || 3.04;
        });
        this.video.addEventListener('loadeddata', function () {
          self.ready = true;
          self.post.classList.add('gone');
        });
        this.video.load();

        /* iOS won't let you seek a video it has never been told to play */
        this._unlock = function () {
          var p = self.video.play();
          if (p && p.then) p.then(function () { self.video.pause(); })
                            .catch(function () {});
          else { try { self.video.pause(); } catch (e) {} }
          window.removeEventListener('touchstart', self._unlock);
          window.removeEventListener('click', self._unlock);
        };
        window.addEventListener('touchstart', this._unlock, { passive: true, once: true });
        window.addEventListener('click', this._unlock, { once: true });

        if (this.reduced) {
          this.copyB.style.opacity = 1;
          this.copyA.style.opacity = 0;
          this.pin.classList.add('is-fixed');
          this.video.addEventListener('loadeddata', function () {
            try { self.video.currentTime = self.video.duration - 0.05; } catch (e) {}
          });
          return;
        }

        this.loop = this.loop.bind(this);
        this.raf = requestAnimationFrame(this.loop);
      }

      disconnectedCallback() {
        cancelAnimationFrame(this.raf);
        window.removeEventListener('touchstart', this._unlock);
        window.removeEventListener('click', this._unlock);
        this._up = false;
      }

      /* ---- three-state pin: absolute-top → fixed → absolute-bottom ---- */
      loop() {
        this.raf = requestAnimationFrame(this.loop);

        var r  = this.getBoundingClientRect();
        var vh = window.innerHeight;
        var span = this.offsetHeight - vh;
        if (span <= 0) return;

        var p = clamp(-r.top / span);

        if (r.top > 0)              { this.setState(''); }
        else if (p >= 1)            { this.setState('is-end'); }
        else                        { this.setState('is-fixed'); }

        this.render(p);
      }

      setState(cls) {
        if (this._state === cls) return;
        this._state = cls;
        this.pin.classList.remove('is-fixed', 'is-end');
        if (cls) this.pin.classList.add(cls);
      }

      render(p) {
        /* video scrub, lerped so it glides instead of snapping */
        this.tgt = p * (this.dur || 3.04);
        this.cur += (this.tgt - this.cur) * this.smooth;
        if (this.ready && Math.abs(this.video.currentTime - this.cur) > 0.008) {
          try { this.video.currentTime = this.cur; } catch (e) {}
        }

        var a = 1 - seg(p, 0.02, 0.22);
        this.copyA.style.opacity = a;
        this.copyA.style.transform = 'translateY(' + (-46 * (1 - a)).toFixed(1) + 'px)';

        var b = seg(p, 0.72, 0.94);
        this.copyB.style.opacity = b;
        this.copyB.style.transform =
          'translateY(calc(-50% + ' + (34 * (1 - b)).toFixed(1) + 'px))';

        this.cue.style.opacity = 0.6 * (1 - seg(p, 0, 0.07));
      }
    }

    if (!customElements.get('madera-scroll-hero')) {
      customElements.define('madera-scroll-hero', MaderaScrollHero);
    }
  }

  define();
})();
