/**
 * Shared data + physics for the ant wind-dislodgment post.
 *
 * Everything here reproduces the model in the source manuscript so the
 * calculator, charts, and sandbox can't drift apart. The drag conversion
 * matches the published table to the mph: Crematogaster crinosa comes out at
 * ~273 mph for its 0.7 g max shear load, same as Stark et al. (2018) run
 * through the drag equation with the assumptions below.
 */

// ---- Model constants (baseline assumptions from the manuscript) ----
export const RHO_AIR = 1.225; // kg m^-3, ISA sea level
export const CD = 1.0; // drag coefficient, baseline
export const G = 9.80665; // m s^-2
export const A_REF = 3.0e-6; // m^2, frontal area of an 8.2 mg reference worker
export const M_REF = 8.2e-6; // kg, the reference worker (Oecophylla, Endlein & Federle 2015)
export const MS_TO_MPH = 2.236936;

// Oecophylla tarsal-hair friction on smooth substrate, the "casually walking"
// ceiling on shear before pads fully engage (Endlein & Federle 2015).
export const HAIR_ARRAY_SHEAR = 3.1; // x body weight

// Highest reliably measured surface wind on Earth, for the readout banding.
// 253 mph gust, Barrow Island, Cyclone Olivia, 1996 (WMO-accepted).
export const MAX_RECORDED_GUST_MPH = 253;

export type TempResponse = "NL" | "P" | "NR";

export interface Species {
  name: string; // full binomial
  short: string; // chart abbreviation
  massMg: number;
  maxLoadG: number; // mean max shear load on vertical glass
  ratio: number; // load / body mass, x body weight (as reported)
  temp: TempResponse;
  tempLabel: string;
}

/**
 * 11 tropical arboreal ants, vertical-glass shear, from Stark, Arstingstall &
 * Yanoviak (2018), Table 1. Ratio is load/body-mass (dimensionless). Sorted
 * strongest-to-weakest by relative grip.
 */
export const SPECIES: Species[] = [
  { name: "Crematogaster crinosa", short: "C. crinosa", massMg: 1.03, maxLoadG: 0.7, ratio: 680, temp: "P", tempLabel: "quadratic peak" },
  { name: "Crematogaster brasiliensis", short: "C. brasiliensis", massMg: 0.48, maxLoadG: 0.3, ratio: 625, temp: "NL", tempLabel: "negative linear" },
  { name: "Procryptocerus belti", short: "P. belti", massMg: 1.02, maxLoadG: 0.6, ratio: 588, temp: "NR", tempLabel: "no relationship" },
  { name: "Azteca trigona", short: "A. trigona", massMg: 0.91, maxLoadG: 0.3, ratio: 330, temp: "NL", tempLabel: "negative linear" },
  { name: "Atta colombica", short: "A. colombica", massMg: 5.65, maxLoadG: 1.2, ratio: 212, temp: "NL", tempLabel: "negative linear" },
  { name: "Camponotus linnaei", short: "C. linnaei", massMg: 2.53, maxLoadG: 0.5, ratio: 198, temp: "NR", tempLabel: "no relationship" },
  { name: "Cephalotes basalis", short: "C. basalis", massMg: 6.26, maxLoadG: 1.1, ratio: 176, temp: "NL", tempLabel: "negative linear" },
  { name: "Dolichoderus bispinosus", short: "D. bispinosus", massMg: 4.46, maxLoadG: 0.4, ratio: 90, temp: "NL", tempLabel: "negative linear" },
  { name: "Cephalotes atratus", short: "C. atratus", massMg: 39.91, maxLoadG: 1.7, ratio: 43, temp: "P", tempLabel: "quadratic peak" },
  { name: "Camponotus sericeiventris", short: "C. sericeiventris", massMg: 55.71, maxLoadG: 2.1, ratio: 38, temp: "P", tempLabel: "quadratic peak" },
  { name: "Paraponera clavata", short: "P. clavata", massMg: 133.76, maxLoadG: 2.8, ratio: 21, temp: "NR", tempLabel: "no relationship" },
];

// ---- Physics ----

/** Isometric frontal-area estimate from body mass (kg). */
export function frontalArea(massKg: number): number {
  return A_REF * Math.pow(massKg / M_REF, 2 / 3);
}

/** Body weight in newtons. */
export function bodyWeight(massKg: number): number {
  return massKg * G;
}

/**
 * Steady wind speed (m/s) whose drag equals a resisting force (N) on a body of
 * the given mass. Inverts F = 0.5 * rho * Cd * A * v^2.
 */
export function windSpeedForForce(forceN: number, massKg: number, cd = CD): number {
  if (forceN <= 0) return 0;
  const A = frontalArea(massKg);
  return Math.sqrt((2 * forceN) / (RHO_AIR * cd * A));
}

export const toMph = (ms: number) => ms * MS_TO_MPH;

// ---- Wind-scale banding for the readout ----

export interface WindBand {
  label: string; // e.g. "Category 5 hurricane"
  scale: string; // short tag, e.g. "SS5"
  blurb: string; // one-liner for the readout
}

/**
 * Map an equivalent wind speed (mph) onto a recognizable band. Combines the
 * Beaufort scale (up to hurricane force) with Saffir-Simpson categories, then
 * flags anything past the strongest recorded surface gust.
 */
export function windBand(mph: number): WindBand {
  if (mph < 1) return { label: "Dead calm", scale: "B0", blurb: "Smoke rises straight up. The ant is in no danger." };
  if (mph < 8) return { label: "Light breeze", scale: "B2", blurb: "You'd feel it on your face. The ant would not." };
  if (mph < 19) return { label: "Gentle to moderate breeze", scale: "B4", blurb: "Leaves and small twigs in constant motion." };
  if (mph < 32) return { label: "Strong breeze", scale: "B6", blurb: "Large branches move; umbrellas turn inside out." };
  if (mph < 39) return { label: "Near gale", scale: "B7", blurb: "Whole trees in motion. Walking into it is work." };
  if (mph < 55) return { label: "Gale to strong gale", scale: "B8-9", blurb: "Twigs snap off; shingles start to go." };
  if (mph < 74) return { label: "Storm force", scale: "B10-11", blurb: "Trees uproot. Widespread structural damage." };
  if (mph < 96) return { label: "Category 1 hurricane", scale: "SS1", blurb: "Hurricane force. The ant is still attached." };
  if (mph < 111) return { label: "Category 2 hurricane", scale: "SS2", blurb: "Roofs and siding fail. The ant does not." };
  if (mph < 130) return { label: "Category 3 hurricane", scale: "SS3", blurb: "Major hurricane. Devastating damage." };
  if (mph < 157) return { label: "Category 4 hurricane", scale: "SS4", blurb: "Catastrophic. Most of the neighborhood is gone." };
  if (mph < MAX_RECORDED_GUST_MPH) return { label: "Category 5 hurricane", scale: "SS5", blurb: "The strongest storms on the planet." };
  return { label: "Faster than any recorded wind", scale: "off-chart", blurb: `Past the 253 mph record gust (Cyclone Olivia, 1996). No such wind has been measured at the surface.` };
}

/** Format an mph value compactly. */
export function fmtMph(mph: number): string {
  if (mph >= 1000) return `${Math.round(mph / 10) * 10}`;
  if (mph >= 100) return mph.toFixed(0);
  return mph.toFixed(1);
}
