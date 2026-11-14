/**
 * Effects as costs: `AbilityCost.do` and `KickerAlsoCost.do` take an
 * `EffectSpec`, and what makes one payable — rules 118.3 and 601.2h, partial
 * payments aren't allowed — is said here, one row for each kind of effect a
 * cost may be. The `trigger-events.ts` pattern: one table, one check.
 *
 * A cost is paid in full or not at all, so unlike an effect ("as much as you
 * can", rule 609.3) every row answers "can all of this be done now?" before
 * anything moves. `Game.payCostAct` applies the effect as any other once the
 * object is on the stack (601.2h), a decision it raises being an ordinary
 * dispatched one.
 */

import type { EffectAmount, EffectSpec, ResolutionContext } from "./effects.js";
import { amountValue, mayBeDone } from "./effects.js";

/** One kind of effect usable as a cost. */
interface CostActRow<K extends EffectSpec["kind"]> {
  /** Whether all of it can be paid now. Left out, `mayBeDone`'s answer. */
  readonly payable?: (spec: Extract<EffectSpec, { kind: K }>, ctx: ResolutionContext) => boolean;
  /** The most an X in this act could be (601.2b), for the offer. */
  readonly maxX?: (spec: Extract<EffectSpec, { kind: K }>, ctx: ResolutionContext) => number;
  /** It moves a card to or from a library (605.1a: an ability with this cost
   * isn't a mana ability; 601.2h: it's paid after the rest). */
  readonly movesLibrary?: true | ((spec: Extract<EffectSpec, { kind: K }>) => boolean);
  /** It has a random element (601.2h: paid after the rest). */
  readonly random?: true;
}

/** Does this filter-free count amount say X? */
const isX = (amount: EffectAmount | undefined): boolean => amount === "x";

const sourceIsHere = (ctx: ResolutionContext): boolean => ctx.sourceLost !== true;

/**
 * Every effect kind a cost may be. A cost that isn't an action the effect
 * vocabulary has is still a field of `AbilityCost`.
 */
export const COST_ACTS = {
  sequence: {},
  modal: {},
  mill: {
    movesLibrary: true,
    maxX: (_spec, ctx) => ctx.librarySizeOf(ctx.controller),
  },
  "exile-from-library": {
    movesLibrary: true,
    payable: (spec, ctx) => ctx.librarySizeOf(ctx.controller) >= amountValue(spec.amount ?? 1, ctx),
  },
  exile: { payable: (_spec, ctx) => sourceIsHere(ctx) },
  "put-on-library": { movesLibrary: true, payable: (_spec, ctx) => sourceIsHere(ctx) },
  "return-to-hand": { payable: (_spec, ctx) => sourceIsHere(ctx) },
  exert: { payable: (_spec, ctx) => sourceIsHere(ctx) },
  "add-counter": {},
  tap: {},
  untap: {},
  "discard-hand": {},
  discard: { maxX: (spec, ctx) => ctx.handSizeOf(ctx.controller, spec.filter) },
  "remove-counters": {
    payable: (spec, ctx) => ctx.removableCounters(spec) >= (spec.count === "any" ? 0 : amountValue(spec.count, ctx)),
    maxX: (spec, ctx) => ctx.removableCounters(spec),
  },
  sacrifice: {
    payable: (spec, ctx) => ctx.sacrificeCandidateCount(spec.filter) >= amountValue(spec.count, ctx),
    maxX: (spec, ctx) => ctx.sacrificeCandidateCount(spec.filter),
  },
  "sacrifice-source": { payable: (_spec, ctx) => sourceIsHere(ctx) },
  "sacrifice-all": {},
  "look-and-choose": {
    movesLibrary: (spec) => spec.destination === "library-top" || spec.destination === "library-bottom",
    payable: (spec, ctx) => {
      const min = amountValue(spec.min, ctx);
      if (spec.zone === "graveyard") return ctx.countInGraveyard({ ...spec.filter, ownedBy: "you" }, ctx.controller) >= min;
      return mayBeDone(spec, ctx);
    },
  },
  blight: {},
  behold: {},
  "collect-evidence": { payable: (spec, ctx) => ctx.canCollectEvidence(amountValue(spec.amount, ctx)) },
  "pay-energy": {
    payable: (spec, ctx) => ctx.energyOf(ctx.controller) >= amountValue(spec.amount, ctx),
    maxX: (_spec, ctx) => ctx.energyOf(ctx.controller),
  },
  "roll-dice": { random: true },
  foraged: {},
} satisfies { readonly [K in EffectSpec["kind"]]?: CostActRow<K> };

export type CostActKind = keyof typeof COST_ACTS;

