/**
 * `LegalAction` → the concrete `Action`s it stands for.
 *
 * `legalActions()` describes a *shape*: "cast this spell, and here are the
 * legal targets for each of its slots". A searching bot needs the individual
 * fillings, because "Doom Blade the 6/6" and "Doom Blade the 1/1" are the same
 * `LegalAction` and very different moves.
 *
 * The cross-product is capped rather than exhaustive — a spell with three
 * slots over a wide board is a combinatorial trap, and the marginal candidate
 * is almost never the best one. `MAX_TARGET_COMBOS` bounds one action;
 * `EvalBotController` bounds the whole decision.
 */

import type { Action, ConvokePayment, LegalAction } from "../actions.js";
import { convokeProofFor, delvePicks, fillModes, fitModeSet } from "../actions.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { modeChoicesBetween } from "../decisions/shared/subsets.js";
import { targetCombos } from "../decisions/shared/target-combos.js";
import { fitModalXGroup, fitTargetCount, maxXForTargets, targetsWithinTaxes } from "../target-count.js";
import { anyNumberSlot, concatModeSpecs } from "../target.js";
import type { TargetRef, TargetSpec } from "../target.js";

// Re-exported from its new home: a decision module needs it too, and nothing
// under `decisions/` may import from `bot/`.
export { targetCombos };

type CastSpellLegal = Extract<LegalAction, { kind: "cast-spell" }>;
type ActivateAbilityLegal = Extract<LegalAction, { kind: "activate-ability" }>;

/** Per-action ceiling on target fillings. */
export const MAX_TARGET_COMBOS = 8;


/**
 * The cast-time extras beyond targets. `kicked` / `overload` / `free` / `altCost` are
 * echoed back (the engine enumerates each variant as its own `LegalAction`),
 * while a sacrifice cost is a real choice we settle deterministically.
 */
function castExtras(legal: CastSpellLegal): {
  kicked?: boolean;
  kickCount?: number;
  overload?: boolean;
  free?: boolean;
  altCost?: boolean;
  altCostIndex?: number;
  costOption?: number;
  splice?: ObjectId[];
  sacrifice?: ObjectId;
  convoke?: ConvokePayment[];
  prototype?: boolean;
  tap?: ObjectId[];
  webSlingingReturn?: ObjectId;
} {
  const sacrifice = legal.sacrifice;
  const convoke = legal.convoke;
  return {
    ...(legal.kicked === true ? { kicked: true } : {}),
    ...(legal.kickCount !== undefined ? { kickCount: legal.kickCount } : {}),
    ...(legal.keywordCosts !== undefined ? { keywordCosts: legal.keywordCosts } : {}),
    ...(legal.emergeCost !== undefined ? { emergeCost: legal.emergeCost } : {}),
    ...(legal.optionalLife !== undefined ? { optionalLife: legal.optionalLife } : {}),
    ...(legal.evoke === true ? { evoke: true, evokeCost: legal.evokeCost } : {}),
    ...(legal.prototype === true ? { prototype: true } : {}),
    ...(legal.overload === true ? { overload: true } : {}),
    ...(legal.free === true ? { free: true } : {}),
    ...(legal.altCost === true ? { altCost: true } : {}),
    ...(legal.altCostIndex !== undefined ? { altCostIndex: legal.altCostIndex } : {}),
    // Each branch of a choice of additional costs is its own variant, so the
    // chosen one has to be echoed back or the cast is refused.
    ...(legal.costOption !== undefined ? { costOption: legal.costOption } : {}),
    // A splice variant (rule 702.47) names its spliced cards: echoed.
    ...(legal.splice !== undefined ? { splice: legal.splice.map((s) => s.object) } : {}),
    // A harmonize variant names the creature it taps (rule 702.180a): echoed.
    ...(legal.harmonizeTap !== undefined ? { tap: [legal.harmonizeTap.object] } : {}),
    // A web-slinging variant names the creature it returns (rule 702.188a):
    // echoed, so each creature is its own candidate.
    ...(legal.webSlingingReturn !== undefined ? { webSlingingReturn: legal.webSlingingReturn.object } : {}),
    // The last choice rather than the first: `castSpellActions` may only be
    // offering this variant at all because the *most* expendable permanent
    // can pay, and the list is ordered oldest-first.
    ...(sacrifice !== undefined && sacrifice.choices.length > 0
      ? { sacrifice: sacrifice.choices[sacrifice.choices.length - 1] }
      : {}),
    // Convoke is only ever offered when it might be *needed* to afford the
    // spell, and the offer carries a payment that works (`convokeProofFor`).
    // An X spell is cast at its largest X (below), which convoking may be
    // what pays for: take the payment the offer proved for it.
    ...(convoke?.xProof !== undefined && legal.xCost !== undefined
      ? (() => {
          const payment = convokeProofFor(convoke, legal.xCost.maxX);
          return payment.length > 0 ? { convoke: payment } : {};
        })()
      : convoke !== undefined
      ? (() => {
          // The allocation the offer proved castable, as v1 echoes it
          // (`controller.ts`): the first creatures all paying generic left a
          // coloured pip only a creature could pay uncovered, so the cast
          // was refused in every simulation, and dispatched unscored under a
          // clock it threw (`bot-convoke.test.ts`).
          const payment = convokeProofFor(convoke);
          return payment.length > 0 ? { convoke: payment } : {};
        })()
      : {}),
  };
}

