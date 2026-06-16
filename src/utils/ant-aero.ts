/**
 * Aerodynamic follow-up to the ant wind-dislodgment model.
 *
 * The first post (see ant-wind.ts) converted grip into wind through a single
 * drag coefficient, Cd = 1.0 on frontal area. This file is the machinery for
 * the follow-up that takes that one assumption apart: Reynolds number across
 * the ant's scales, the skin-friction vs form-drag split, and the wall
 * boundary layer the ant actually sits inside.
 *
 * Everything here is a first-order model. The characteristic lengths, the
 * wetted-to-frontal ratio, and the upwind wall fetch are stated assumptions,
 * not measurements, exactly like the engagement/surface knobs in the original.
 * The point is direction and rough magnitude, not a wind-tunnel number.
 */

// Kinematic viscosity of air, m^2/s, ~15 C sea level. Sets every Reynolds number.
export const NU_AIR = 1.5e-5;

// Characteristic lengths spanning three orders of magnitude on one animal.
// Body ~ a couple mm across, legs/antennae sub-mm, tarsal hairs single microns.
export const L_BODY = 2.0e-3; // m
export const L_LEG = 2.0e-4; // m
export const L_HAIR = 3.0e-6; // m

// Wetted area over frontal area for a lumpy, hairy body. A smooth convex blob
// runs ~4x; hairs and appendages push it up. 6 is a deliberately round stand-in.
export const AW_OVER_AF = 6;

// Form-drag coefficient on frontal area, carried over from the first model.
export const CD_FORM = 1.0;

// Wall fetch: how much surface the wind has run along before it reaches the
// ant, which sets boundary-layer thickness. 1 m is a plausible mid-wall value.
export const WALL_FETCH = 1.0; // m

// Ant standing height, the slice of the profile its body occupies.
export const ANT_HEIGHT = 2.5e-3; // m

export const MS_TO_MPH = 2.236936;
export const toMph = (ms: number) => ms * MS_TO_MPH;
export const fromMph = (mph: number) => mph / MS_TO_MPH;

// ---- Reynolds number and flow regime ----

/** Reynolds number for a feature of length L (m) in wind v (m/s). */
export function reynolds(v: number, L: number): number {
  return (v * L) / NU_AIR;
}

export type Regime = "viscous" | "transitional" | "inertial";

export interface RegimeBand {
  regime: Regime;
  label: string;
  blurb: string;
}

/**
 * Which drag regime a Reynolds number lands in. Below ~1 viscosity rules and
 * drag is roughly linear in speed (Stokes). Above ~1000 inertia rules and drag
 * is quadratic with a roughly constant Cd, which is the regime the original
 * drag equation assumes. The decade between is the messy transition.
 */
export function regimeOf(re: number): RegimeBand {
  if (re < 1)
    return {
      regime: "viscous",
      label: "viscous (Stokes)",
      blurb: "Viscosity dominates. Drag is closer to linear in speed and a constant Cd does not apply.",
    };
  if (re < 1000)
    return {
      regime: "transitional",
      label: "transitional",
      blurb: "Neither regime owns it. The drag coefficient falls with speed instead of holding flat.",
    };
  return {
    regime: "inertial",
    label: "inertial (quadratic)",
    blurb: "Inertia dominates. Cd is roughly constant and the quadratic drag equation holds.",
  };
}

// ---- Skin friction vs form drag ----

/** Blasius laminar flat-plate mean skin-friction coefficient. */
export function skinFrictionCoeff(reL: number): number {
  if (reL <= 0) return 0;
  return 1.328 / Math.sqrt(reL);
}

/**
 * Rough friction-to-form drag ratio on the body at wind v (m/s). Friction
 * scales with wetted area times Cf; form scales with frontal area times Cd.
 * Above 1 means skin friction would carry more of the load than pressure.
 */
export function frictionFormRatio(v: number): number {
  const cf = skinFrictionCoeff(reynolds(v, L_BODY));
  return (cf * AW_OVER_AF) / (CD_FORM * 1);
}

/** Friction's share of total drag, 0..1, from the ratio above. */
export function frictionShare(v: number): number {
  const r = frictionFormRatio(v);
  return r / (1 + r);
}

// ---- Wall boundary layer ----

/**
 * Turbulent boundary-layer thickness (m) at fetch x (m) under freestream U
 * (m/s), from the standard delta = 0.37 x / Re_x^(1/5) correlation.
 */
export function blThickness(U: number, x: number = WALL_FETCH): number {
  if (U <= 0) return 0;
  return (0.37 * x) / Math.pow(reynolds(U, x), 0.2);
}

/** Local wind fraction u/U at height y inside the layer (1/7 power law). */
export function blFractionAt(U: number, y: number, x: number = WALL_FETCH): number {
  const delta = blThickness(U, x);
  if (delta <= 0) return 0;
  if (y >= delta) return 1;
  return Math.pow(y / delta, 1 / 7);
}

/**
 * Height-averaged wind fraction over an ant of height h sitting on the wall.
 * Mean of (y/delta)^(1/7) from 0 to h is (7/8)(h/delta)^(1/7) when h < delta.
 */
export function blMeanFraction(U: number, h: number = ANT_HEIGHT, x: number = WALL_FETCH): number {
  const delta = blThickness(U, x);
  if (delta <= 0) return 0;
  if (h >= delta) return 1;
  return (7 / 8) * Math.pow(h / delta, 1 / 7);
}

/**
 * How much higher the real freestream threshold runs versus the isolated-body
 * model, because the ant only feels the slowed near-wall air. Drag scales with
 * the square of the local mean wind, so the multiplier is 1 / mean fraction.
 */
export function thresholdMultiplier(U: number, h: number = ANT_HEIGHT, x: number = WALL_FETCH): number {
  const mean = blMeanFraction(U, h, x);
  return mean > 0 ? 1 / mean : 1;
}

/** Equivalent wind threshold after a Cd correction: v scales as Cd^(-1/2). */
export function cdAdjustedThreshold(baselineMph: number, cd: number): number {
  return cd > 0 ? baselineMph / Math.sqrt(cd / CD_FORM) : baselineMph;
}