function row(spec: EffectSpec): CostActRow<EffectSpec["kind"]> | undefined {
  return (COST_ACTS as Readonly<Record<string, CostActRow<EffectSpec["kind"]>>>)[spec.kind];
}

/** The steps of a cost act: a `sequence`'s, or itself. */
function stepsOf(act: EffectSpec): readonly EffectSpec[] {
  return act.kind === "sequence" ? act.effects.flatMap(stepsOf) : [act];
}

/** Whether `act` can be paid in full now (118.3): every step of a `sequence`,
 * some mode of a `modal`. An effect kind with no row can't be a cost. */
export function costActPayable(act: EffectSpec, ctx: ResolutionContext): boolean {
  if (act.kind === "sequence") return act.effects.every((step) => costActPayable(step, ctx));
  if (act.kind === "modal") return act.modes.some((mode) => costActPayable(mode.effect, ctx));
  const entry = row(act);
  if (entry === undefined) return false;
  return (entry.payable as ((s: EffectSpec, c: ResolutionContext) => boolean) | undefined)?.(act, ctx) ?? mayBeDone(act, ctx);
}

/**
 * `act` with each `modal`'s unpayable modes left out, so a choice offers only
 * the ways it can actually be paid: forage with no Food is only "exile three
 * cards from your graveyard".
 */
export function payableCostAct(act: EffectSpec, ctx: ResolutionContext): EffectSpec {
  if (act.kind === "sequence") return { ...act, effects: act.effects.map((step) => payableCostAct(step, ctx)) };
  if (act.kind === "modal") {
    const modes = act.modes.filter((mode) => costActPayable(mode.effect, ctx));
    return modes.length === 1 ? payableCostAct(modes[0].effect, ctx) : { ...act, modes };
  }
  return act;
}

/** The most an X this act reads could be: the smallest of its steps' caps. */
export function costActMaxX(act: EffectSpec, ctx: ResolutionContext): number | undefined {
  const caps = stepsOf(act).flatMap((step) => {
    if (!stepReadsX(step)) return [];
    const max = (row(step)?.maxX as ((s: EffectSpec, c: ResolutionContext) => number) | undefined)?.(step, ctx);
    return max === undefined ? [] : [max];
  });
  return caps.length === 0 ? undefined : Math.min(...caps);
}

function stepReadsX(step: EffectSpec): boolean {
  return (
    ("amount" in step && isX(step.amount as EffectAmount | undefined)) ||
    ("count" in step && isX(step.count as EffectAmount | undefined))
  );
}

/** Does any step take X, so X is announced though the mana cost has none? */
export function costActReadsX(act: EffectSpec): boolean {
  return stepsOf(act).some(stepReadsX);
}

/** Does any step move a card to or from a library (605.1a)? */
export function costActMovesLibrary(act: EffectSpec): boolean {
  const modal = (step: EffectSpec): readonly EffectSpec[] => (step.kind === "modal" ? step.modes.map((mode) => mode.effect) : [step]);
  return stepsOf(act)
    .flatMap(modal)
    .flatMap(stepsOf)
    .some((step) => {
      const moves = row(step)?.movesLibrary;
      return moves === true || (typeof moves === "function" && (moves as (s: EffectSpec) => boolean)(step));
    });
}

/** Could paying this raise a decision? Only one can wait at a time, so an act
 * that may ask can't sit beside another cost part that asks. */
const ASKS: ReadonlySet<string> = new Set([
  "discard",
  "sacrifice",
  "look-and-choose",
  "collect-evidence",
  "behold",
  "blight",
  "remove-counters",
  "modal",
]);
export function costActMayAsk(act: EffectSpec): boolean {
  return stepsOf(act).some((step) => ASKS.has(step.kind));
}

/** Is any step random, or moving a card from a library (601.2h pays those last)? */
export function costActPaidLast(act: EffectSpec): boolean {
  return stepsOf(act).some((step) => row(step)?.random === true) || costActMovesLibrary(act);
}

/** The kinds in `act` that have no row — none, for a legal cost (a pool test). */
export function costActUnknownKinds(act: EffectSpec): readonly string[] {
  const walk = (step: EffectSpec): readonly string[] => {
    if (step.kind === "sequence") return step.effects.flatMap(walk);
    if (step.kind === "modal") return step.modes.flatMap((mode) => walk(mode.effect));
    return row(step) === undefined ? [step.kind] : [];
  };
  return walk(act);
}

/** Does this act take the ability's own source away (sacrificed, exiled, sent to
 * a hand or a library)? The bots read a repeatable ability off this. */
export function costActLosesSource(act: EffectSpec): boolean {
  return stepsOf(act).some((step) => {
    if (step.kind === "sacrifice-source") return true;
    return (step.kind === "exile" || step.kind === "return-to-hand" || step.kind === "put-on-library") && step.target === "source";
  });
}