/**
 * X at its maximum. Enumerating every X multiplies the search by the mana
 * available and almost always lands on the maximum anyway. A targeted modal
 * spell with X (Clan Defiance) needs it as much as any other: its candidates
 * used to be cast without one. The largest with `targets`, where more
 * targets leave less for X (Fireball).
 */
function xValueOf(
  legal: CastSpellLegal,
  targets: readonly (TargetRef | null)[],
): { xValue?: number; delve?: ObjectId[] } {
  // A sacrifice count (Dargo), counters to remove (Hierophant Bio-Titan):
  // the fewest that pay.
  let xValue =
    legal.xCost === undefined
      ? undefined
      : legal.xCost.sacrifice === true || legal.xCost.removesCounters === true
        ? (legal.xCost.minX ?? 0)
        : maxXForTargets(legal.xCost, legal.targetCount, targets);
  // A March's cards from hand are worth more than X: the largest X mana alone
  // pays, or failing that the least it takes to do anything.
  const byX = legal.delve?.fromHand !== undefined ? legal.delve.byX : undefined;
  if (xValue !== undefined && byX !== undefined) {
    const least = Math.max(1, legal.xCost?.minX ?? 0);
    while (xValue > least && (byX[xValue]?.minCards ?? 0) > 0) xValue -= 1;
  }
  // Delve as much as the cost at that X allows (`delvePicks`).
  const delve = legal.delve === undefined ? undefined : delvePicks(legal.delve, xValue ?? 0, "most");
  return { ...(xValue !== undefined ? { xValue } : {}), ...(delve !== undefined ? { delve } : {}) };
}

