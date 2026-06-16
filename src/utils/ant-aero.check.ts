/**
 * ponytail: one runnable check, no framework. Run with `npx tsx
 * src/utils/ant-aero.check.ts`. Asserts the aero model lands where the
 * follow-up post's prose claims, so the two can't silently drift apart.
 */
import {
  reynolds,
  regimeOf,
  frictionShare,
  blThickness,
  blMeanFraction,
  thresholdMultiplier,
  cdAdjustedThreshold,
  fromMph,
  L_BODY,
  L_HAIR,
} from "./ant-aero.ts";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`FAIL: ${msg}`);
}
function near(a: number, b: number, tol: number, msg: string): void {
  assert(Math.abs(a - b) <= tol, `${msg} (got ${a}, want ~${b})`);
}

// Body is inertial at threshold winds, viscous-leaning at a breeze; hairs are
// always viscous. That split is the whole "three regimes on one animal" claim.
assert(regimeOf(reynolds(fromMph(108), L_BODY)).regime === "inertial", "body inertial at 108 mph");
assert(regimeOf(reynolds(1, L_BODY)).regime === "transitional", "body transitional at 1 m/s");
assert(regimeOf(reynolds(fromMph(273), L_HAIR)).regime === "transitional", "hair never inertial");
assert(regimeOf(reynolds(10, L_HAIR)).regime === "transitional", "hair transitional at 10 m/s");

// Friction carries most of the load at a breeze, a tenth of it at threshold.
assert(frictionShare(1) > 0.35, "friction meaningful at 1 m/s");
assert(frictionShare(fromMph(108)) < 0.12, "friction minor at threshold");

// Boundary layer: tens of mm thick, ant sees ~0.6-0.7 of freestream, so the
// real threshold runs ~1.5x the isolated-body number.
near(blThickness(fromMph(108)) * 1000, 18.5, 2, "delta ~18mm at 108 mph");
assert(blMeanFraction(fromMph(108)) > 0.6 && blMeanFraction(fromMph(108)) < 0.7, "mean fraction ~0.66");
near(thresholdMultiplier(fromMph(108)), 1.52, 0.1, "threshold ~1.5x");

// Cd correction is square-root weak: doubling Cd drops 273 to ~193, not half.
near(cdAdjustedThreshold(273, 2), 193, 3, "Cd=2 -> ~193 mph");

console.log("ant-aero.check.ts: all assertions passed");
