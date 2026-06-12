/* @ds-bundle: {"format":3,"namespace":"MeeseRsDesignSystem_ed1971","components":[{"name":"Callout","sourcePath":"components/content/Callout.jsx"},{"name":"NoteCard","sourcePath":"components/content/NoteCard.jsx"},{"name":"PostCard","sourcePath":"components/content/PostCard.jsx"},{"name":"Stars","sourcePath":"components/content/ReviewCard.jsx"},{"name":"ReviewCard","sourcePath":"components/content/ReviewCard.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"ICONS","sourcePath":"components/core/Icon.jsx"},{"name":"TYPE_ICONS","sourcePath":"components/core/Icon.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"}],"sourceHashes":{"components/content/Callout.jsx":"53d5970a957f","components/content/NoteCard.jsx":"805aff6929a1","components/content/PostCard.jsx":"af745c75c82d","components/content/ReviewCard.jsx":"1df8e9b39819","components/core/Badge.jsx":"9bd451c93fb6","components/core/Button.jsx":"93ffdaa58c1b","components/core/Icon.jsx":"c5a988adffa5","components/core/Input.jsx":"6a173ac5fb74","components/core/Tag.jsx":"53afbf718a18","ui_kits/website/Chrome.jsx":"9b08a0504642","ui_kits/website/GraphView.jsx":"f585a46607ec","ui_kits/website/Home.jsx":"c67e4faf7c42","ui_kits/website/ListView.jsx":"aaf0ad90b878","ui_kits/website/PostView.jsx":"4d5da1e4d54f","ui_kits/website/ReviewView.jsx":"a87059b29567","ui_kits/website/ReviewsView.jsx":"d2427667b51c","ui_kits/website/SearchOverlay.jsx":"ab217a01d00a","ui_kits/website/TopicsView.jsx":"506eb665d377","ui_kits/website/app.jsx":"b84bd3c73b95","ui_kits/website/data.js":"6a81f6f7d6c0","ui_kits/website/kit-primitives.js":"c3d5ccce9637"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MeeseRsDesignSystem_ed1971 = window.MeeseRsDesignSystem_ed1971 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/content/Callout.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — Callout
 * MDX callout for warnings/notes/context inside long-form posts.
 * Tinted well + left signal rail + mono label. No emoji.
 */
const KIND = {
  note: {
    color: 'var(--accent)',
    label: 'NOTE'
  },
  tip: {
    color: 'var(--green)',
    label: 'TIP'
  },
  warning: {
    color: 'var(--gold)',
    label: 'WARNING'
  },
  danger: {
    color: 'var(--red)',
    label: 'DANGER'
  },
  context: {
    color: 'var(--violet)',
    label: 'CONTEXT'
  }
};
function Callout({
  type = 'note',
  title,
  children,
  style,
  ...rest
}) {
  const k = KIND[type] || KIND.note;
  return /*#__PURE__*/React.createElement("div", _extends({
    role: "note",
    style: {
      background: `color-mix(in srgb, ${k.color} 8%, var(--surface-1))`,
      border: '1px solid',
      borderColor: `color-mix(in srgb, ${k.color} 28%, transparent)`,
      borderLeft: `2px solid ${k.color}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4) var(--space-5)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      marginBottom: title || children ? 8 : 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 600,
      letterSpacing: '0.14em',
      color: k.color
    }
  }, `// ${k.label}`), title ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-base)',
      fontWeight: 600,
      color: 'var(--ink-1)'
    }
  }, title) : null), children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      lineHeight: 1.6,
      color: 'var(--ink-2)'
    }
  }, children) : null);
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Callout.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — Button
 * Technical, restrained. Primary uses the cyan signal; ghost is the
 * default for system-index chrome. Press shifts down 1px, no bounce.
 */
function Button({
  children,
  variant = 'secondary',
  size = 'md',
  iconLeft,
  iconRight,
  disabled = false,
  fullWidth = false,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const sizes = {
    sm: {
      height: 30,
      padding: '0 12px',
      font: 'var(--text-2xs)',
      gap: 6,
      radius: 'var(--radius-sm)'
    },
    md: {
      height: 38,
      padding: '0 16px',
      font: 'var(--text-sm)',
      gap: 8,
      radius: 'var(--radius-sm)'
    },
    lg: {
      height: 46,
      padding: '0 22px',
      font: 'var(--text-base)',
      gap: 9,
      radius: 'var(--radius-md)'
    }
  };
  const s = sizes[size] || sizes.md;
  const variants = {
    primary: {
      base: {
        background: 'var(--accent)',
        color: 'var(--ink-inverse)',
        border: '1px solid var(--accent)'
      },
      hover: {
        background: 'var(--accent-bright)',
        borderColor: 'var(--accent-bright)',
        boxShadow: 'var(--glow-soft)'
      }
    },
    secondary: {
      base: {
        background: 'var(--surface-2)',
        color: 'var(--ink-1)',
        border: '1px solid var(--line-2)'
      },
      hover: {
        background: 'var(--surface-3)',
        borderColor: 'var(--line-3)'
      }
    },
    ghost: {
      base: {
        background: 'transparent',
        color: 'var(--ink-2)',
        border: '1px solid transparent'
      },
      hover: {
        background: 'var(--surface-2)',
        color: 'var(--ink-1)'
      }
    },
    accent: {
      base: {
        background: 'var(--accent-wash)',
        color: 'var(--accent-bright)',
        border: '1px solid var(--accent-dim)'
      },
      hover: {
        background: 'var(--accent-wash-2)',
        borderColor: 'var(--accent-deep)'
      }
    },
    danger: {
      base: {
        background: 'var(--red-wash)',
        color: 'var(--red)',
        border: '1px solid var(--red)'
      },
      hover: {
        background: 'rgba(226,106,98,0.20)'
      }
    }
  };
  const v = variants[variant] || variants.secondary;
  const composed = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    height: s.height,
    padding: s.padding,
    width: fullWidth ? '100%' : 'auto',
    fontFamily: 'var(--font-mono)',
    fontSize: s.font,
    fontWeight: 500,
    letterSpacing: '0.02em',
    lineHeight: 1,
    borderRadius: s.radius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out), color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out), transform var(--dur-1) var(--ease-out)',
    transform: active && !disabled ? 'translateY(1px)' : 'translateY(0)',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...v.base,
    ...(hover && !disabled ? v.hover : null),
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: composed
  }, rest), iconLeft ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      marginLeft: -2
    }
  }, iconLeft) : null, children, iconRight ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      marginRight: -2
    }
  }, iconRight) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — Icon
 * Inline Lucide glyphs (MIT), the single source the UI draws from. Ported
 * verbatim from the site's `src/utils/icons.ts` so a glyph looks identical
 * whether the design system, an Astro component, or the search overlay drew
 * it. Stroke is 1.5px, no fill, `currentColor` — it inherits ink/accent from
 * its parent. This is deliberately NOT the Lucide CDN runtime: badges and
 * chrome must render self-contained, with zero external script.
 */
const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  'git-fork': '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9"/><path d="M12 12v3"/>',
  zap: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  'refresh-cw': '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  'bar-chart-3': '<path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>',
  'book-open': '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  pencil: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  feather: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" x2="2" y1="8" y2="22"/><line x1="17.5" x2="9" y1="15" y2="15"/>',
  'flask-conical': '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
  bookmark: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  github: '<path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  linkedin: '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
  'x-twitter': '<path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>',
  mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'arrow-up-right': '<path d="M7 7h10v10"/><path d="M7 17 17 7"/>',
  menu: '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/>'
};

/** One Lucide icon per post type — the glyph carries the "what kind" signal. */
const TYPE_ICONS = {
  guide: 'book-open',
  note: 'pencil',
  devlog: 'terminal',
  essay: 'feather',
  lab: 'flask-conical',
  reference: 'bookmark',
  review: 'star'
};

/**
 * Inline icon. `name` indexes the glyph map above. Inherits color via
 * `currentColor`; size it in px (18 in UI, 16 inline, ~13 inside a badge).
 */
function Icon({
  name,
  size = 18,
  strokeWidth = 1.5,
  style,
  ...rest
}) {
  const inner = ICONS[name] || '';
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
    style: {
      display: 'block',
      flex: 'none',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: inner
    }
  }, rest));
}
Object.assign(__ds_scope, { ICONS, TYPE_ICONS, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — Badge
 * The system-index marker. Two distinct shapes by intent:
 *   • TYPE badges lead with a Lucide icon and an UNBRACKETED label — the
 *     glyph is what tells one content type from another (guide ▸ book,
 *     review ▸ star, …). Each type carries a fixed categorical hue.
 *   • STATUS badges are bracketed `[ LABEL ]` with no icon, in a semantic
 *     hue (updated/corrected/deprecated/superseded/pinned).
 * Verdict pills on reviews are a third, separate shape (see ReviewCard).
 */
const TYPE_MAP = {
  guide: {
    color: 'var(--hue-cyan)',
    label: 'GUIDE'
  },
  note: {
    color: 'var(--hue-slate)',
    label: 'NOTE'
  },
  devlog: {
    color: 'var(--hue-green)',
    label: 'DEVLOG'
  },
  essay: {
    color: 'var(--hue-violet)',
    label: 'ESSAY'
  },
  lab: {
    color: 'var(--hue-gold)',
    label: 'LAB'
  },
  reference: {
    color: 'var(--hue-rose)',
    label: 'REF'
  },
  review: {
    color: 'var(--accent)',
    label: 'REVIEW'
  }
};
const STATUS_MAP = {
  updated: {
    color: 'var(--green)',
    label: 'UPDATED'
  },
  corrected: {
    color: 'var(--gold)',
    label: 'CORRECTED'
  },
  deprecated: {
    color: 'var(--red)',
    label: 'DEPRECATED'
  },
  superseded: {
    color: 'var(--hue-slate)',
    label: 'SUPERSEDED'
  },
  pinned: {
    color: 'var(--accent)',
    label: 'PINNED'
  }
};
function Badge({
  type,
  status,
  children,
  color,
  bracketed,
  solid = false,
  icon = true,
  style,
  ...rest
}) {
  const preset = type ? TYPE_MAP[type] : status ? STATUS_MAP[status] : null;
  const hue = color || (preset ? preset.color : 'var(--ink-3)');
  const label = children != null ? children : preset ? preset.label : '';

  // Type badges are icon-led + unbracketed; status/custom badges bracket by
  // default. An explicit `bracketed` prop always wins.
  const showBracket = bracketed === undefined ? !type : bracketed;
  const text = showBracket ? `[ ${label} ]` : label;
  const iconName = icon && type ? __ds_scope.TYPE_ICONS[type] : null;
  const base = solid ? {
    background: hue,
    color: 'var(--ink-inverse)',
    border: `1px solid ${hue}`
  } : {
    background: 'color-mix(in srgb, ' + hue + ' 12%, transparent)',
    color: hue,
    border: `1px solid color-mix(in srgb, ${hue} 38%, transparent)`
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: iconName ? 5 : 0,
      height: 20,
      padding: iconName ? '0 7px 0 6px' : '0 7px',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 600,
      letterSpacing: '0.1em',
      lineHeight: 1,
      borderRadius: 'var(--radius-xs)',
      whiteSpace: 'nowrap',
      ...base,
      ...style
    }
  }, rest), iconName ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconName,
    size: 13
  }) : null, text);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/content/NoteCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — NoteCard
 * Compact entry for short notes living inline in the main feed. Reads
 * almost like a log line: mono date rail, [ NOTE ] marker, tight body.
 */
function NoteCard({
  title,
  body,
  date,
  href = '#',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      gap: 16,
      textDecoration: 'none',
      background: hover ? 'var(--surface-2)' : 'transparent',
      border: '1px solid',
      borderColor: hover ? 'var(--line-2)' : 'var(--line-1)',
      borderLeft: '2px solid var(--hue-slate)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-4) var(--space-5)',
      transition: 'background var(--dur-1) var(--ease-out), border-color var(--dur-1) var(--ease-out)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 8,
      flex: 'none',
      paddingTop: 1
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    type: "note"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--ink-4)',
      letterSpacing: '0.04em',
      whiteSpace: 'nowrap'
    }
  }, date)), /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0
    }
  }, title ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-base)',
      fontWeight: 600,
      color: hover ? 'var(--accent-bright)' : 'var(--ink-1)',
      transition: 'color var(--dur-1) var(--ease-out)',
      marginBottom: 4,
      textWrap: 'pretty'
    }
  }, title) : null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      lineHeight: 1.55,
      color: 'var(--ink-2)',
      margin: 0,
      textWrap: 'pretty'
    }
  }, body)));
}
Object.assign(__ds_scope, { NoteCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/NoteCard.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — Input
 * Dark well, mono text, cyan focus ring. The `search` variant adds a
 * leading prompt glyph and is the basis of the static Pagefind search UI.
 */
function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
  variant = 'default',
  iconLeft,
  prompt,
  size = 'md',
  disabled = false,
  fullWidth = true,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const isSearch = variant === 'search';
  const heights = {
    sm: 32,
    md: 40,
    lg: 48
  };
  const h = heights[size] || heights.md;
  const lead = prompt != null ? prompt : isSearch ? '/' : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      width: fullWidth ? '100%' : 'auto',
      height: h,
      padding: '0 12px',
      background: 'var(--surface-well)',
      border: '1px solid',
      borderColor: focus ? 'var(--accent)' : 'var(--line-2)',
      borderRadius: isSearch ? 'var(--radius-md)' : 'var(--radius-sm)',
      boxShadow: focus ? 'var(--glow-soft)' : 'none',
      opacity: disabled ? 0.5 : 1,
      transition: 'border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out)',
      ...style
    }
  }, lead ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      color: focus ? 'var(--accent)' : 'var(--ink-4)',
      fontWeight: 600
    }
  }, lead) : null, iconLeft ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      color: 'var(--ink-3)'
    }
  }, iconLeft) : null, /*#__PURE__*/React.createElement("input", _extends({
    type: type,
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      color: 'var(--ink-1)',
      fontFamily: isSearch ? 'var(--font-mono)' : 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      letterSpacing: isSearch ? '0.01em' : '0'
    }
  }, rest)));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — Tag
 * Lower-level label. Mono, prefixed with a faint hash, subtle until hover.
 * Used in clusters under post cards and on topic pages.
 */