function castCandidates(legal: CastSpellLegal, player: PlayerId): Action[] {
  // An assist variant (rule 702.132a) waits on another player's help, which
  // an opponent rarely gives: the bot casts what it pays for itself, as v1
  // does (`wouldCast`). Asked to help, it searches the amounts.
  if (legal.assist !== undefined) return [];
  const common = {
    type: "cast-spell" as const,
    player,
    card: legal.card,
    ...(legal.via !== undefined ? { via: legal.via } : {}),
    ...(legal.graveyardGrant !== undefined ? { graveyardGrant: legal.graveyardGrant } : {}),
    ...(legal.face !== undefined ? { face: legal.face } : {}),
    ...castExtras(legal),
  };

  // A targeted modal spell picks its modes at cast time. Every subset of modes
  // *and* every targeting of each is far too wide, so each choice of modes
  // takes each mode's first target — the best, once `aimOffer` has ranked
  // them — and the choices are capped. First, as many modes as allowed (what
  // this used to offer as its only candidate), then each mode alone, then the
  // other combinations: a "choose one" spell used to be tried only in its
  // first mode, and "choose one or more" only as every mode at once, aimed at
  // whatever came first — Clan Defiance, X damage to its own flyer, its own
  // creature and itself, which is why it was the card v2 most often left in
  // hand.
  const modal = legal.castModal;
  if (modal !== undefined) {
    const fillable = modal.modes
      .map((_mode, index) => index)
      .filter((index) => modal.modes[index].targetOptions.every((o) => o.length > 0));
    const repeat = modal.repeatModes === true;
    if (fillable.length < (repeat ? Math.min(1, modal.minModes) : modal.minModes)) return [];
    // Spree (rule 702.172a): only the sets of modes it can pay for. A mode
    // that may repeat (rule 700.2d) also comes as every multiset of them.
    const sets = modal.modeSets;
    const most =
      sets !== undefined
        ? fitModeSet(sets, fillable)
        : fillModes(fillable, modal.minModes, modal.maxModes, repeat);
    if (most === null) return [];
    const choices = [most];
    const seenModes = new Set([JSON.stringify(most)]);
    // Pawprints (rule 700.2i) list every multiset, more than the cap: the
    // fullest are the ones worth a look, and none at all never is.
    const tried = modal.pawprintBudget !== undefined ? [...(sets ?? [])].reverse() : sets;
    for (const modes of tried ??
      modeChoicesBetween(fillable, Math.max(1, modal.minModes), modal.maxModes, repeat, MAX_TARGET_COMBOS * 2)) {
      if (choices.length >= MAX_TARGET_COMBOS) break;
      if (modes.length === 0) continue;
      const key = JSON.stringify(modes);
      if (seenModes.has(key)) continue;
      seenModes.add(key);
      choices.push([...modes]);
    }
    const out: Action[] = [];
    for (const modes of choices) {
      // A mode with an "any number of" group takes as many of its best as
      // the cap lists (the fit below trims them to what X allows).
      const picked = modes.flatMap((index, k) => {
        const { targetOptions, targetSpecs } = modal.modes[index];
        if (anyNumberSlot(targetSpecs) < 0) return targetCombos(targetOptions, 1, targetSpecs)[0] ?? [];
        const combos = targetCombos(targetOptions, MAX_TARGET_COMBOS, targetSpecs);
        const best = combos.reduce<(TargetRef | null)[]>((most, c) => (c.length > most.length ? c : most), combos[0] ?? []);
        // A mode ending in a group with a later mode's targets after it: an
        // empty slot ends the group (Kamahl's Will — `targetSpans`).
        const last = targetSpecs[targetSpecs.length - 1];
        const later = modes.slice(k + 1).some((m) => modal.modes[m].targetSpecs.length > 0);
        return typeof last === "object" && last.kind === "any-number" && later ? [...best, null] : best;
      });
      const fitted = fitTargets(
        legal,
        picked,
        modes.flatMap((index) => modal.modes[index].targetOptions),
        concatModeSpecs(modes.map((index) => modal.modes[index].targetSpecs)),
      );
      if (fitted === null) continue;
      // A group tied to X in a chosen mode (Heliod's Intervention): its
      // members and X fitted together, at the largest X they allow.
      const x = xValueOf(legal, fitted);
      const withX = fitModalXGroup(
        concatModeSpecs(modes.map((index) => modal.modes[index].targetSpecs)),
        fitted,
        legal.xCost,
        x.xValue,
      );
      if (withX === null) continue;
      out.push({
        ...common,
        ...x,
        ...(legal.xCost !== undefined && withX.xValue !== undefined ? { xValue: withX.xValue } : {}),
        targets: withX.targets,
        modes,
      });
    }
    return out;
  }

  // A "for each target" cost (Hinata) makes only some fillings affordable:
  // each is fitted into the offered range, and one that can't be is dropped.
  const seen = new Set<string>();
  const out: Action[] = [];
  for (const combo of targetCombos(legal.targetOptions, MAX_TARGET_COMBOS, legal.targetSpecs)) {
    const targets = fitTargets(legal, combo, legal.targetOptions, legal.targetSpecs);
    if (targets === null) continue;
    const key = JSON.stringify(targets);
    if (seen.has(key)) continue;
    seen.add(key);
    const withX = { ...common, ...xValueOf(legal, targets), targets };
    out.push(...(legal.xCost?.paidInLife === true ? lifeXLadder(legal.xCost).map((xValue) => ({ ...withX, xValue })) : [withX]));
  }
  return out;
}

/**
 * The X values tried for an X paid in life (Toxic Deluge): its maximum is the
 * whole life total, which no board is worth, so the search weighs a ladder
 * instead — each X up to 8, then wider steps, smallest first — and each X's
 * life against what it does. At the maximum alone, v2 never cast Toxic
 * Deluge (0 of 10 games it could, 2026-11-09) and v1 paid 20 life for it.
 */
const LIFE_X_LADDER = [1, 2, 3, 4, 5, 6, 7, 8, 10, 13, 16, 20] as const;

function lifeXLadder(xCost: { readonly maxX: number; readonly minX?: number }): number[] {
  const low = Math.max(1, xCost.minX ?? 0);
  const xs = LIFE_X_LADDER.filter((x) => x >= low && x <= xCost.maxX);
  return xs.length > 0 ? xs : [xCost.maxX];
}

function fitTargets(
  legal: CastSpellLegal,
  chosen: readonly (TargetRef | null)[],
  options: readonly (readonly TargetRef[])[],
  specs: readonly TargetSpec[],
): (TargetRef | null)[] | null {
  const fitted = legal.targetCount === undefined ? [...chosen] : fitTargetCount(chosen, options, specs, legal.targetCount);
  return fitted === null || !targetsWithinTaxes(legal, fitted) ? null : fitted;
}