function Tag({
  children,
  href,
  active = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Comp = href ? 'a' : 'span';
  const interactive = !!(href || onClick);
  return /*#__PURE__*/React.createElement(Comp, _extends({
    href: href,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 2,
      height: 22,
      padding: '0 8px',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 500,
      letterSpacing: '0.02em',
      lineHeight: 1,
      textDecoration: 'none',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid',
      borderColor: active ? 'var(--accent-deep)' : hover && interactive ? 'var(--line-3)' : 'var(--line-1)',
      background: active ? 'var(--accent-wash)' : hover && interactive ? 'var(--surface-2)' : 'transparent',
      color: active ? 'var(--accent-bright)' : hover && interactive ? 'var(--ink-1)' : 'var(--ink-3)',
      cursor: interactive ? 'pointer' : 'default',
      transition: 'all var(--dur-1) var(--ease-out)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      color: active ? 'var(--accent)' : 'var(--ink-4)'
    }
  }, "#"), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/content/PostCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — PostCard
 * The standard feed entry for longer writing (guide/devlog/essay/lab/
 * reference). Featured cards get reticle corner ticks. Composes Badge + Tag.
 */
function PostCard({
  title,
  description,
  type = 'guide',
  date,
  updated,
  readingTime,
  topics = [],
  featured = false,
  href = '#',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
      background: hover ? 'var(--surface-2)' : 'var(--surface-1)',
      border: '1px solid',
      borderColor: featured ? 'var(--line-2)' : hover ? 'var(--line-2)' : 'var(--line-1)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-6)',
      transition: 'background var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out)',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      ...style
    }
  }, rest), featured ? /*#__PURE__*/React.createElement(Reticle, null) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    type: type
  }), featured ? /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    status: "pinned"
  }) : null, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--ink-3)',
      letterSpacing: '0.04em'
    }
  }, date, readingTime ? `  ·  ${readingTime}` : '')), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.01em',
      color: hover ? 'var(--accent-bright)' : 'var(--ink-1)',
      margin: 0,
      transition: 'color var(--dur-1) var(--ease-out)',
      textWrap: 'pretty'
    }
  }, title), description ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      lineHeight: 1.6,
      color: 'var(--ink-2)',
      margin: '10px 0 0',
      maxWidth: '62ch',
      textWrap: 'pretty'
    }
  }, description) : null, topics.length || updated ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 16
    }
  }, topics.map(t => /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    key: t,
    href: `#${t}`
  }, t)), updated ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--green)',
      letterSpacing: '0.04em'
    }
  }, "updated ", updated) : null) : null);
}
function Reticle() {
  const c = {
    position: 'absolute',
    width: 11,
    height: 11,
    border: '1.5px solid var(--accent-deep)'
  };
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      ...c,
      top: 7,
      left: 7,
      borderRight: 0,
      borderBottom: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...c,
      top: 7,
      right: 7,
      borderLeft: 0,
      borderBottom: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...c,
      bottom: 7,
      left: 7,
      borderRight: 0,
      borderTop: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      ...c,
      bottom: 7,
      right: 7,
      borderLeft: 0,
      borderTop: 0
    }
  }));
}
Object.assign(__ds_scope, { PostCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/PostCard.jsx", error: String((e && e.message) || e) }); }

// components/content/ReviewCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * meese.rs — Stars
 * Precise partial-fill rating in the accent color (e.g. 4.2 / 5).
 * Uses the ★ glyph (symbol, not emoji) layered for sub-star precision.
 */
function Stars({
  score = 0,
  size = 14
}) {
  const pct = Math.max(0, Math.min(100, score / 5 * 100));
  const wrap = {
    position: 'relative',
    display: 'inline-block',
    fontSize: size,
    lineHeight: 1,
    letterSpacing: '2px',
    fontFamily: 'var(--font-mono)'
  };
  return /*#__PURE__*/React.createElement("span", {
    style: wrap,
    "aria-label": score + ' out of 5'
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--line-3)'
    }
  }, "\u2605\u2605\u2605\u2605\u2605"), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: pct + '%',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      color: 'var(--accent)'
    }
  }, "\u2605\u2605\u2605\u2605\u2605"));
}
const VERDICT = {
  recommended: {
    color: 'var(--green)',
    label: 'RECOMMENDED'
  },
  caveats: {
    color: 'var(--gold)',
    label: 'WITH CAVEATS'
  },
  watch: {
    color: 'var(--accent)',
    label: 'ONE TO WATCH'
  },
  skip: {
    color: 'var(--red)',
    label: 'SKIP FOR NOW'
  }
};

/**
 * meese.rs — ReviewCard
 * Feed card for a software / library review. Leads with the subject,
 * a precise star score, and a verdict — reviews are a first-class use
 * case on meese.rs, so the type badge takes the brand accent.
 */
function ReviewCard({
  subject,
  version,
  oneLiner,
  score = 0,
  verdict = 'recommended',
  date,
  topics = [],
  href = '#',
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const v = VERDICT[verdict] || VERDICT.recommended;
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
      background: hover ? 'var(--surface-2)' : 'var(--surface-1)',
      border: '1px solid',
      borderColor: hover ? 'var(--line-2)' : 'var(--line-1)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-6)',
      transition: 'background var(--dur-2) var(--ease-out), border-color var(--dur-2) var(--ease-out), transform var(--dur-2) var(--ease-out)',
      transform: hover ? 'translateY(-2px)' : 'translateY(0)',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    type: "review"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      fontWeight: 600,
      letterSpacing: '0.1em',
      color: v.color,
      border: '1px solid color-mix(in srgb, ' + v.color + ' 40%, transparent)',
      background: 'color-mix(in srgb, ' + v.color + ' 12%, transparent)',
      borderRadius: 'var(--radius-xs)',
      height: 20,
      padding: '0 7px',
      display: 'inline-flex',
      alignItems: 'center',
      whiteSpace: 'nowrap'
    }
  }, v.label), /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-2xs)',
      color: 'var(--ink-3)'
    }
  }, date)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
      lineHeight: 1.15,
      letterSpacing: '-0.01em',
      color: hover ? 'var(--accent-bright)' : 'var(--ink-1)',
      margin: 0,
      transition: 'color var(--dur-1) var(--ease-out)'
    }
  }, subject), version ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-xs)',
      color: 'var(--ink-4)'
    }
  }, version) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      margin: '12px 0 0'
    }
  }, /*#__PURE__*/React.createElement(Stars, {
    score: score,
    size: 15
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-2)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink-1)',
      fontWeight: 600
    }
  }, score.toFixed(1)), " / 5")), oneLiner ? /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      lineHeight: 1.6,
      color: 'var(--ink-2)',
      margin: '12px 0 0',
      maxWidth: '62ch',
      textWrap: 'pretty'
    }
  }, oneLiner) : null, topics.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 16
    }
  }, topics.map(t => /*#__PURE__*/React.createElement(__ds_scope.Tag, {
    key: t,
    href: '#' + t
  }, t))) : null);
}
Object.assign(__ds_scope, { Stars, ReviewCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ReviewCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Chrome.jsx
try { (() => {
/* meese.rs UI kit — shared chrome: Icon, SiteHeader, SiteFooter, Wordmark */
(function () {
  const {
    Button
  } = window.KIT;

  // Lucide icon rendered as a REAL React SVG (no post-render DOM mutation,
  // which would corrupt reconciliation of the persistent header).
  // Lucide node shape: ["svg", {attrs}, [ [tag, {attrs}], ... ]] — children are node[2].
  function Icon({
    name,
    size = 18,
    color,
    style
  }) {
    const pascal = name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const L = window.lucide || {};
    const node = L.icons && L.icons[pascal] || L[pascal];
    const base = {
      width: size,
      height: size,
      display: 'inline-block',
      flex: 'none',
      verticalAlign: 'middle',
      ...style
    };
    const childDefs = Array.isArray(node) ? node[2] : null;
    if (!Array.isArray(childDefs)) return React.createElement('span', {
      style: base
    });
    const children = childDefs.filter(c => Array.isArray(c) && typeof c[0] === 'string').map((c, i) => React.createElement(c[0], Object.assign({
      key: i
    }, c[1])));
    return React.createElement('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color || 'currentColor',
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      style: base
    }, ...children);
  }
  const THEMES = [['neon-violet', 'Violet', '#9A7CFF'], ['acid-green', 'Acid Green', '#84F24B'], ['neon-lime', 'Lime', '#CCFF42'], ['neon-mint', 'Mint', '#35F0A2'], ['neon-cyan', 'Cyan', '#29E7F2'], ['electric-blue', 'Blue', '#5391FF'], ['hot-magenta', 'Magenta', '#FF3DA1'], ['neon-pink', 'Pink', '#FF73B6'], ['coral', 'Coral', '#FF5E73']];
  function ThemeSwitcher() {
    const [theme, setTheme] = React.useState(() => document.documentElement.dataset.theme || 'neon-violet');
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const current = THEMES.find(t => t[0] === theme) || THEMES[0];
    React.useEffect(() => {
      if (!open) return;
      const onDoc = e => {
        if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      };
      const onKey = e => {
        if (e.key === 'Escape') setOpen(false);
      };
      document.addEventListener('mousedown', onDoc);
      document.addEventListener('keydown', onKey);
      return () => {
        document.removeEventListener('mousedown', onDoc);
        document.removeEventListener('keydown', onKey);
      };
    }, [open]);
    const apply = t => {
      document.documentElement.dataset.theme = t;
      try {
        localStorage.setItem('meeders-theme', t);
      } catch (e) {}
      setTheme(t);
      setOpen(false);
    };
    const swatch = (color, size = 11) => /*#__PURE__*/React.createElement("span", {
      style: {
        width: size,
        height: size,
        borderRadius: 999,
        background: color,
        boxShadow: '0 0 8px -1px ' + color,
        flex: 'none'
      }
    });
    return /*#__PURE__*/React.createElement("div", {
      ref: ref,
      style: {
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(o => !o),
      "aria-haspopup": "listbox",
      "aria-expanded": open,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 34,
        padding: '0 9px 0 11px',
        minWidth: 132,
        background: 'var(--surface-well)',
        border: '1px solid ' + (open ? 'var(--accent)' : 'var(--line-2)'),
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        color: 'var(--ink-2)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        boxShadow: open ? 'var(--glow-soft)' : 'none',
        transition: 'border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out)'
      }
    }, swatch(current[2]), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-1)'
      }
    }, current[1]), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        transform: open ? 'rotate(180deg)' : 'none',
        transition: 'transform var(--dur-1) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "chevron-down",
      size: 13,
      color: "var(--ink-4)"
    }))), open ? /*#__PURE__*/React.createElement("ul", {
      role: "listbox",
      style: {
        position: 'absolute',
        top: 'calc(100% + 6px)',
        right: 0,
        zIndex: 300,
        width: 176,
        margin: 0,
        padding: 5,
        listStyle: 'none',
        background: 'var(--surface-3)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-3)'
      }
    }, THEMES.map(([v, l, c]) => {
      const sel = v === theme;
      return /*#__PURE__*/React.createElement("li", {
        key: v,
        role: "option",
        "aria-selected": sel,
        onClick: () => apply(v),
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 'var(--radius-xs)',
          cursor: 'pointer',
          background: sel ? 'var(--accent-wash)' : 'transparent',
          fontFamily: 'var(--font-mono)',
          fontSize: 12.5,
          color: sel ? 'var(--ink-1)' : 'var(--ink-2)'
        },
        onMouseEnter: e => {
          if (!sel) e.currentTarget.style.background = 'var(--surface-2)';
        },
        onMouseLeave: e => {
          if (!sel) e.currentTarget.style.background = 'transparent';
        }
      }, swatch(c, 13), /*#__PURE__*/React.createElement("span", null, l), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }), sel ? /*#__PURE__*/React.createElement(Icon, {
        name: "check",
        size: 13,
        color: "var(--accent)"
      }) : null);
    })) : null);
  }
  function Wordmark({
    size = 20,
    onClick
  }) {
    return /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: onClick,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none'
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logomark.svg",
      width: size + 8,
      height: size + 8,
      alt: ""
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: size,
        letterSpacing: '-0.02em',
        color: 'var(--ink-1)'
      }
    }, "meese", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--accent)'
      }
    }, ".rs")));
  }
  const NAV = ['Latest', 'Guides', 'Notes', 'Reviews', 'Topics', 'Graph'];
  function NavLink({
    label,
    active,
    onClick
  }) {
    const [hover, setHover] = React.useState(false);
    return /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onClick();
      },
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12.5,
        letterSpacing: '0.02em',
        padding: '7px 11px',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
        color: active ? 'var(--accent-bright)' : hover ? 'var(--ink-1)' : 'var(--ink-3)',
        background: active ? 'var(--accent-wash)' : hover ? 'var(--surface-2)' : 'transparent',
        transition: 'color var(--dur-1) var(--ease-out), background var(--dur-1) var(--ease-out)'
      }
    }, label);
  }
  function SiteHeader({
    navKey,
    onNav,
    onSearch,
    onHome
  }) {
    return /*#__PURE__*/React.createElement("header", {
      style: {
        position: 'sticky',
        top: 0,
        zIndex: 200,
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '0 24px',
        borderBottom: '1px solid var(--line-1)',
        background: 'color-mix(in srgb, var(--bg-void) 82%, transparent)',
        backdropFilter: 'var(--blur-overlay)',
        WebkitBackdropFilter: 'var(--blur-overlay)'
      }
    }, /*#__PURE__*/React.createElement(Wordmark, {
      onClick: e => {
        e.preventDefault();
        onHome();
      }
    }), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginLeft: 8
      }
    }, NAV.map(n => /*#__PURE__*/React.createElement(NavLink, {
      key: n,
      label: n,
      active: navKey === n,
      onClick: () => onNav(n)
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(ThemeSwitcher, null), /*#__PURE__*/React.createElement("button", {
      onClick: onSearch,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        height: 34,
        padding: '0 10px 0 12px',
        background: 'var(--surface-well)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--ink-3)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "search",
      size: 15
    }), /*#__PURE__*/React.createElement("span", null, "Search"), /*#__PURE__*/React.createElement("kbd", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--ink-4)',
        background: 'var(--surface-2)',
        border: '1px solid var(--line-1)',
        borderRadius: 3,
        padding: '1px 5px',
        marginLeft: 4
      }
    }, "\u2318K")));
  }
  function SiteFooter() {
    const links = ['feed.xml', 'feed.json', 'sitemap.xml', 'llms.txt', 'AGENTS.md'];
    return /*#__PURE__*/React.createElement("footer", {
      style: {
        borderTop: '1px solid var(--line-1)',
        marginTop: 64,
        padding: '28px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("img", {
      src: "../../assets/logomark.svg",
      width: "20",
      height: "20",
      alt: ""
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--ink-3)'
      }
    }, "meese.rs \u2014 field notes from a builder")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap'
      }
    }, links.map(l => /*#__PURE__*/React.createElement("a", {
      key: l,
      href: "#",
      onClick: e => e.preventDefault(),
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--ink-4)',
        textDecoration: 'none'
      }
    }, "/", l))));
  }
  window.KIT_CHROME = {
    Icon,
    Wordmark,
    SiteHeader,
    SiteFooter,
    ThemeSwitcher
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Chrome.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/GraphView.jsx
try { (() => {
/* meese.rs UI kit — GraphView (sleek branded concept graph) */
(function () {
  const {
    Badge,
    Button
  } = window.KIT;
  const {
    Icon
  } = window.KIT_CHROME;
  const {
    GRAPH,
    TYPE_HUE,
    POSTS
  } = window.KIT_DATA;
  const W = 1000,
    H = 640;
  const px = n => ({
    x: n.x * W,
    y: n.y * H
  });

  // adjacency
  const adj = {};
  GRAPH.nodes.forEach(n => adj[n.id] = new Set());
  GRAPH.edges.forEach(([a, b]) => {
    adj[a] && adj[a].add(b);
    adj[b] && adj[b].add(a);
  });
  function hueOf(n) {
    return n.kind === 'topic' ? 'var(--accent)' : TYPE_HUE[n.kind] || 'var(--hue-slate)';
  }
  const LEGEND = [['topic', 'var(--accent)'], ['guide', 'var(--hue-cyan)'], ['devlog', 'var(--hue-green)'], ['note', 'var(--hue-slate)'], ['essay', 'var(--hue-violet)'], ['lab', 'var(--hue-gold)'], ['reference', 'var(--hue-rose)']];
  function GraphView({
    onOpenPost,
    onTopic
  }) {
    const [sel, setSel] = React.useState('t:react-native');
    const [hover, setHover] = React.useState(null);
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => {
      const id = requestAnimationFrame(() => setMounted(true));
      return () => cancelAnimationFrame(id);
    }, []);
    const focus = hover || sel;
    const active = React.useMemo(() => {
      if (!focus) return null;
      const s = new Set([focus]);
      adj[focus] && adj[focus].forEach(x => s.add(x));
      return s;
    }, [focus]);
    const isOn = id => !active || active.has(id);
    const edgeOn = (a, b) => !focus || a === focus || b === focus;
    const selNode = GRAPH.nodes.find(n => n.id === sel);
    const selNeighbors = selNode ? GRAPH.nodes.filter(n => adj[sel] && adj[sel].has(n.id)) : [];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 'calc(100vh - var(--header-height))',
        overflow: 'hidden',
        background: 'var(--bg-void)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        inset: 0,
        backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
        backgroundSize: '34px 34px'
      }
    }), /*#__PURE__*/React.createElement(Corners, null), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 22,
        left: 26,
        zIndex: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        color: 'var(--accent)'
      }
    }, "// concept graph"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 'var(--text-2xl)',
        margin: '8px 0 0',
        letterSpacing: '-0.01em'
      }
    }, "How the writing connects"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--ink-3)',
        margin: '8px 0 0',
        maxWidth: '42ch'
      }
    }, "Posts, notes, and the topics that bind them. Hover a node to trace its edges; click to inspect.")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: 24,
        right: 26,
        zIndex: 3,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px 14px',
        maxWidth: 300,
        justifyContent: 'flex-end'
      }
    }, LEGEND.map(([k, c]) => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-3)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 8,
        height: 8,
        borderRadius: 999,
        background: c
      }
    }), k))), /*#__PURE__*/React.createElement("svg", {
      viewBox: `0 0 ${W} ${H}`,
      preserveAspectRatio: "xMidYMid meet",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("g", null, GRAPH.edges.map(([a, b], i) => {
      const na = GRAPH.nodes.find(n => n.id === a),
        nb = GRAPH.nodes.find(n => n.id === b);
      if (!na || !nb) return null;
      const pa = px(na),
        pb = px(nb),
        on = edgeOn(a, b);
      return /*#__PURE__*/React.createElement("line", {
        key: i,
        x1: pa.x,
        y1: pa.y,
        x2: pb.x,
        y2: pb.y,
        stroke: on && focus ? 'var(--accent-deep)' : 'var(--line-2)',
        strokeWidth: on && focus ? 1.4 : 1,
        style: {
          opacity: mounted ? on ? 0.9 : 0.18 : 0,
          transition: 'opacity var(--dur-3) var(--ease-out), stroke var(--dur-2) var(--ease-out)'
        }
      });
    })), /*#__PURE__*/React.createElement("g", null, GRAPH.nodes.map(n => {
      const p = px(n),
        on = isOn(n.id),
        isSel = n.id === sel,
        isTopic = n.kind === 'topic';
      return /*#__PURE__*/React.createElement("g", {
        key: n.id,
        transform: `translate(${p.x},${p.y})`,
        style: {
          cursor: 'pointer',
          opacity: mounted ? on ? 1 : 0.28 : 0,
          transition: 'opacity var(--dur-3) var(--ease-out)'
        },
        onMouseEnter: () => setHover(n.id),
        onMouseLeave: () => setHover(null),
        onClick: () => setSel(n.id)
      }, isSel ? /*#__PURE__*/React.createElement("circle", {
        r: n.r + 7,
        fill: "none",
        stroke: hueOf(n),
        strokeWidth: "1",
        opacity: "0.5"
      }) : null, /*#__PURE__*/React.createElement("circle", {
        r: n.r,
        fill: hueOf(n),
        stroke: "var(--bg-void)",
        strokeWidth: "2",
        style: {
          filter: isSel || n.id === hover ? 'drop-shadow(0 0 8px ' + hueOf(n) + ')' : 'none'
        }
      }), /*#__PURE__*/React.createElement("text", {
        x: n.r + 7,
        y: 4,
        fill: on ? isTopic ? 'var(--ink-1)' : 'var(--ink-2)' : 'var(--ink-4)',
        style: {
          fontFamily: isTopic ? 'var(--font-mono)' : 'var(--font-body)',
          fontSize: isTopic ? 14 : 12.5,
          fontWeight: isTopic ? 600 : 400,
          letterSpacing: isTopic ? '0.02em' : 0
        }
      }, n.label));
    }))), selNode ? /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        bottom: 24,
        left: 26,
        zIndex: 3,
        width: 320,
        background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
        backdropFilter: 'var(--blur-overlay)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-md)',
        padding: 18
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10
      }
    }, selNode.kind === 'topic' ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.1em',
        color: 'var(--accent)',
        background: 'var(--accent-wash)',
        border: '1px solid color-mix(in srgb, var(--accent) 38%, transparent)',
        borderRadius: 'var(--radius-xs)',
        height: 20,
        padding: '0 7px',
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap',
        flex: 'none'
      }
    }, "[ TOPIC ]") : /*#__PURE__*/React.createElement(Badge, {
      type: selNode.kind
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-4)'
      }
    }, selNeighbors.length, " edges")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 17,
        color: 'var(--ink-1)',
        marginBottom: 12
      }
    }, selNode.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        marginBottom: 14,
        maxHeight: 132,
        overflowY: 'auto'
      }
    }, selNeighbors.map(nb => /*#__PURE__*/React.createElement("button", {
      key: nb.id,
      onClick: () => setSel(nb.id),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        background: 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-xs)',
        cursor: 'pointer',
        textAlign: 'left'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-3)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 999,
        background: hueOf(nb),
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--ink-2)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, nb.label)))), /*#__PURE__*/React.createElement(Button, {
      variant: "accent",
      size: "sm",
      fullWidth: true,
      onClick: () => selNode.kind === 'topic' ? onTopic(selNode.label) : onOpenPost(selNode.id)
    }, selNode.kind === 'topic' ? 'Open topic →' : 'Read post →')) : null, /*#__PURE__*/React.createElement("p", {
      style: {
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)'
      }
    }, "This graph shows relationships between posts, notes, topics, and tags. Use the Topics page or Search page for a non-visual navigation path."));
  }
  function Corners() {
    const c = {
      position: 'absolute',
      width: 16,
      height: 16,
      border: '1.5px solid var(--accent-dim)',
      zIndex: 2
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        top: 14,
        left: 14,
        borderRight: 0,
        borderBottom: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        top: 14,
        right: 14,
        borderLeft: 0,
        borderBottom: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        bottom: 14,
        left: 14,
        borderRight: 0,
        borderTop: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        bottom: 14,
        right: 14,
        borderLeft: 0,
        borderTop: 0
      }
    }));
  }
  window.KIT_GRAPH = {
    GraphView
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/GraphView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Home.jsx
try { (() => {
/* meese.rs UI kit — Home (latest-first system index) */
(function () {
  const {
    PostCard,
    NoteCard,
    Tag,
    ReviewCard
  } = window.KIT;
  const {
    Icon
  } = window.KIT_CHROME;
  const {
    POSTS,
    TOPICS,
    REVIEWS
  } = window.KIT_DATA;
  function SectionLabel({
    children,
    action,
    onAction
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sys-label",
      style: {
        color: 'var(--ink-3)'
      }
    }, children), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--line-1)'
      }
    }), action ? /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onAction && onAction();
      },
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-3)',
        textDecoration: 'none',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5
      }
    }, action, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 12
    })) : null);
  }
  function Identity() {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 28,
        alignItems: 'stretch',
        padding: '40px 0 8px',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '1 1 420px',
        minWidth: 280
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        color: 'var(--accent)',
        marginBottom: 14
      }
    }, "// system index"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 'var(--text-3xl)',
        lineHeight: 1.08,
        margin: 0,
        letterSpacing: '-0.02em'
      }
    }, "Practical writing on software,", /*#__PURE__*/React.createElement("br", null), "AI/devtools, and systems-building."), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-md)',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        margin: '18px 0 0',
        maxWidth: '54ch'
      }
    }, "Tactical guides, dev logs, short notes, labs, and references \u2014 long and short in one feed. Built things, learned the tradeoffs, wrote them down.")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        flex: '0 1 280px',
        minWidth: 240,
        background: 'var(--surface-1)',
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--radius-md)',
        padding: 22
      }
    }, /*#__PURE__*/React.createElement(Reticle, null), /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        color: 'var(--ink-3)',
        marginBottom: 16
      }
    }, "// index status"), [['entries', String(POSTS.length).padStart(2, '0')], ['topics', String(TOPICS.length).padStart(2, '0')], ['last write', '2026-06-11'], ['build', 'static · pagefind']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '7px 0',
        borderBottom: '1px solid var(--line-faint)',
        fontFamily: 'var(--font-mono)',
        fontSize: 12
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-4)'
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-1)'
      }
    }, v)))));
  }
  function Reticle() {
    const c = {
      position: 'absolute',
      width: 11,
      height: 11,
      border: '1.5px solid var(--accent-deep)'
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        top: 7,
        left: 7,
        borderRight: 0,
        borderBottom: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        top: 7,
        right: 7,
        borderLeft: 0,
        borderBottom: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        bottom: 7,
        left: 7,
        borderRight: 0,
        borderTop: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        bottom: 7,
        right: 7,
        borderLeft: 0,
        borderTop: 0
      }
    }));
  }
  function TopicRow({
    t,
    onTopic
  }) {
    const [hover, setHover] = React.useState(false);
    return /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onTopic(t.slug);
      },
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 10px',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none',
        background: hover ? 'var(--surface-2)' : 'transparent',
        transition: 'background var(--dur-1) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 7,
        height: 7,
        borderRadius: 999,
        background: t.hue,
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12.5,
        color: hover ? 'var(--ink-1)' : 'var(--ink-2)'
      }
    }, t.label), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-4)'
      }
    }, String(t.count).padStart(2, '0')));
  }
  function GraphTeaser({
    onOpenGraph
  }) {
    return /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenGraph();
      },
      style: {
        display: 'block',
        position: 'relative',
        textDecoration: 'none',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--line-1)',
        overflow: 'hidden',
        background: 'var(--bg-void)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 132,
        position: 'relative',
        backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
        backgroundSize: '22px 22px'
      }
    }, /*#__PURE__*/React.createElement("svg", {
      viewBox: "0 0 240 132",
      style: {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%'
      }
    }, /*#__PURE__*/React.createElement("line", {
      x1: "60",
      y1: "44",
      x2: "120",
      y2: "80",
      stroke: "var(--line-2)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "120",
      y1: "80",
      x2: "186",
      y2: "50",
      stroke: "var(--line-2)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "120",
      y1: "80",
      x2: "96",
      y2: "112",
      stroke: "var(--line-2)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "186",
      y1: "50",
      x2: "60",
      y2: "44",
      stroke: "var(--line-2)",
      strokeWidth: "1"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "120",
      cy: "80",
      r: "8",
      fill: "var(--accent)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "60",
      cy: "44",
      r: "5.5",
      fill: "var(--accent)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "186",
      cy: "50",
      r: "6",
      fill: "var(--accent)"
    }), /*#__PURE__*/React.createElement("circle", {
      cx: "96",
      cy: "112",
      r: "4.5",
      fill: "var(--hue-violet)"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderTop: '1px solid var(--line-1)'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 15,
        color: 'var(--ink-1)'
      }
    }, "Concept graph"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-4)',
        marginTop: 2
      }
    }, "posts \xB7 topics \xB7 backlinks")), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Icon, {
      name: "git-fork",
      size: 18,
      color: "var(--ink-3)"
    })));
  }
  function FeaturedReview({
    onOpenPost,
    onOpenReviews
  }) {
    const reviews = POSTS.filter(p => p.type === 'review').sort((a, b) => a.date < b.date ? 1 : -1);
    const post = reviews[0];
    if (!post || !ReviewCard) return null;
    const r = REVIEWS[post.slug] || {};
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 30
      }
    }, /*#__PURE__*/React.createElement(SectionLabel, {
      action: `all reviews · ${String(reviews.length).padStart(2, '0')}`,
      onAction: onOpenReviews
    }, "// latest review"), /*#__PURE__*/React.createElement(ReviewCard, {
      subject: post.subject,
      version: post.version,
      oneLiner: post.description,
      score: r.score,
      verdict: r.verdict,
      date: post.date,
      topics: post.topics,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenPost(post.slug);
      }
    }));
  }
  function Home({
    onOpenPost,
    onOpenGraph,
    onOpenReviews,
    onSearch,
    onTopic
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--max-shell)',
        margin: '0 auto',
        padding: '0 24px 24px'
      }
    }, /*#__PURE__*/React.createElement(Identity, null), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 300px',
        gap: 40,
        marginTop: 36,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(FeaturedReview, {
      onOpenPost: onOpenPost,
      onOpenReviews: onOpenReviews
    }), /*#__PURE__*/React.createElement(SectionLabel, {
      action: `all writing · ${String(POSTS.filter(p => p.type !== 'review').length).padStart(2, '0')}`,
      onAction: () => onTopic('all')
    }, "// latest writing"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, POSTS.filter(p => p.type !== 'review').map(p => p.type === 'note' ? /*#__PURE__*/React.createElement(NoteCard, {
      key: p.slug,
      title: p.title,
      body: p.description,
      date: p.date,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenPost(p.slug);
      }
    }) : /*#__PURE__*/React.createElement(PostCard, {
      key: p.slug,
      title: p.title,
      description: p.description,
      type: p.type,
      date: p.date,
      updated: p.updated,
      readingTime: p.readingTime,
      topics: p.topics,
      featured: p.featured,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenPost(p.slug);
      }
    })))), /*#__PURE__*/React.createElement("aside", {
      style: {
        position: 'sticky',
        top: 'calc(var(--header-height) + 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 28
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, {
      action: "topics",
      onAction: () => onTopic('index')
    }, "// active topics"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }
    }, TOPICS.slice(0, 6).map(t => /*#__PURE__*/React.createElement(TopicRow, {
      key: t.slug,
      t: t,
      onTopic: onTopic
    })))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "// graph"), /*#__PURE__*/React.createElement(GraphTeaser, {
      onOpenGraph: onOpenGraph
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionLabel, null, "// search"), /*#__PURE__*/React.createElement("button", {
      onClick: onSearch,
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        background: 'var(--surface-well)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--ink-3)',
        cursor: 'pointer',
        fontFamily: 'var(--font-mono)',
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--accent)',
        fontWeight: 600
      }
    }, "/"), /*#__PURE__*/React.createElement("span", null, "Search the index\u2026"))))));
  }
  window.KIT_HOME = {
    Home
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Home.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ListView.jsx
try { (() => {
/* meese.rs UI kit — ListView: filtered feed for Guides / Notes / all writing / topics */
(function () {
  const {
    PostCard,
    NoteCard,
    ReviewCard,
    Tag
  } = window.KIT;
  const {
    Icon
  } = window.KIT_CHROME;
  const {
    POSTS,
    REVIEWS
  } = window.KIT_DATA;
  function baseSet(spec) {
    if (spec.kind === 'type') return POSTS.filter(p => p.type === spec.value);
    if (spec.kind === 'topic') return POSTS.filter(p => p.topics.includes(spec.value));
    return POSTS.filter(p => p.type !== 'review'); // 'all' = writing
  }
  function renderCard(p, onOpenPost, onTopic) {
    const open = e => {
      e.preventDefault();
      onOpenPost(p.slug);
    };
    if (p.type === 'review') {
      const r = REVIEWS[p.slug] || {};
      return /*#__PURE__*/React.createElement(ReviewCard, {
        key: p.slug,
        subject: p.subject,
        version: p.version,
        oneLiner: p.description,
        score: r.score,
        verdict: r.verdict,
        date: p.date,
        topics: p.topics,
        href: "#",
        onClick: open
      });
    }
    if (p.type === 'note') {
      return /*#__PURE__*/React.createElement(NoteCard, {
        key: p.slug,
        title: p.title,
        body: p.description,
        date: p.date,
        href: "#",
        onClick: open
      });
    }
    return /*#__PURE__*/React.createElement(PostCard, {
      key: p.slug,
      title: p.title,
      description: p.description,
      type: p.type,
      date: p.date,
      updated: p.updated,
      readingTime: p.readingTime,
      topics: p.topics,
      featured: p.featured,
      href: "#",
      onClick: open
    });
  }
  function ListView({
    spec,
    onOpenPost,
    onBack,
    backLabel,
    onTopic
  }) {
    const [topic, setTopic] = React.useState(null);
    React.useEffect(() => {
      setTopic(null);
    }, [spec.kind, spec.value]);
    const base = baseSet(spec).slice().sort((a, b) => a.date < b.date ? 1 : -1);
    const topics = [...new Set(base.flatMap(p => p.topics))].sort();
    const visible = topic ? base.filter(p => p.topics.includes(topic)) : base;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--max-shell)',
        margin: '0 auto',
        padding: '28px 24px 24px'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onBack();
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-3)',
        textDecoration: 'none',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 13
    }), " back to ", backLabel || 'index'), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 'var(--text-3xl)',
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        margin: 0
      }
    }, spec.title), spec.subtitle ? /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-md)',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        margin: '14px 0 0',
        maxWidth: '58ch'
      }
    }, spec.subtitle) : null, topics.length > 1 ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        margin: '24px 0 6px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sys-label",
      style: {
        marginRight: 2
      }
    }, "topic"), /*#__PURE__*/React.createElement(Tag, {
      active: !topic,
      onClick: () => setTopic(null)
    }, "all"), topics.map(t => /*#__PURE__*/React.createElement(Tag, {
      key: t,
      active: topic === t,
      onClick: () => setTopic(topic === t ? null : t)
    }, t))) : null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        margin: '18px 0 16px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--line-1)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-4)'
      }
    }, String(visible.length).padStart(2, '0'), " entries")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, visible.map(p => renderCard(p, onOpenPost, onTopic)), visible.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '40px 0',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: 'var(--ink-4)'
      }
    }, "no entries here yet") : null));
  }
  window.KIT_LIST = {
    ListView
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ListView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/PostView.jsx
try { (() => {
/* meese.rs UI kit — PostView (long-form reading page, block-rendered per post) */
(function () {
  const {
    Badge,
    Tag,
    Callout
  } = window.KIT;
  const {
    Icon
  } = window.KIT_CHROME;
  const {
    POSTS,
    BODIES
  } = window.KIT_DATA;
  const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const inline = s => (s || '').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  function Corners({
    c = 'var(--accent-deep)'
  }) {
    const s = {
      position: 'absolute',
      width: 11,
      height: 11,
      border: '1.5px solid ' + c
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        ...s,
        top: 8,
        left: 8,
        borderRight: 0,
        borderBottom: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...s,
        top: 8,
        right: 8,
        borderLeft: 0,
        borderBottom: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...s,
        bottom: 8,
        left: 8,
        borderRight: 0,
        borderTop: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...s,
        bottom: 8,
        right: 8,
        borderLeft: 0,
        borderTop: 0
      }
    }));
  }
  function Figure({
    caption,
    kind
  }) {
    const icon = {
      screenshot: 'image',
      diagram: 'git-fork',
      chart: 'bar-chart-3'
    }[kind] || 'image';
    return /*#__PURE__*/React.createElement("figure", {
      style: {
        margin: '26px 0'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 210,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--line-2)',
        overflow: 'hidden',
        background: 'var(--bg-void)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)',
        backgroundSize: '26px 26px'
      }
    }, /*#__PURE__*/React.createElement(Corners, {
      c: "var(--accent-dim)"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 30,
      color: "var(--accent)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--ink-4)'
      }
    }, kind || 'figure', " \xB7 placeholder"))), /*#__PURE__*/React.createElement("figcaption", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-3)',
        marginTop: 10,
        lineHeight: 1.5
      }
    }, caption));
  }
  function Block({
    b
  }) {
    const [t] = b;
    if (t === 'h') return /*#__PURE__*/React.createElement("h2", {
      id: slugify(b[1]),
      style: {
        fontSize: 'var(--text-xl)'
      }
    }, b[1]);
    if (t === 'p') return /*#__PURE__*/React.createElement("p", {
      dangerouslySetInnerHTML: {
        __html: inline(b[1])
      }
    });
    if (t === 'code') return /*#__PURE__*/React.createElement("pre", null, /*#__PURE__*/React.createElement("code", null, b[1]));
    if (t === 'quote') return /*#__PURE__*/React.createElement("blockquote", null, b[1]);
    if (t === 'ul') return /*#__PURE__*/React.createElement("ul", null, b[1].map((it, i) => /*#__PURE__*/React.createElement("li", {
      key: i,
      dangerouslySetInnerHTML: {
        __html: inline(it)
      }
    })));
    if (t === 'callout') return /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '20px 0'
      }
    }, /*#__PURE__*/React.createElement(Callout, {
      type: b[1],
      title: b[2]
    }, b[3]));
    if (t === 'figure') return /*#__PURE__*/React.createElement(Figure, {
      caption: b[1],
      kind: b[2]
    });
    if (t === 'table') {
      const [head, ...rows] = b[1];
      return /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, head.map((h, i) => /*#__PURE__*/React.createElement("th", {
        key: i
      }, h)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
        key: i
      }, r.map((c, j) => /*#__PURE__*/React.createElement("td", {
        key: j
      }, c))))));
    }
    return null;
  }
  function PostView({
    slug,
    onOpenPost,
    onBack,
    backLabel,
    onTopic
  }) {
    const post = POSTS.find(p => p.slug === slug) || POSTS[0];
    const body = BODIES[post.slug] || [];
    const toc = body.filter(b => b[0] === 'h').map(b => [slugify(b[1]), b[1]]);
    const related = POSTS.filter(p => p.slug !== post.slug && p.type !== 'review' && p.topics.some(t => post.topics.includes(t))).slice(0, 2);
    const sameTopic = POSTS.filter(p => p.slug !== post.slug && p.type !== 'review').slice(0, 3);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--max-shell)',
        margin: '0 auto',
        padding: '28px 24px 24px'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onBack();
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-3)',
        textDecoration: 'none',
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 13
    }), " back to ", backLabel || 'index'), /*#__PURE__*/React.createElement("header", {
      style: {
        maxWidth: '74ch',
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 18
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      type: post.type
    }), post.updated ? /*#__PURE__*/React.createElement(Badge, {
      status: "updated"
    }) : null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-3)'
      }
    }, post.date, post.readingTime ? '  ·  ' + post.readingTime : '')), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 'var(--text-3xl)',
        lineHeight: 1.1,
        letterSpacing: '-0.02em',
        margin: 0,
        textWrap: 'balance'
      }
    }, post.title), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-md)',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        marginTop: 16
      }
    }, post.description), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 18,
        flexWrap: 'wrap'
      }
    }, post.topics.map(t => /*#__PURE__*/React.createElement(Tag, {
      key: t,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onTopic(t);
      }
    }, t)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: toc.length ? '200px minmax(0,1fr)' : 'minmax(0,1fr)',
        gap: 48,
        marginTop: 36,
        alignItems: 'start'
      }
    }, toc.length ? /*#__PURE__*/React.createElement("nav", {
      style: {
        position: 'sticky',
        top: 'calc(var(--header-height) + 24px)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        marginBottom: 12
      }
    }, "// on this page"), /*#__PURE__*/React.createElement("ul", {
      style: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        borderLeft: '1px solid var(--line-1)'
      }
    }, toc.map(([id, label], i) => /*#__PURE__*/React.createElement("li", {
      key: id
    }, /*#__PURE__*/React.createElement("a", {
      href: '#' + id,
      style: {
        display: 'block',
        padding: '5px 0 5px 14px',
        marginLeft: '-1px',
        borderLeft: '2px solid ' + (i === 0 ? 'var(--accent)' : 'transparent'),
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        textDecoration: 'none',
        color: i === 0 ? 'var(--accent-bright)' : 'var(--ink-3)'
      }
    }, label))))) : null, /*#__PURE__*/React.createElement("div", null, post.updated ? /*#__PURE__*/React.createElement(UpdateBanner, {
      date: post.updated
    }) : null, /*#__PURE__*/React.createElement("article", {
      className: "prose"
    }, body.map((b, i) => /*#__PURE__*/React.createElement(Block, {
      key: i,
      b: b
    }))), /*#__PURE__*/React.createElement("section", {
      style: {
        marginTop: 56,
        borderTop: '1px solid var(--line-1)',
        paddingTop: 28
      }
    }, related.length ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        marginBottom: 16
      }
    }, "// related"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
      }
    }, related.map(p => /*#__PURE__*/React.createElement(RelatedCard, {
      key: p.slug,
      post: p,
      onOpenPost: onOpenPost
    })))) : null, /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        margin: '28px 0 12px'
      }
    }, "// same topic"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column'
      }
    }, sameTopic.map((p, i) => /*#__PURE__*/React.createElement("a", {
      key: p.slug,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenPost(p.slug);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '11px 0',
        borderTop: i === 0 ? 'none' : '1px solid var(--line-faint)',
        textDecoration: 'none'
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      type: p.type
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 14.5,
        color: 'var(--ink-2)'
      }
    }, p.title), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-4)'
      }
    }, p.date))))))));
  }
  function UpdateBanner({
    date
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        marginBottom: 28,
        background: 'var(--green-wash)',
        border: '1px solid color-mix(in srgb, var(--green) 30%, transparent)',
        borderRadius: 'var(--radius-sm)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "refresh-cw",
      size: 15,
      color: "var(--green)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--green)',
        letterSpacing: '0.02em'
      }
    }, "UPDATED ", date), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13.5,
        color: 'var(--ink-2)'
      }
    }, "\u2014 revised since first publish."));
  }
  function RelatedCard({
    post,
    onOpenPost
  }) {
    const [hover, setHover] = React.useState(false);
    return /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenPost(post.slug);
      },
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        display: 'block',
        textDecoration: 'none',
        padding: '14px 16px',
        background: hover ? 'var(--surface-2)' : 'var(--surface-1)',
        border: '1px solid ' + (hover ? 'var(--line-2)' : 'var(--line-1)'),
        borderRadius: 'var(--radius-md)',
        transition: 'all var(--dur-1) var(--ease-out)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      type: post.type
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 15,
        color: hover ? 'var(--accent-bright)' : 'var(--ink-1)',
        lineHeight: 1.3
      }
    }, post.title));
  }
  window.KIT_POST = {
    PostView
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/PostView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ReviewView.jsx
try { (() => {
/* meese.rs UI kit — ReviewView (full software / library review layout) */
(function () {
  const {
    Badge,
    Tag
  } = window.KIT;
  const {
    Icon
  } = window.KIT_CHROME;
  const {
    REVIEWS,
    POSTS
  } = window.KIT_DATA;
  function Stars({
    score,
    size = 15
  }) {
    const pct = Math.max(0, Math.min(100, score / 5 * 100));
    return /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative',
        display: 'inline-block',
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '2px',
        fontFamily: 'var(--font-mono)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--line-3)'
      }
    }, "\u2605\u2605\u2605\u2605\u2605"), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: pct + '%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        color: 'var(--accent)'
      }
    }, "\u2605\u2605\u2605\u2605\u2605"));
  }
  const VERDICT = {
    recommended: 'var(--green)',
    caveats: 'var(--gold)',
    watch: 'var(--accent)',
    skip: 'var(--red)'
  };
  function ReviewView({
    slug,
    onBack,
    backLabel,
    onOpenPost
  }) {
    const r = REVIEWS[slug] || REVIEWS[Object.keys(REVIEWS)[0]];
    const vcolor = VERDICT[r.verdict] || 'var(--green)';
    const related = POSTS.filter(p => p.slug !== slug && p.topics.some(t => (r.topics || []).includes(t)));
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--max-shell)',
        margin: '0 auto',
        padding: '28px 24px 24px'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onBack();
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-3)',
        textDecoration: 'none',
        marginBottom: 28
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 13
    }), " back to ", backLabel || 'index'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'minmax(0,1fr) 300px',
        gap: 44,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      type: "review"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 600,
        letterSpacing: '0.1em',
        color: vcolor,
        border: '1px solid color-mix(in srgb, ' + vcolor + ' 40%, transparent)',
        background: 'color-mix(in srgb, ' + vcolor + ' 12%, transparent)',
        borderRadius: 'var(--radius-xs)',
        height: 20,
        padding: '0 7px',
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap'
      }
    }, (r.verdictLabel || r.verdict).toUpperCase()), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        color: 'var(--ink-3)'
      }
    }, "reviewed ", r.reviewed)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 12,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 'var(--text-3xl)',
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        margin: 0
      }
    }, r.subject), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-md)',
        color: 'var(--ink-4)'
      }
    }, r.version)), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-md)',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        margin: '14px 0 0',
        maxWidth: '60ch'
      }
    }, r.tagline), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        marginTop: 22,
        padding: '16px 18px',
        background: 'var(--surface-1)',
        border: '1px solid var(--line-1)',
        borderLeft: '2px solid var(--accent)',
        borderRadius: 'var(--radius-md)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 38,
        fontWeight: 700,
        color: 'var(--ink-1)',
        lineHeight: 1
      }
    }, r.score.toFixed(1)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: 'var(--ink-4)'
      }
    }, "/ 5")), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        alignSelf: 'stretch',
        background: 'var(--line-2)'
      }
    }), /*#__PURE__*/React.createElement(Stars, {
      score: r.score,
      size: 20
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, r.links.map(([k, v]) => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--ink-3)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-sm)',
        padding: '5px 9px'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: k === 'repo' ? 'github' : 'book-open',
      size: 12
    }), v)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px 24px',
        marginTop: 16
      }
    }, r.meta.map(([k, v]) => /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--ink-4)'
      }
    }, k, ": ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-2)'
      }
    }, v)))), /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        margin: '34px 0 14px'
      }
    }, "// score breakdown"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, r.criteria.map(([name, s, note]) => /*#__PURE__*/React.createElement("div", {
      key: name,
      style: {
        display: 'grid',
        gridTemplateColumns: '170px 120px 1fr',
        gap: 16,
        alignItems: 'start'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 14.5,
        fontWeight: 600,
        color: 'var(--ink-1)'
      }
    }, name), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7
      }
    }, /*#__PURE__*/React.createElement(Stars, {
      score: s,
      size: 13
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        color: 'var(--ink-3)'
      }
    }, s.toFixed(1))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13.5,
        color: 'var(--ink-2)',
        lineHeight: 1.5
      }
    }, note)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
        marginTop: 30
      }
    }, /*#__PURE__*/React.createElement(ProsCons, {
      title: "Pros",
      items: r.pros,
      icon: "plus",
      color: "var(--green)"
    }), /*#__PURE__*/React.createElement(ProsCons, {
      title: "Cons",
      items: r.cons,
      icon: "minus",
      color: "var(--red)"
    })), /*#__PURE__*/React.createElement("article", {
      className: "prose",
      style: {
        marginTop: 36,
        maxWidth: 'none'
      }
    }, r.body.map(([h, p]) => /*#__PURE__*/React.createElement(React.Fragment, {
      key: h
    }, /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: 'var(--text-xl)'
      }
    }, h), /*#__PURE__*/React.createElement("p", {
      dangerouslySetInnerHTML: {
        __html: p.replace(/`([^`]+)`/g, '<code>$1</code>')
      }
    })))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 28,
        padding: '18px 20px',
        background: 'color-mix(in srgb, var(--accent) 9%, var(--surface-1))',
        border: '1px solid var(--accent-line)',
        borderRadius: 'var(--radius-md)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.14em',
        color: 'var(--accent)',
        marginBottom: 8
      }
    }, "// THE BOTTOM LINE"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        lineHeight: 1.6,
        color: 'var(--ink-1)',
        margin: 0
      }
    }, r.bottomLine))), /*#__PURE__*/React.createElement("aside", {
      style: {
        position: 'sticky',
        top: 'calc(var(--header-height) + 24px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 22
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        padding: 20,
        background: 'var(--surface-1)',
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--radius-md)'
      }
    }, /*#__PURE__*/React.createElement(Reticle, null), /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        marginBottom: 14
      }
    }, "// verdict"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 6,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 44,
        fontWeight: 700,
        color: 'var(--ink-1)',
        lineHeight: 1
      }
    }, r.score.toFixed(1)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 15,
        color: 'var(--ink-4)'
      }
    }, "/ 5")), /*#__PURE__*/React.createElement(Stars, {
      score: r.score,
      size: 18
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 14,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.08em',
        color: vcolor
      }
    }, (r.verdictLabel || '').toUpperCase())), related.length ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "sys-label",
      style: {
        marginBottom: 12
      }
    }, "// related"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }
    }, related.slice(0, 3).map(p => /*#__PURE__*/React.createElement("a", {
      key: p.slug,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenPost(p.slug);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '9px 8px',
        borderRadius: 'var(--radius-sm)',
        textDecoration: 'none'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement(Badge, {
      type: p.type
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--ink-2)',
        lineHeight: 1.3
      }
    }, p.title))))) : null)));
  }
  function ProsCons({
    title,
    items,
    icon,
    color
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        background: 'var(--surface-1)',
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--radius-md)',
        padding: '16px 18px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: color,
        marginBottom: 12
      }
    }, title), /*#__PURE__*/React.createElement("ul", {
      style: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 9
      }
    }, items.map((it, i) => /*#__PURE__*/React.createElement("li", {
      key: i,
      style: {
        display: 'flex',
        gap: 9,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-flex',
        color: color,
        marginTop: 2,
        flex: 'none'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 13
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13.5,
        color: 'var(--ink-2)',
        lineHeight: 1.45
      }
    }, it)))));
  }
  function Reticle() {
    const c = {
      position: 'absolute',
      width: 10,
      height: 10,
      border: '1.5px solid var(--accent-deep)'
    };
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        top: 7,
        left: 7,
        borderRight: 0,
        borderBottom: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        top: 7,
        right: 7,
        borderLeft: 0,
        borderBottom: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        bottom: 7,
        left: 7,
        borderRight: 0,
        borderTop: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        ...c,
        bottom: 7,
        right: 7,
        borderLeft: 0,
        borderTop: 0
      }
    }));
  }
  window.KIT_REVIEW = {
    ReviewView
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ReviewView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ReviewsView.jsx
try { (() => {
/* meese.rs UI kit — ReviewsView (index of all software / library reviews) */
(function () {
  const {
    ReviewCard,
    Tag
  } = window.KIT;
  const {
    Icon
  } = window.KIT_CHROME;
  const {
    POSTS,
    REVIEWS
  } = window.KIT_DATA;
  function Stars({
    score,
    size = 16
  }) {
    const pct = Math.max(0, Math.min(100, score / 5 * 100));
    return /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'relative',
        display: 'inline-block',
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '2px',
        fontFamily: 'var(--font-mono)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--line-3)'
      }
    }, "\u2605\u2605\u2605\u2605\u2605"), /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: pct + '%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        color: 'var(--accent)'
      }
    }, "\u2605\u2605\u2605\u2605\u2605"));
  }
  function ReviewsView({
    onOpenPost,
    onBack,
    backLabel,
    onTopic
  }) {
    const [sort, setSort] = React.useState('recent'); // recent | score
    const [topic, setTopic] = React.useState(null);
    const all = POSTS.filter(p => p.type === 'review').map(p => ({
      ...p,
      r: REVIEWS[p.slug] || {}
    }));
    const topics = [...new Set(all.flatMap(p => p.topics))].sort();
    const reviews = topic ? all.filter(p => p.topics.includes(topic)) : all;
    const sorted = [...reviews].sort((a, b) => sort === 'score' ? (b.r.score || 0) - (a.r.score || 0) : a.date < b.date ? 1 : -1);
    const avg = reviews.length ? reviews.reduce((s, x) => s + (x.r.score || 0), 0) / reviews.length : 0;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--max-shell)',
        margin: '0 auto',
        padding: '28px 24px 24px'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onBack();
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-3)',
        textDecoration: 'none',
        marginBottom: 26
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 13
    }), " back to ", backLabel || 'index'), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: 24,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '1 1 360px'
      }
    }, /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 'var(--text-3xl)',
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        margin: 0
      }
    }, "Reviews"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-md)',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        margin: '14px 0 0',
        maxWidth: '56ch'
      }
    }, "Honest, score-backed takes on the software and libraries I actually run. Each one is a full breakdown \u2014 performance, DX, tradeoffs \u2014 not a press release.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 22,
        padding: '16px 20px',
        background: 'var(--surface-1)',
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--radius-md)'
      }
    }, /*#__PURE__*/React.createElement(Stat, {
      label: "reviews",
      value: String(reviews.length).padStart(2, '0')
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 1,
        background: 'var(--line-2)'
      }
    }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--ink-4)',
        marginBottom: 6
      }
    }, "avg score"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--ink-1)',
        lineHeight: 1
      }
    }, avg.toFixed(1)), /*#__PURE__*/React.createElement(Stars, {
      score: avg,
      size: 13
    }))))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
        margin: '26px 0 16px'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sys-label",
      style: {
        marginRight: 2
      }
    }, "topic"), /*#__PURE__*/React.createElement(Tag, {
      active: !topic,
      onClick: () => setTopic(null)
    }, "all"), topics.map(t => /*#__PURE__*/React.createElement(Tag, {
      key: t,
      active: topic === t,
      onClick: () => setTopic(topic === t ? null : t)
    }, t)), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "sys-label"
    }, "sort"), [['recent', 'newest'], ['score', 'highest rated']].map(([v, l]) => /*#__PURE__*/React.createElement("button", {
      key: v,
      onClick: () => setSort(v),
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11.5,
        padding: '5px 11px',
        borderRadius: 'var(--radius-pill)',
        cursor: 'pointer',
        border: '1px solid ' + (sort === v ? 'var(--accent-deep)' : 'var(--line-2)'),
        background: sort === v ? 'var(--accent-wash)' : 'transparent',
        color: sort === v ? 'var(--accent-bright)' : 'var(--ink-3)'
      }
    }, l))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 16
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--line-1)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-4)'
      }
    }, String(reviews.length).padStart(2, '0'), " entries")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14
      }
    }, sorted.map(p => /*#__PURE__*/React.createElement(ReviewCard, {
      key: p.slug,
      subject: p.subject,
      version: p.version,
      oneLiner: p.description,
      score: p.r.score,
      verdict: p.r.verdict,
      date: p.date,
      topics: p.topics,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenPost(p.slug);
      }
    }))));
  }
  function Stat({
    label,
    value
  }) {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-2xs)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--ink-4)',
        marginBottom: 6
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 22,
        fontWeight: 700,
        color: 'var(--ink-1)',
        lineHeight: 1
      }
    }, value));
  }
  window.KIT_REVIEWS = {
    ReviewsView
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ReviewsView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/SearchOverlay.jsx
try { (() => {
/* meese.rs UI kit — SearchOverlay (static Pagefind-style search) */
(function () {
  const {
    Badge,
    Input,
    Tag
  } = window.KIT;
  const {
    Icon
  } = window.KIT_CHROME;
  const {
    POSTS
  } = window.KIT_DATA;
  const TYPES = ['guide', 'note', 'devlog', 'essay', 'lab', 'reference'];
  function SearchOverlay({
    onClose,
    onOpenPost
  }) {
    const [q, setQ] = React.useState('');
    const [typeFilter, setTypeFilter] = React.useState(null);
    const inputRef = React.useRef(null);
    React.useEffect(() => {
      const t = setTimeout(() => {
        const el = document.getElementById('kit-search-input');
        el && el.focus();
      }, 30);
      return () => clearTimeout(t);
    }, []);
    const results = POSTS.filter(p => {
      if (typeFilter && p.type !== typeFilter) return false;
      if (!q.trim()) return true;
      const hay = (p.title + ' ' + p.description + ' ' + p.topics.join(' ') + ' ' + p.tags.join(' ')).toLowerCase();
      return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
    });
    return /*#__PURE__*/React.createElement("div", {
      onClick: onClose,
      style: {
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'color-mix(in srgb, var(--bg-void) 70%, transparent)',
        backdropFilter: 'var(--blur-overlay)',
        WebkitBackdropFilter: 'var(--blur-overlay)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: '12vh 20px 20px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: e => e.stopPropagation(),
      style: {
        width: '100%',
        maxWidth: 640,
        background: 'var(--surface-1)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-3)',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 14,
        borderBottom: '1px solid var(--line-1)',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 44,
        padding: '0 12px',
        background: 'var(--surface-well)',
        border: '1px solid var(--line-2)',
        borderRadius: 'var(--radius-md)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--accent)',
        fontFamily: 'var(--font-mono)',
        fontWeight: 600
      }
    }, "/"), /*#__PURE__*/React.createElement("input", {
      id: "kit-search-input",
      value: q,
      onChange: e => setQ(e.target.value),
      placeholder: "Search the index\u2026",
      style: {
        flex: 1,
        minWidth: 0,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--ink-1)',
        fontFamily: 'var(--font-mono)',
        fontSize: 14
      }
    })), /*#__PURE__*/React.createElement("button", {
      onClick: onClose,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--ink-4)',
        background: 'var(--surface-2)',
        border: '1px solid var(--line-1)',
        borderRadius: 3,
        padding: '4px 7px',
        cursor: 'pointer'
      }
    }, "ESC")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '12px 16px',
        borderBottom: '1px solid var(--line-1)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "sys-label",
      style: {
        marginRight: 2
      }
    }, "type"), /*#__PURE__*/React.createElement(Tag, {
      active: !typeFilter,
      onClick: () => setTypeFilter(null)
    }, "all"), TYPES.map(t => /*#__PURE__*/React.createElement(Tag, {
      key: t,
      active: typeFilter === t,
      onClick: () => setTypeFilter(typeFilter === t ? null : t)
    }, t))), /*#__PURE__*/React.createElement("div", {
      style: {
        maxHeight: '48vh',
        overflowY: 'auto'
      }
    }, results.length === 0 ? /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '40px 16px',
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        color: 'var(--ink-4)'
      }
    }, "no entries match \"", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--ink-2)'
      }
    }, q), "\"") : results.map((p, i) => /*#__PURE__*/React.createElement("a", {
      key: p.slug,
      href: "#",
      onClick: e => {
        e.preventDefault();
        onOpenPost(p.slug);
      },
      style: {
        display: 'block',
        padding: '14px 16px',
        textDecoration: 'none',
        borderTop: i === 0 ? 'none' : '1px solid var(--line-faint)'
      },
      onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-2)',
      onMouseLeave: e => e.currentTarget.style.background = 'transparent'
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement(Badge, {
      type: p.type
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-display)',
        fontWeight: 600,
        fontSize: 15,
        color: 'var(--ink-1)'
      }
    }, p.title), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-4)'
      }
    }, p.date)), /*#__PURE__*/React.createElement(Excerpt, {
      text: p.description,
      q: q
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 8
      }
    }, p.topics.map(t => /*#__PURE__*/React.createElement("span", {
      key: t,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5,
        color: 'var(--ink-4)'
      }
    }, "#", t)))))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '9px 16px',
        borderTop: '1px solid var(--line-1)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--surface-well)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "zap",
      size: 12,
      color: "var(--ink-4)"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-4)'
      }
    }, "static index \xB7 ", String(results.length).padStart(2, '0'), " / ", String(POSTS.length).padStart(2, '0'), " entries"))));
  }
  function Excerpt({
    text,
    q
  }) {
    const term = q.trim().split(/\s+/)[0];
    if (!term) return /*#__PURE__*/React.createElement("p", {
      style: ex
    }, text);
    const idx = text.toLowerCase().indexOf(term.toLowerCase());
    if (idx < 0) return /*#__PURE__*/React.createElement("p", {
      style: ex
    }, text);
    return /*#__PURE__*/React.createElement("p", {
      style: ex
    }, text.slice(0, idx), /*#__PURE__*/React.createElement("mark", {
      style: {
        background: 'var(--accent-wash-2)',
        color: 'var(--accent-bright)',
        padding: '0 2px',
        borderRadius: 2
      }
    }, text.slice(idx, idx + term.length)), text.slice(idx + term.length));
  }
  const ex = {
    fontFamily: 'var(--font-body)',
    fontSize: 13.5,
    color: 'var(--ink-3)',
    lineHeight: 1.5,
    margin: 0,
    maxWidth: '64ch'
  };
  window.KIT_SEARCH = {
    SearchOverlay
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SearchOverlay.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/TopicsView.jsx
try { (() => {
/* meese.rs UI kit — TopicsView: the topic index */
(function () {
  const {
    Icon
  } = window.KIT_CHROME;
  const {
    POSTS,
    TOPICS
  } = window.KIT_DATA;
  function TopicsView({
    onTopic,
    onBack,
    backLabel
  }) {
    // live counts from POSTS
    const counts = {};
    POSTS.forEach(p => p.topics.forEach(t => {
      counts[t] = (counts[t] || 0) + 1;
    }));
    const list = TOPICS.map(t => ({
      ...t,
      count: counts[t.slug] || t.count
    })).sort((a, b) => b.count - a.count);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: 'var(--max-shell)',
        margin: '0 auto',
        padding: '28px 24px 24px'
      }
    }, /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onBack();
      },
      style: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-3)',
        textDecoration: 'none',
        marginBottom: 24
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-left",
      size: 13
    }), " back to ", backLabel || 'index'), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: 'var(--text-3xl)',
        lineHeight: 1.05,
        letterSpacing: '-0.02em',
        margin: 0
      }
    }, "Topics"), /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-md)',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        margin: '14px 0 0',
        maxWidth: '56ch'
      }
    }, "The higher-level threads running through the writing. Open one for everything filed under it."), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))',
        gap: 12,
        marginTop: 28
      }
    }, list.map(t => /*#__PURE__*/React.createElement(TopicCard, {
      key: t.slug,
      t: t,
      onTopic: onTopic
    }))));
  }
  function TopicCard({
    t,
    onTopic
  }) {
    const [hover, setHover] = React.useState(false);
    return /*#__PURE__*/React.createElement("a", {
      href: "#",
      onClick: e => {
        e.preventDefault();
        onTopic(t.slug);
      },
      onMouseEnter: () => setHover(true),
      onMouseLeave: () => setHover(false),
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        textDecoration: 'none',
        padding: '16px 18px',
        borderRadius: 'var(--radius-md)',
        background: hover ? 'var(--surface-2)' : 'var(--surface-1)',
        border: '1px solid ' + (hover ? 'var(--line-2)' : 'var(--line-1)'),
        transition: 'all var(--dur-1) var(--ease-out)',
        transform: hover ? 'translateY(-2px)' : 'none'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 9,
        height: 9,
        borderRadius: 999,
        background: t.hue,
        boxShadow: hover ? '0 0 9px -1px ' + t.hue : 'none',
        flex: 'none'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: hover ? 'var(--ink-1)' : 'var(--ink-2)'
      }
    }, t.label), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--ink-4)'
      }
    }, String(t.count).padStart(2, '0')), /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 14,
      color: hover ? 'var(--accent)' : 'var(--ink-4)'
    }));
  }
  window.KIT_TOPICS = {
    TopicsView
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/TopicsView.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/app.jsx
try { (() => {
/* meese.rs UI kit — App shell: routing, keyboard */
(function () {
  const {
    SiteHeader,
    SiteFooter
  } = window.KIT_CHROME;
  const {
    Home
  } = window.KIT_HOME;
  const {
    PostView
  } = window.KIT_POST;
  const {
    GraphView
  } = window.KIT_GRAPH;
  const {
    SearchOverlay
  } = window.KIT_SEARCH;
  const {
    ReviewView
  } = window.KIT_REVIEW;
  const {
    ReviewsView
  } = window.KIT_REVIEWS;
  const {
    ListView
  } = window.KIT_LIST;
  const {
    TopicsView
  } = window.KIT_TOPICS;
  const {
    REVIEWS
  } = window.KIT_DATA;
  function App() {
    const [route, setRoute] = React.useState('home'); // home | post | review | reviews | list | topics | graph
    const [slug, setSlug] = React.useState(null);
    const [listSpec, setListSpec] = React.useState({
      kind: 'all',
      title: 'All writing'
    });
    const [history, setHistory] = React.useState([]); // breadcrumb of prior views
    const [search, setSearch] = React.useState(false);
    const scrollRef = React.useRef(null);
    React.useEffect(() => {
      const onKey = e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
          e.preventDefault();
          setSearch(s => !s);
        }
        if (e.key === 'Escape') setSearch(false);
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }, []);
    React.useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [route, slug, listSpec]);

    // push the current view onto the history stack, then apply the next view
    const navTo = apply => {
      setHistory(h => h.concat([{
        route,
        slug,
        listSpec
      }]));
      apply();
    };
    // pop back to the previous view, or home if the stack is empty
    const back = () => {
      if (history.length) {
        const prev = history[history.length - 1];
        setHistory(history.slice(0, -1));
        setRoute(prev.route);
        setSlug(prev.slug);
        setListSpec(prev.listSpec);
        setSearch(false);
      } else {
        setRoute('home');
        setSlug(null);
      }
    };
    const goHome = () => {
      setHistory([]);
      setRoute('home');
      setSlug(null);
    };
    const openPost = s => navTo(() => {
      setSlug(s);
      setRoute(REVIEWS[s] ? 'review' : 'post');
      setSearch(false);
    });
    const openGraph = () => navTo(() => setRoute('graph'));
    const openReviews = () => navTo(() => {
      setRoute('reviews');
      setSlug(null);
    });
    const openTopics = () => navTo(() => {
      setRoute('topics');
      setSlug(null);
    });
    const openList = spec => navTo(() => {
      setListSpec(spec);
      setRoute('list');
      setSearch(false);
    });
    const onNav = name => {
      if (name === 'Graph') openGraph();else if (name === 'Reviews') openReviews();else if (name === 'Guides') openList({
        kind: 'type',
        value: 'guide',
        title: 'Guides',
        subtitle: 'Tactical, practical how-to-do-X writing — updated in place as tooling changes.'
      });else if (name === 'Notes') openList({
        kind: 'type',
        value: 'note',
        title: 'Notes',
        subtitle: 'Short observations and two-minute reads, in the main stream.'
      });else if (name === 'Topics') openTopics();else goHome();
    };
    const onTopic = arg => {
      if (arg === 'all') openList({
        kind: 'all',
        title: 'All writing',
        subtitle: 'Every guide, note, devlog, essay, lab, and reference — newest first.'
      });else if (arg === 'index') openTopics();else if (typeof arg === 'string' && arg) openList({
        kind: 'topic',
        value: arg,
        title: '#' + arg,
        subtitle: 'Everything filed under ' + arg + '.'
      });else goHome();
    };
    const navKey = route === 'home' ? 'Latest' : route === 'graph' ? 'Graph' : route === 'review' || route === 'reviews' ? 'Reviews' : route === 'topics' ? 'Topics' : route === 'list' ? listSpec.kind === 'type' && listSpec.value === 'guide' ? 'Guides' : listSpec.kind === 'type' && listSpec.value === 'note' ? 'Notes' : listSpec.kind === 'topic' ? 'Topics' : '' : '';

    // label for the back link, based on where it will actually return
    const prevView = history[history.length - 1];
    const backLabel = !prevView ? 'index' : prevView.route === 'home' ? 'index' : prevView.route === 'topics' ? 'topics' : prevView.route === 'reviews' ? 'reviews' : prevView.route === 'graph' ? 'graph' : prevView.route === 'list' ? prevView.listSpec && prevView.listSpec.kind === 'topic' ? prevView.listSpec.title : prevView.listSpec && prevView.listSpec.title ? prevView.listSpec.title.toLowerCase() : 'list' : prevView.route === 'post' || prevView.route === 'review' ? 'post' : 'index';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement(SiteHeader, {
      navKey: navKey,
      onNav: onNav,
      onSearch: () => setSearch(true),
      onHome: goHome
    }), /*#__PURE__*/React.createElement("main", {
      ref: scrollRef,
      style: {
        flex: 1,
        overflowY: route === 'graph' ? 'hidden' : 'auto'
      }
    }, route === 'home' ? /*#__PURE__*/React.createElement(Home, {
      onOpenPost: openPost,
      onOpenGraph: openGraph,
      onOpenReviews: openReviews,
      onSearch: () => setSearch(true),
      onTopic: onTopic
    }) : null, route === 'post' ? /*#__PURE__*/React.createElement(PostView, {
      slug: slug,
      onOpenPost: openPost,
      onBack: back,
      backLabel: backLabel,
      onTopic: onTopic
    }) : null, route === 'review' ? /*#__PURE__*/React.createElement(ReviewView, {
      slug: slug,
      onOpenPost: openPost,
      onBack: back,
      backLabel: backLabel
    }) : null, route === 'reviews' ? /*#__PURE__*/React.createElement(ReviewsView, {
      onOpenPost: openPost,
      onBack: back,
      backLabel: backLabel,
      onTopic: onTopic
    }) : null, route === 'list' ? /*#__PURE__*/React.createElement(ListView, {
      spec: listSpec,
      onOpenPost: openPost,
      onBack: back,
      backLabel: backLabel,
      onTopic: onTopic
    }) : null, route === 'topics' ? /*#__PURE__*/React.createElement(TopicsView, {
      onTopic: onTopic,
      onBack: back,
      backLabel: backLabel
    }) : null, route === 'graph' ? /*#__PURE__*/React.createElement(GraphView, {
      onOpenPost: openPost,
      onTopic: onTopic
    }) : null, route !== 'graph' ? /*#__PURE__*/React.createElement(SiteFooter, null) : null), search ? /*#__PURE__*/React.createElement(SearchOverlay, {
      onClose: () => setSearch(false),
      onOpenPost: openPost
    }) : null);
  }
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/app.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/data.js
try { (() => {
/* meese.rs UI kit — sample content (on-brand voice: sentence case, builder tone) */
(function () {
  const POSTS = [{
    slug: 'expo-sdk-56-real-device',
    type: 'guide',
    title: 'Getting an Expo SDK 56 app running on a real device',
    description: 'Modernizing an old app to the newest SDK turns up a few gotchas the docs never connect for you — here is the path that actually worked.',
    date: '2026-06-08',
    updated: '2026-06-11',
    readingTime: '7 min',
    topics: ['react-native', 'expo', 'mobile-dev'],
    tags: ['expo-sdk', 'android', 'eas'],
    featured: true
  }, {
    slug: 'expo-go-version-mismatch',
    type: 'note',
    title: 'Expo Go version mismatch is still a bad failure mode',
    description: 'The error points at the runtime when the real problem is the SDK. Two minutes of confusion that a one-line hint would fix.',
    date: '2026-06-09',
    readingTime: '2 min',
    topics: ['react-native', 'expo'],
    tags: ['expo-go', 'developer-experience']
  }, {
    slug: 'building-meese-rs',
    type: 'devlog',
    title: 'Building the first version of meese.rs',
    description: 'Initial architecture choices and tradeoffs for a static MDX writing system — why Astro, why Pagefind, and what I deliberately left out.',
    date: '2026-06-11',
    readingTime: '9 min',
    topics: ['static-sites', 'astro', 'publishing'],
    tags: ['mdx', 'pagefind', 'cloudflare-pages'],
    featured: true
  }, {
    slug: 'local-llms-benchmark',
    type: 'lab',
    title: 'Benchmarking local LLMs for task-specific code edits',
    description: 'A reproducible run comparing four quantized models on a fixed set of refactors. Numbers, prompts, and the harness are all here.',
    date: '2026-06-04',
    readingTime: '12 min',
    topics: ['local-llms', 'ai-devtools'],
    tags: ['benchmark', 'ollama', 'quantization']
  }, {
    slug: 'static-search-tradeoffs',
    type: 'essay',
    title: 'Static search is a tradeoff, not a downgrade',
    description: 'Why I shipped a build-time index instead of a search backend, and where that decision will eventually hurt.',
    date: '2026-05-29',
    readingTime: '6 min',
    topics: ['static-sites', 'search'],
    tags: ['pagefind', 'architecture']
  }, {
    slug: 'backlinks-at-build-time',
    type: 'reference',
    title: 'Generating backlinks at build time',
    description: 'A durable explainer of the backlink pass: frontmatter relations, internal links, and shared topics resolved into one graph.',
    date: '2026-05-22',
    readingTime: '5 min',
    topics: ['static-sites', 'publishing'],
    tags: ['mdx', 'graph']
  }, {
    slug: 'eas-build-cache',
    type: 'note',
    title: 'EAS build cache saved me an hour today',
    description: 'A short note on a cache flag that turned a 14-minute build into 90 seconds. Wish I had found it sooner.',
    date: '2026-05-18',
    readingTime: '2 min',
    topics: ['expo', 'mobile-dev'],
    tags: ['eas', 'ci']
  }, {
    slug: 'cursor-vs-claude-code',
    type: 'devlog',
    title: 'A week of pairing: Cursor vs Claude Code on the same repo',
    description: 'Same tasks, two tools, one codebase. Where each one pulled ahead and where both fell down on a real migration.',
    date: '2026-05-12',
    readingTime: '8 min',
    topics: ['ai-devtools', 'developer-experience'],
    tags: ['cursor', 'claude-code']
  }, {
    slug: 'review-bun-1-2',
    type: 'review',
    title: 'Bun v1.2',
    subject: 'Bun',
    version: 'v1.2',
    description: 'A genuinely fast all-in-one runtime that collapses three tools into one — with a few rough edges you will still feel in production.',
    date: '2026-06-10',
    readingTime: '11 min',
    topics: ['runtime', 'javascript', 'devtools'],
    tags: ['bun', 'nodejs', 'tooling'],
    featured: true
  }, {
    slug: 'review-claude-code',
    type: 'review',
    title: 'Everything Claude Code',
    subject: 'Claude Code',
    version: 'v2',
    description: 'The terminal-native coding agent that actually ships work — once you learn to scope it.',
    date: '2026-05-26',
    readingTime: '14 min',
    topics: ['ai-devtools', 'agents', 'developer-experience'],
    tags: ['claude-code', 'agents', 'cli'],
    featured: true
  }, {
    slug: 'review-paseo',
    type: 'review',
    title: 'Paseo',
    subject: 'Paseo',
    version: 'preview',
    description: 'One self-hosted interface for running Claude Code, Codex, Copilot and other coding agents in parallel — ambitious, and early.',
    date: '2026-06-12',
    readingTime: '8 min',
    topics: ['ai-devtools', 'agents', 'developer-experience'],
    tags: ['paseo', 'agents', 'self-hosted'],
    featured: true
  }];

  // Full review records (keyed by slug) for the review reading page
  const REVIEWS = {
    'review-claude-code': {
      subject: 'Claude Code',
      version: 'v2',
      tagline: 'A terminal-native AI coding agent that plans, edits across files, and runs your toolchain.',
      score: 4.6,
      verdict: 'recommended',
      verdictLabel: 'Recommended',
      reviewed: '2026-05-26',
      meta: [['pricing', 'usage-based'], ['runs in', 'terminal'], ['first reviewed', '2026-02'], ['tested on', 'macOS · Linux']],
      links: [['repo', 'anthropics/claude-code'], ['docs', 'docs.claude.com']],
      criteria: [['Autonomy', 4.7, 'Takes a vague task a long way before it needs you. The further it goes, the more scoping matters.'], ['Output quality', 4.6, 'Edits stay coherent across files and it cleans up after itself more than most tools do.'], ['Steerability', 4.5, 'Responds well to a tight spec and an AGENTS.md; flails on ambiguous ones.'], ['Cost control', 4.0, 'Usage-based pricing rewards good scoping and quietly punishes letting it wander.'], ['Ecosystem', 4.2, 'MCP, hooks, and skills make it composable; the surface area is still growing fast.']],
      pros: ['Genuinely ships multi-file work, not just snippets', 'Composable via MCP, hooks, and skills', 'Stays in the terminal where the tools already are', 'Reads a repo carefully before it touches anything'],
      cons: ['Costs scale with how loosely you scope it', 'Long autonomous runs need review discipline', 'Moves fast — workflows shift between versions', 'Still rewards users who write good specs'],
      body: [['The pitch', 'Claude Code lives in your terminal and treats the whole repo as context. Give it a scoped task and it plans, edits across files, runs your tests, and iterates — closer to a junior engineer than an autocomplete.'], ['Where it shines', 'Migrations, refactors, and "wire this up end-to-end" tasks where the win is coordination across many files. An `AGENTS.md` and a tight prompt turn it from impressive to dependable.'], ['Where it bites', 'Hand it something vague and it will confidently go too far. The skill here is scoping and review, not prompting tricks — budget for both.']],
      bottomLine: 'The strongest terminal coding agent I have used. Treat it like a fast junior who needs a clear spec and a code review and it pays for itself; let it wander and it will cost you in tokens and cleanup.'
    },
    'review-bun-1-2': {
      subject: 'Bun',
      version: 'v1.2',
      tagline: 'The all-in-one JavaScript runtime, bundler, test runner, and package manager.',
      score: 4.2,
      verdict: 'caveats',
      verdictLabel: 'Recommended with caveats',
      reviewed: '2026-06-10',
      meta: [['license', 'MIT'], ['written in', 'Zig'], ['first reviewed', '2025-11'], ['tested on', 'macOS · Linux']],
      links: [['repo', 'oven-sh/bun'], ['docs', 'bun.sh/docs']],
      criteria: [['Performance', 4.8, 'Cold starts and install times are in a different class. This is the headline, and it delivers.'], ['Developer experience', 4.5, 'One binary for run/test/bundle/install. The ergonomics are excellent once it is in your hands.'], ['Node compatibility', 3.8, 'Most things work. The 5% that does not tends to surface late, in a dependency you did not write.'], ['Ecosystem & tooling', 3.5, 'Growing fast, but CI images, hosts, and observability still assume Node first.'], ['Stability', 3.5, 'Far steadier than a year ago. I would still pin versions and read the changelog before upgrading.']],
      pros: ['Install and test times that genuinely change your loop', 'One tool replaces npm + tsx + jest + esbuild', 'Native TypeScript and JSX with no config', 'Drop-in for most Node scripts and servers'],
      cons: ['Edge-case Node API gaps appear in transitive deps', 'Some hosts / CI runners still need manual setup', 'Smaller plugin ecosystem than the Node incumbents', 'Moves fast — minor versions can shift behavior'],
      body: [['The pitch', 'Bun wants to be the only tool in your JavaScript toolchain, and for the common path it actually is. `bun install` is fast enough that you stop tabbing away to wait, and `bun test` runs a real suite in the time the Node equivalent spends booting.'], ['Where it shines', 'Greenfield services, scripts, and CI install steps are the sweet spot. If your dependency tree is mainstream, you get the speed with none of the pain, and the single-binary story removes a surprising amount of config.'], ['Where it bites', 'The failure mode is specific: a transitive dependency reaches for a Node API that Bun implements slightly differently, and you debug someone else’s code. It is rarer than it used to be, but it is the reason this is a four-star tool and not a five.']],
      bottomLine: 'If you are starting something new, reach for Bun and enjoy the speed. If you are migrating a large, mature Node service, pilot it on a non-critical path first — the wins are real, but so is the long tail of compatibility.'
    },
    'review-paseo': {
      subject: 'Paseo',
      version: 'preview',
      tagline: 'One self-hosted interface for running Claude Code, Codex, Copilot, OpenCode, and Pi agents in parallel.',
      score: 3.9,
      verdict: 'watch',
      verdictLabel: 'One to watch',
      reviewed: '2026-06-12',
      meta: [['license', 'AGPL-3.0'], ['runs', 'self-hosted daemon'], ['clients', 'iOS · Android · desktop · CLI'], ['maintainer', 'solo']],
      links: [['repo', 'getpaseo/paseo'], ['docs', 'paseo.sh/docs']],
      criteria: [['Multi-provider', 4.5, 'Claude Code, Codex, Copilot, OpenCode, and Pi behind one interface — pick the right model per job.'], ['Cross-device', 4.4, 'Start at your desk, check in from your phone, script it from the terminal. The handoff is the point.'], ['Privacy & control', 4.3, 'Self-hosted on your own machine with your configs; no telemetry, no forced logins.'], ['Maturity', 3.0, 'Young and moving fast. Capable, but expect rough edges and breaking changes.'], ['Docs & support', 3.2, 'Solo maintainer; Discord is faster than Issues. Docs cover the happy path.']],
      pros: ['One interface across five agent providers', 'Self-hosted — your machine, your tools, your configs', 'Genuinely cross-device, including a real mobile client', 'Privacy-first: no telemetry, no forced login', 'Orchestration skills: handoff, loop, advisor, committee'],
      cons: ['Early and fast-moving; expect breaking changes', 'Solo maintainer — Issues can lag behind Discord', 'AGPL-3.0 will not suit every team or product', 'You still install and configure each agent CLI yourself'],
      body: [['The pitch', 'Paseo is a self-hosted daemon that runs your coding agents and exposes them through one interface — desktop, mobile, web, or CLI. Run several in parallel, hand work between them, and drive it all from wherever you are.'], ['Where it shines', 'If you already live across Claude Code, Codex, and Copilot, Paseo collapses them into one control surface and lets you start a task at your desk and check it from your phone. The orchestration skills — handoff, loop, committee — are the genuinely novel part.'], ['Where it bites', 'It is early and maintained by one person. The ideas are ahead of the polish, and AGPL-3.0 plus self-hosting means it is not a drop-in for every team. Watch it; do not yet bet a critical workflow on it.']],
      bottomLine: 'The most interesting take on multi-agent orchestration I have tried, and the cross-device story is real. It is early and solo-maintained, so treat it as a promising daily-driver-in-waiting: run it, follow it, and revisit at a stable release.'
    }
  };

  // Per-post article bodies (block format) for the reading page.
  // Block forms: ['h',text] ['p',html] ['code',text] ['quote',text]
  //   ['callout',type,title,text] ['figure',caption,kind] ['ul',[items]] ['table',[[head],...rows]]
  const BODIES = {
    'expo-sdk-56-real-device': [['p', "I had an Expo app that hadn't been touched in two years. Getting it onto a real Pixel under SDK 56 should have been a fifteen-minute job — it was not, but the friction was all in places the docs describe separately and never connect."], ['h', 'The setup'], ['p', "Start from a clean upgrade. Bump the SDK, let the CLI rewrite the config, and resist the urge to fix lint noise before the thing even boots."], ['code', "npx expo install expo@^56.0.0\nnpx expo-doctor\neas build --profile development --platform android"], ['callout', 'warning', 'Watch for SDK / runtime mismatch', "Expo Go may not support the newest SDK immediately depending on release timing. If the splash screen hangs, this is almost always why — not your code."], ['h', 'Build a dev client, not Expo Go'], ['p', "A development build pins the native runtime to **your** SDK, which removes the entire class of mismatch. It costs one EAS build up front and pays for itself the first time you'd otherwise chase a phantom error."], ['figure', 'The dev-client install flow on a physical device — QR pairing, then the dev server on the same network.', 'screenshot'], ['h', 'Takeaways'], ['ul', ['Use a dev client over Expo Go for bleeding-edge SDKs', 'Read errors one layer up from where they point', 'Keep the first upgrade commit boring']]],
    'expo-go-version-mismatch': [['p', "The failure mode is genuinely bad: the error names the **runtime** when the real mismatch is the **SDK**. You'll burn a few minutes looking in the wrong layer."], ['callout', 'note', 'The one-line fix', "Stop using Expo Go for a bleeding-edge SDK. A dev client pins the runtime to your SDK and the whole error class disappears."], ['quote', "If the tool can detect the mismatch well enough to error, it can detect it well enough to tell you which side is wrong."]],
    'building-meese-rs': [['p', "This site is a deliberate exercise in restraint: static-first, no server runtime, and as few moving parts as I could get away with. Here's the shape of v0 and the tradeoffs behind it."], ['h', 'The stack'], ['p', "Astro for content collections, MDX for authoring, Pagefind for search, Cloudflare Pages for hosting. Everything that can be computed at build time is."], ['code', "astro build && pagefind --site dist"], ['h', 'What I left out, on purpose'], ['table', [['Feature', 'Decision'], ['Comments', 'Out — no moderation surface'], ['CMS', 'Out — content is MDX in the repo'], ['Runtime search', 'Out — static index instead']]], ['figure', 'The build pipeline: content collection → static HTML → Pagefind index → graph.json.', 'diagram'], ['p', "The result is a site I can publish from a laptop and forget about until I have something to write."]],
    'local-llms-benchmark': [['p', "A reproducible run comparing four quantized models on a fixed set of refactors. Same prompts, same harness, same machine — here are the numbers."], ['h', 'Results'], ['table', [['Model', 'Pass rate', 'Median latency'], ['Q4_K_M · 7B', '68%', '4.1s'], ['Q5_K_M · 7B', '72%', '5.8s'], ['Q4 · 14B', '81%', '9.2s'], ['Q4 · 32B', '88%', '18.6s']]], ['callout', 'context', 'How to read this', "Pass rate is against a fixed acceptance test per task. Latency is wall-clock on a single consumer GPU; your numbers will move with hardware."], ['figure', 'Pass rate vs. latency across the four quantizations — the 14B sits on the efficient frontier.', 'chart'], ['p', "The 14B at Q4 was the sweet spot for my hardware: most of the quality of the 32B at half the latency."]],
    'static-search-tradeoffs': [['p', "I shipped a build-time search index instead of a search backend. That's a tradeoff, not a downgrade — and it's worth being honest about where it will eventually hurt."], ['quote', "Static search is the right default until your corpus or your query patterns outgrow it. Most sites never do."], ['h', 'Where it pays off'], ['p', "No server to run, no index to keep warm, no query that can take the site down. The index ships with the deploy and works offline."], ['h', 'Where it will bite'], ['p', "Large corpora and faceted, frequently-changing data are the failure cases. When I hit them, I'll add a backend for search alone and keep the reading path static."]],
    'backlinks-at-build-time': [['p', "Backlinks are generated at build time from four sources: manual frontmatter relations, internal links, supersedes/supersededBy fields, and shared topics."], ['code', "const edges = posts.flatMap(p => [\n  ...p.related.map(r => link(p, r)),\n  ...internalLinks(p),\n]);"], ['ul', ['Manual related links first', 'Direct internal-link backlinks second', 'Then “more in this topic”']], ['callout', 'tip', 'Keep it useful, not exhaustive', "A backlink section that lists everything is noise. Cap it, rank it, and let the graph page handle full discovery."]],
    'eas-build-cache': [['p', "A cache flag turned a 14-minute rebuild into 90 seconds. Filing this so future-me finds it faster than I did."], ['code', "eas build --profile development --platform android --clear-cache=false"], ['p', "Obvious in hindsight; invisible in the docs at the moment I needed it."]],
    'cursor-vs-claude-code': [['p', "Same tasks, two tools, one codebase, one week. I ran a real migration through both and kept score on the parts that actually matter day to day."], ['h', 'The scorecard'], ['table', [['Dimension', 'Cursor', 'Claude Code'], ['In-editor flow', 'Strong', '—'], ['Whole-repo tasks', 'Good', 'Strong'], ['Autonomy', 'Medium', 'High'], ['Reviewability', 'High', 'Medium']]], ['p', "Neither won outright. Cursor stayed ahead for tight in-editor edits; Claude Code pulled away on multi-file, run-the-tools work."], ['callout', 'context', 'My takeaway', "I keep both. Cursor for surgical edits in the editor, Claude Code in the terminal for coordinated, multi-file changes."]]
  };
  const TOPICS = [{
    slug: 'react-native',
    label: 'react-native',
    count: 6,
    hue: 'var(--hue-cyan)'
  }, {
    slug: 'ai-devtools',
    label: 'ai-devtools',
    count: 5,
    hue: 'var(--hue-violet)'
  }, {
    slug: 'static-sites',
    label: 'static-sites',
    count: 4,
    hue: 'var(--hue-green)'
  }, {
    slug: 'local-llms',
    label: 'local-llms',
    count: 3,
    hue: 'var(--hue-gold)'
  }, {
    slug: 'expo',
    label: 'expo',
    count: 5,
    hue: 'var(--hue-cyan)'
  }, {
    slug: 'developer-experience',
    label: 'developer-experience',
    count: 4,
    hue: 'var(--hue-rose)'
  }, {
    slug: 'publishing',
    label: 'publishing',
    count: 3,
    hue: 'var(--hue-slate)'
  }, {
    slug: 'security',
    label: 'security',
    count: 2,
    hue: 'var(--hue-gold)'
  }];

  // Concept graph: posts + topics, edges by topic membership
  const TYPE_HUE = {
    guide: 'var(--hue-cyan)',
    note: 'var(--hue-slate)',
    devlog: 'var(--hue-green)',
    essay: 'var(--hue-violet)',
    lab: 'var(--hue-gold)',
    reference: 'var(--hue-rose)',
    topic: 'var(--accent)'
  };

  // hand-placed positions (0..1) for a sleek, legible layout
  const GRAPH = {
    nodes: [{
      id: 't:react-native',
      kind: 'topic',
      label: 'react-native',
      x: 0.20,
      y: 0.30,
      r: 17
    }, {
      id: 't:static-sites',
      kind: 'topic',
      label: 'static-sites',
      x: 0.72,
      y: 0.32,
      r: 16
    }, {
      id: 't:ai-devtools',
      kind: 'topic',
      label: 'ai-devtools',
      x: 0.50,
      y: 0.72,
      r: 16
    }, {
      id: 't:expo',
      kind: 'topic',
      label: 'expo',
      x: 0.30,
      y: 0.58,
      r: 13
    }, {
      id: 'expo-sdk-56-real-device',
      kind: 'guide',
      label: 'Expo SDK 56 on device',
      x: 0.12,
      y: 0.16,
      r: 9
    }, {
      id: 'expo-go-version-mismatch',
      kind: 'note',
      label: 'Expo Go mismatch',
      x: 0.40,
      y: 0.16,
      r: 7
    }, {
      id: 'eas-build-cache',
      kind: 'note',
      label: 'EAS build cache',
      x: 0.16,
      y: 0.48,
      r: 7
    }, {
      id: 'building-meese-rs',
      kind: 'devlog',
      label: 'Building meese.rs',
      x: 0.84,
      y: 0.18,
      r: 9
    }, {
      id: 'static-search-tradeoffs',
      kind: 'essay',
      label: 'Static search',
      x: 0.88,
      y: 0.48,
      r: 8
    }, {
      id: 'backlinks-at-build-time',
      kind: 'reference',
      label: 'Backlinks pass',
      x: 0.66,
      y: 0.52,
      r: 8
    }, {
      id: 'local-llms-benchmark',
      kind: 'lab',
      label: 'Local LLM bench',
      x: 0.40,
      y: 0.88,
      r: 9
    }, {
      id: 'cursor-vs-claude-code',
      kind: 'devlog',
      label: 'Cursor vs Claude',
      x: 0.66,
      y: 0.86,
      r: 8
    }],
    edges: [['expo-sdk-56-real-device', 't:react-native'], ['expo-sdk-56-real-device', 't:expo'], ['expo-go-version-mismatch', 't:react-native'], ['expo-go-version-mismatch', 't:expo'], ['eas-build-cache', 't:expo'], ['t:expo', 't:react-native'], ['building-meese-rs', 't:static-sites'], ['static-search-tradeoffs', 't:static-sites'], ['backlinks-at-build-time', 't:static-sites'], ['local-llms-benchmark', 't:ai-devtools'], ['cursor-vs-claude-code', 't:ai-devtools'], ['building-meese-rs', 't:ai-devtools'], ['static-search-tradeoffs', 't:ai-devtools']]
  };
  window.KIT_DATA = {
    POSTS,
    TOPICS,
    GRAPH,
    TYPE_HUE,
    REVIEWS,
    BODIES
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/data.js", error: String((e && e.message) || e) }); }

// ui_kits/website/kit-primitives.js
try { (() => {
/* meese.rs UI kit — primitive resolver.
   Uses the real design-system bundle when present; falls back to minimal
   inline versions so the kit still renders in preview before the bundle
   is compiled. Post-compile, window.MeeseRsDesignSystem_ed1971 wins. */
(function () {
  const DS = window.MeeseRsDesignSystem_ed1971 || {};
  const h = React.createElement;
  const TYPE = {
    guide: ['GUIDE', 'var(--hue-cyan)'],
    note: ['NOTE', 'var(--hue-slate)'],
    devlog: ['DEVLOG', 'var(--hue-green)'],
    essay: ['ESSAY', 'var(--hue-violet)'],
    lab: ['LAB', 'var(--hue-gold)'],
    reference: ['REF', 'var(--hue-rose)'],
    review: ['REVIEW', 'var(--accent)']
  };
  const STATUS = {
    updated: ['UPDATED', 'var(--green)'],
    corrected: ['CORRECTED', 'var(--gold)'],
    deprecated: ['DEPRECATED', 'var(--red)'],
    superseded: ['SUPERSEDED', 'var(--hue-slate)'],
    pinned: ['PINNED', 'var(--accent)']
  };

  // Leading type-badge glyphs (the 7 post types), matching Icon.jsx geometry.
  const TYPE_GLYPH = {
    guide: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
    note: '<path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    devlog: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
    essay: '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" x2="2" y1="8" y2="22"/><line x1="17.5" x2="9" y1="15" y2="15"/>',
    lab: '<path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/><path d="M7 16h10"/>',
    reference: '<path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>',
    review: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
  };
  const glyph = type => h('svg', {
    width: 13,
    height: 13,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    style: {
      display: 'block',
      flex: 'none'
    },
    'aria-hidden': true,
    dangerouslySetInnerHTML: {
      __html: TYPE_GLYPH[type] || ''
    }
  });
  const Fallback = {
    Button: ({
      children,
      variant = 'secondary',
      size = 'md',
      style,
      ...p
    }) => h('button', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: size === 'sm' ? 11 : 14,
        fontWeight: 500,
        height: size === 'sm' ? 30 : size === 'lg' ? 46 : 38,
        padding: '0 16px',
        borderRadius: 'var(--radius-sm)',
        cursor: 'pointer',
        letterSpacing: '.02em',
        background: variant === 'primary' ? 'var(--accent)' : variant === 'ghost' ? 'transparent' : 'var(--surface-2)',
        color: variant === 'primary' ? 'var(--ink-inverse)' : 'var(--ink-1)',
        border: '1px solid ' + (variant === 'primary' ? 'var(--accent)' : variant === 'ghost' ? 'transparent' : 'var(--line-2)'),
        ...style
      },
      ...p
    }, children),
    Badge: ({
      type,
      status,
      children,
      bracketed,
      color,
      icon = true,
      style
    }) => {
      const p = type ? TYPE[type] : status ? STATUS[status] : null;
      const hue = color || (p ? p[1] : 'var(--ink-3)');
      const label = children != null ? children : p ? p[0] : '';
      const showBracket = bracketed === undefined ? !type : bracketed;
      const withIcon = icon && type;
      return h('span', {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '.1em',
          gap: withIcon ? 5 : 0,
          height: 20,
          padding: withIcon ? '0 7px 0 6px' : '0 7px',
          display: 'inline-flex',
          alignItems: 'center',
          borderRadius: 'var(--radius-xs)',
          color: hue,
          whiteSpace: 'nowrap',
          background: 'color-mix(in srgb, ' + hue + ' 12%, transparent)',
          border: '1px solid color-mix(in srgb, ' + hue + ' 38%, transparent)',
          ...style
        }
      }, withIcon ? glyph(type) : null, showBracket ? '[ ' + label + ' ]' : label);
    },
    Tag: ({
      children,
      href,
      active,
      onClick,
      style
    }) => h(href ? 'a' : 'span', {
      href,
      onClick,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        height: 22,
        padding: '0 8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 2,
        textDecoration: 'none',
        borderRadius: 'var(--radius-pill)',
        border: '1px solid ' + (active ? 'var(--accent-deep)' : 'var(--line-1)'),
        background: active ? 'var(--accent-wash)' : 'transparent',
        color: active ? 'var(--accent-bright)' : 'var(--ink-3)',
        cursor: href || onClick ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        ...style
      }
    }, h('span', {
      style: {
        color: 'var(--ink-4)'
      }
    }, '#'), children),
    Input: ({
      variant,
      placeholder,
      value,
      onChange,
      style,
      ...p
    }) => h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        height: 40,
        padding: '0 12px',
        background: 'var(--surface-well)',
        border: '1px solid var(--line-2)',
        borderRadius: variant === 'search' ? 'var(--radius-md)' : 'var(--radius-sm)',
        ...style
      }
    }, variant === 'search' ? h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        color: 'var(--ink-4)',
        fontWeight: 600
      }
    }, '/') : null, h('input', {
      placeholder,
      value,
      onChange,
      style: {
        flex: 1,
        minWidth: 0,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--ink-1)',
        fontFamily: variant === 'search' ? 'var(--font-mono)' : 'var(--font-body)',
        fontSize: 14
      },
      ...p
    }))
  };
  Fallback.PostCard = ({
    title,
    description,
    type = 'guide',
    date,
    updated,
    readingTime,
    topics = [],
    featured,
    href = '#',
    onClick
  }) => h('a', {
    href,
    onClick,
    style: {
      display: 'block',
      textDecoration: 'none',
      background: 'var(--surface-1)',
      border: '1px solid ' + (featured ? 'var(--line-2)' : 'var(--line-1)'),
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-6)',
      position: 'relative'
    }
  }, h('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14
    }
  }, h(Fallback.Badge, {
    type
  }), featured ? h(Fallback.Badge, {
    status: 'pinned'
  }) : null, h('span', {
    style: {
      flex: 1
    }
  }), h('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--ink-3)'
    }
  }, date + (readingTime ? '  ·  ' + readingTime : ''))), h('h3', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-xl)',
      fontWeight: 600,
      color: 'var(--ink-1)',
      margin: 0,
      lineHeight: 1.2
    }
  }, title), description ? h('p', {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-base)',
      color: 'var(--ink-2)',
      lineHeight: 1.6,
      margin: '10px 0 0',
      maxWidth: '62ch'
    }
  }, description) : null, topics.length ? h('div', {
    style: {
      display: 'flex',
      gap: 6,
      marginTop: 16,
      flexWrap: 'wrap'
    }
  }, topics.map(t => h(Fallback.Tag, {
    key: t,
    href: '#'
  }, t))) : null);
  Fallback.NoteCard = ({
    title,
    body,
    date,
    href = '#',
    onClick
  }) => h('a', {
    href,
    onClick,
    style: {
      display: 'flex',
      gap: 16,
      textDecoration: 'none',
      background: 'transparent',
      border: '1px solid var(--line-1)',
      borderLeft: '2px solid var(--hue-slate)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-4) var(--space-5)'
    }
  }, h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flex: 'none'
    }
  }, h(Fallback.Badge, {
    type: 'note'
  }), h('span', {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--ink-4)'
    }
  }, date)), h('div', {
    style: {
      minWidth: 0
    }
  }, title ? h('div', {
    style: {
      fontFamily: 'var(--font-display)',
      fontSize: 'var(--text-base)',
      fontWeight: 600,
      color: 'var(--ink-1)',
      marginBottom: 4
    }
  }, title) : null, h('p', {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--ink-2)',
      lineHeight: 1.55,
      margin: 0
    }
  }, body)));
  const CK = {
    note: ['NOTE', 'var(--accent)'],
    tip: ['TIP', 'var(--green)'],
    warning: ['WARNING', 'var(--gold)'],
    danger: ['DANGER', 'var(--red)'],
    context: ['CONTEXT', 'var(--violet)']
  };
  Fallback.Callout = ({
    type = 'note',
    title,
    children
  }) => {
    const k = CK[type] || CK.note;
    return h('div', {
      style: {
        background: 'color-mix(in srgb, ' + k[1] + ' 8%, var(--surface-1))',
        border: '1px solid color-mix(in srgb, ' + k[1] + ' 28%, transparent)',
        borderLeft: '2px solid ' + k[1],
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-4) var(--space-5)'
      }
    }, h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        marginBottom: 8
      }
    }, h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.14em',
        color: k[1]
      }
    }, '// ' + k[0]), title ? h('span', {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-base)',
        fontWeight: 600,
        color: 'var(--ink-1)'
      }
    }, title) : null), children ? h('div', {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--ink-2)',
        lineHeight: 1.6
      }
    }, children) : null);
  };
  Fallback.Stars = ({
    score = 0,
    size = 14
  }) => {
    const pct = Math.max(0, Math.min(100, score / 5 * 100));
    return h('span', {
      style: {
        position: 'relative',
        display: 'inline-block',
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '2px',
        fontFamily: 'var(--font-mono)'
      }
    }, h('span', {
      style: {
        color: 'var(--line-3)'
      }
    }, '\u2605\u2605\u2605\u2605\u2605'), h('span', {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: pct + '%',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        color: 'var(--accent)'
      }
    }, '\u2605\u2605\u2605\u2605\u2605'));
  };
  const VK = {
    recommended: 'var(--green)',
    caveats: 'var(--gold)',
    watch: 'var(--accent)',
    skip: 'var(--red)'
  };
  const VL = {
    recommended: 'RECOMMENDED',
    caveats: 'WITH CAVEATS',
    watch: 'ONE TO WATCH',
    skip: 'SKIP FOR NOW'
  };
  Fallback.ReviewCard = ({
    subject,
    version,
    oneLiner,
    score = 0,
    verdict = 'recommended',
    date,
    topics = [],
    href = '#',
    onClick
  }) => {
    const c = VK[verdict] || VK.recommended;
    return h('a', {
      href,
      onClick,
      style: {
        display: 'block',
        textDecoration: 'none',
        background: 'var(--surface-1)',
        border: '1px solid var(--line-1)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--space-6)'
      }
    }, h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14
      }
    }, h(Fallback.Badge, {
      type: 'review'
    }), h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '.1em',
        color: c,
        border: '1px solid color-mix(in srgb, ' + c + ' 40%, transparent)',
        background: 'color-mix(in srgb, ' + c + ' 12%, transparent)',
        borderRadius: 'var(--radius-xs)',
        height: 20,
        padding: '0 7px',
        display: 'inline-flex',
        alignItems: 'center',
        whiteSpace: 'nowrap'
      }
    }, VL[verdict] || ''), h('span', {
      style: {
        flex: 1
      }
    }), h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--ink-3)'
      }
    }, date)), h('div', {
      style: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 10,
        flexWrap: 'wrap'
      }
    }, h('h3', {
      style: {
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        fontWeight: 600,
        color: 'var(--ink-1)',
        margin: 0,
        lineHeight: 1.15
      }
    }, subject), version ? h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-xs)',
        color: 'var(--ink-4)'
      }
    }, version) : null), h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginTop: 12
      }
    }, h(Fallback.Stars, {
      score,
      size: 15
    }), h('span', {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 'var(--text-sm)',
        color: 'var(--ink-2)'
      }
    }, score.toFixed(1) + ' / 5')), oneLiner ? h('p', {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        color: 'var(--ink-2)',
        lineHeight: 1.6,
        margin: '12px 0 0',
        maxWidth: '62ch'
      }
    }, oneLiner) : null, topics.length ? h('div', {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 16,
        flexWrap: 'wrap'
      }
    }, topics.map(t => h(Fallback.Tag, {
      key: t,
      href: '#'
    }, t))) : null);
  };
  window.KIT = {
    Button: DS.Button || Fallback.Button,
    Badge: DS.Badge || Fallback.Badge,
    Tag: DS.Tag || Fallback.Tag,
    Input: DS.Input || Fallback.Input,
    PostCard: DS.PostCard || Fallback.PostCard,
    NoteCard: DS.NoteCard || Fallback.NoteCard,
    Callout: DS.Callout || Fallback.Callout,
    ReviewCard: DS.ReviewCard || Fallback.ReviewCard,
    Stars: DS.Stars || Fallback.Stars,
    usingBundle: !!DS.Button
  };
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/kit-primitives.js", error: String((e && e.message) || e) }); }

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.NoteCard = __ds_scope.NoteCard;

__ds_ns.PostCard = __ds_scope.PostCard;

__ds_ns.Stars = __ds_scope.Stars;

__ds_ns.ReviewCard = __ds_scope.ReviewCard;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.ICONS = __ds_scope.ICONS;

__ds_ns.TYPE_ICONS = __ds_scope.TYPE_ICONS;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Tag = __ds_scope.Tag;

})();