function abilityCandidates(legal: ActivateAbilityLegal, player: PlayerId): Action[] {
  const sacrifice = legal.sacrifice;
  const common = {
    type: "activate-ability" as const,
    player,
    source: legal.source,
    abilityIndex: legal.abilityIndex,
    ...(sacrifice !== undefined && sacrifice.choices.length > 0
      ? { sacrifice: sacrifice.choices[sacrifice.choices.length - 1] }
      : {}),
    ...(legal.xCost !== undefined ? { xValue: legal.xCost.maxX } : {}),
    ...(legal.modes !== undefined ? { modes: legal.modes } : {}),
    // The opponent named to choose some of its targets (rule 601.2c).
    ...(legal.otherChooser !== undefined ? { otherChooser: legal.otherChooser } : {}),
  };
  const combos = targetCombos(legal.targetOptions, MAX_TARGET_COMBOS, legal.targetSpecs);
  // A "−X" loyalty ability (rule 107.3a): X at its maximum spends every
  // counter and the planeswalker with them (704.5i), so each X from 1 up is
  // a candidate of its own — few, a planeswalker's loyalty being small — and
  // the search weighs what X buys against what it leaves.
  if (legal.loyalty === "-x" && legal.xCost !== undefined) {
    const low = Math.max(1, legal.xCost.minX ?? 0);
    const xs: number[] = [];
    for (let x = legal.xCost.maxX; x >= low; x -= 1) xs.push(x);
    if (xs.length === 0) xs.push(legal.xCost.maxX);
    const perX = Math.max(1, Math.floor((MAX_TARGET_COMBOS * 3) / xs.length));
    return xs.flatMap((xValue) => combos.slice(0, perX).map((targets) => ({ ...common, xValue, targets })));
  }
  return combos.map((targets) => ({ ...common, targets }));
}

/**
 * The concrete actions `legal` stands for, for `player`.
 *
 * Only the priority-window kinds are expanded. Combat declarations are
 * deliberately excluded: attacker subsets are `(defenders + 1) ^ creatures`,
 * which a ten-creature board turns into roughly a million, so those stay
 * constructive (`HeuristicBotController.declareAttackers`) and are never
 * enumerated.
 */
export function candidateActions(
  legal: LegalAction,
  player: PlayerId,
): Action[] {
  switch (legal.kind) {
    case "play-land":
      return [
        {
          type: "play-land",
          player,
          card: legal.card,
          ...(legal.face !== undefined ? { face: legal.face } : {}),
          ...(legal.graveyardGrant !== undefined ? { graveyardGrant: legal.graveyardGrant } : {}),
        },
      ];
    case "cast-spell":
      return castCandidates(legal, player);
    case "activate-ability":
      return abilityCandidates(legal, player);
    case "suspend":
      // Suspend X: the most X there is, as a morph's below. A counter more is a
      // turn later, but on all five cards a trigger more as well.
      return [{ type: "suspend", player, card: legal.card, ...(legal.xCost !== undefined ? { xValue: legal.xCost.maxX } : {}) }];
    case "foretell":
      return [{ type: "foretell", player, card: legal.card }];
    case "plot":
      return [{ type: "plot", player, card: legal.card }];
    // A companion into the hand: the search weighs {3} for the card against
    // spending the mana on something else.
    case "take-companion":
      return [{ type: "take-companion", player }];
    // Turning a manifested creature face up: the search weighs it against
    // passing like any other play.
    case "turn-face-up":
      return [
        {
          type: "turn-face-up",
          player,
          permanent: legal.permanent,
          ...(legal.morph !== undefined ? { morph: true } : {}),
          // The most X there is, the search weighing it against passing.
          ...(legal.xCost !== undefined ? { xValue: legal.xCost.maxX } : {}),
        },
      ];
    case "unlock-door":
      return [{ type: "unlock-door", player, permanent: legal.permanent, door: legal.door }];
    // Ending a Licid's Aura effect: weighed like any other play (saving it
    // from a host about to die, say).
    case "end-licid-effect":
      return [{ type: "end-licid-effect", player, permanent: legal.permanent }];
    // Paying to ignore Leonin Arbiter: weighed like any other play, which only
    // a search it lets through can make worth the mana.
    case "ignore-static-effect":
      return [{ type: "ignore-static-effect", player, permanent: legal.permanent }];
    case "cycle":
      return [{ type: "cycle", player, card: legal.card }];
    default:
      return [];
  }
}
