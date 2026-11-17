/**
 * Combat arithmetic for the bot: how much damage an attack is *guaranteed* to
 * deal against the best blocks available, and so whether it's lethal.
 *
 * Two questions the one-ply evaluation can't answer on its own, because both
 * are about a turn that hasn't happened yet — *can I win right now by swinging
 * with everything*, and *if I swing, do I die on the way back* ("crackback").
 * Engine rollouts could answer them, but only at the cost of simulating a
 * whole opponent turn per candidate attack, so this is plain arithmetic over
 * computed characteristics instead. See "Combat: the alpha strike and
 * crackback" in `docs/plans/smarter-bots.md`.
 *
 * Blocking legality mirrors `Game.whyCannotBlock`: tapped, "can't block",
 * unblockable, protection, fear, intimidate, skulk, flying/reach, and
 * menace's two blockers. What it deliberately ignores — instant-speed tricks, haste
 * creatures still in hand, removal on blockers — is covered by a flat life
 * margin instead (`EvalWeights.crackbackMargin`).
 */

import type { CardType, Keyword } from "../cards/define.js";
import type { Color } from "../mana.js";
import {
  combatDamageOf,
  computeCharacteristics,
  lethalDamageOf,
  unblockedAssignmentOf,
  withComputedCache,
} from "../characteristics.js";
import { blocksDespiteLandwalk, landTypesControlledBy, landwalkStopsBlocksBy, readyToBlock } from "../combat/eligibility.js";
import type { CardRegistry } from "../cards.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { POISON_LETHAL } from "../state.js";
import { LANDWALK } from "../subtypes.js";
import { COMMANDER_DAMAGE_LETHAL } from "../view.js";

/** A creature as combat arithmetic sees it. */
export interface CombatCreature {
  readonly id: ObjectId;
  readonly power: number;
  readonly toughness: number;
  /** The combat damage it assigns (`combatDamageOf`): its power, or its
   * toughness under Doran, the Siege Tower and the like. What every
   * question here about damage dealt reads; `power` stays the real power,
   * for valuing the creature. */
  readonly damage: number;
  /** The damage that kills it (`lethalDamageOf`): its toughness, or its
   * power — at least 1 — under Zilortha, Strength Incarnate. What every
   * question here about what dies or what a blocker holds back reads;
   * `toughness` stays the real toughness, for valuing the creature. */
  readonly lethal: number;
  readonly keywords: ReadonlySet<Keyword>;
  readonly colors: ReadonlySet<Color>;
  readonly types: readonly CardType[];
  readonly protectionColors: ReadonlySet<Color>;
  readonly protectionTypes: ReadonlySet<CardType>;
  readonly canBlock: boolean;
  readonly canAttack: boolean;
  readonly isCommander: boolean;
  /** Land types its controller controls, which a landwalker attacking them
   * can't be blocked past (rule 702.14). */
  readonly controllerLands: ReadonlySet<string>;
  /** Who controls it, and the players whose lands its landwalk of a kind no
   * keyword names walks past (`Characteristics.landwalk`, rule 702.14c): a
   * land filter isn't a word to look up in `controllerLands`, so it's asked
   * here, only of a creature that has one. */
  readonly controller: PlayerId;
  readonly walkedPast?: ReadonlySet<PlayerId>;
  /** It can block landwalkers as though they didn't have landwalk (Street
   * Savvy, `blocksDespiteLandwalk`). */
  readonly blocksLandwalkers?: boolean;
  /** It may (or must) assign its combat damage as though it weren't blocked
   * (Thorn Elemental): a block stops none of it. */
  readonly assignsPastBlockers?: boolean;
  /** Its total toxic value (rule 702.164b), when it has any: the poison
   * counters a player it deals combat damage to gets, beside the damage.
   * Infect is a keyword (`keywords`). */
  readonly toxic?: number;
}

/** A token stack is expanded to at most this many copies — enough for any
 * blocking question, and bounded however large the stack grows. */
const MAX_COPIES = 30;

/**
 * Every creature `player` controls on the battlefield. `untappedOnly` is what a
 * blocker needs; an attacker on a future turn will have untapped anyway.
 */
export function combatCreatures(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  untappedOnly: boolean,
): CombatCreature[] {
  // A pure read of one state, called outside any other cache region by the
  // combat search: without one, every characteristics fold here was fresh.
  return withComputedCache(() => combatCreaturesUncached(state, registry, player, untappedOnly));
}

function combatCreaturesUncached(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  untappedOnly: boolean,
): CombatCreature[] {
  const out: CombatCreature[] = [];
  const controllerLands = landTypesControlledBy(state, registry, player);
  for (const id of state.zones.shared.battlefield) {
    const object = state.objects[id];
    if (object === undefined || object.controller !== player) continue;
    // Tapped, it can't block — unless it can as though it were untapped
    // (Masako the Humorless).
    const ready = readyToBlock(state, registry, object);
    if (untappedOnly && !ready) continue;
    const c = computeCharacteristics(state, registry, id);
    if (!c.types.includes("creature")) continue;
    const creature: CombatCreature = {
      id,
      power: c.power,
      toughness: c.toughness,
      damage: combatDamageOf(c),
      lethal: lethalDamageOf(c),
      keywords: c.keywords,
      colors: c.colors,
      types: c.types,
      protectionColors: c.protectionFrom.colors,
      protectionTypes: c.protectionFrom.types,
      canBlock: ready && !c.restrictions.has("cant-block"),
      canAttack:
        (!c.keywords.has("defender") || c.canAttackAsThoughNoDefender) &&
        !c.restrictions.has("cant-attack") &&
        combatDamageOf(c) > 0,
      isCommander: object.isCommander,
      controllerLands,
      controller: player,
      ...(c.landwalk.length > 0
        ? {
            walkedPast: new Set(
              state.turnOrder.filter(
                (other) => other !== player && landwalkStopsBlocksBy(state, registry, c.landwalk, other),
              ),
            ),
          }
        : {}),
      ...(blocksDespiteLandwalk(state, registry, object) ? { blocksLandwalkers: true } : {}),
      ...(unblockedAssignmentOf(state, registry, id) !== null ? { assignsPastBlockers: true } : {}),
      ...(c.toxic > 0 ? { toxic: c.toxic } : {}),
    };
    const copies = Math.min(object.stackCount ?? 1, MAX_COPIES);
    for (let i = 0; i < copies; i += 1) out.push(creature);
  }
  return out;
}

/** Can `blocker` legally block `attacker`, menace aside? */
export function canBlock(blocker: CombatCreature, attacker: CombatCreature): boolean {
  if (!blocker.canBlock) return false;
  const a = attacker.keywords;
  if (a.has("unblockable")) return false;
  for (const color of blocker.colors) if (attacker.protectionColors.has(color)) return false;
  for (const type of blocker.types) if (attacker.protectionTypes.has(type)) return false;
  const artifact = blocker.types.includes("artifact");
  if (a.has("fear") && !artifact && !blocker.colors.has("B")) return false;
  if (a.has("intimidate") && !artifact) {
    let shares = false;
    for (const color of attacker.colors) if (blocker.colors.has(color)) shares = true;
    if (!shares) return false;
  }
  if (a.has("flying") && !blocker.keywords.has("flying") && !blocker.keywords.has("reach")) {
    return false;
  }
  // Skulk (rule 702.118b): no blocker with greater power.
  if (a.has("skulk") && blocker.power > attacker.power) return false;
  // Shadow (rule 702.28b): only shadow blocks shadow, and only shadow.
  if (a.has("shadow") !== blocker.keywords.has("shadow")) return false;
  // Horsemanship (rule 702.31b): only horsemanship blocks it.
  if (a.has("horsemanship") && !blocker.keywords.has("horsemanship")) return false;
  if (blocker.blocksLandwalkers === true) return true;
  for (const [keyword, landType] of LANDWALK) {
    if (a.has(keyword) && blocker.controllerLands.has(landType)) return false;
  }
  if (attacker.walkedPast?.has(blocker.controller) === true) return false;
  return true;
}

/** Damage an attacker deals if nothing blocks it. */
const unblockedDamage = (attacker: CombatCreature): number =>
  Math.max(0, attacker.damage) * (attacker.keywords.has("double-strike") ? 2 : 1);

/** The life a player loses to `dealt` combat damage from `attacker`: none
 * from a source with infect, whose damage is poison counters instead (rule
 * 702.90b). */
const lifeLost = (attacker: CombatCreature, dealt: number): number => (attacker.keywords.has("infect") ? 0 : dealt);

/** The poison counters a player gets from `dealt` combat damage by
 * `attacker`: that many from a source with infect (rule 702.90b); its total
 * toxic value each time it deals any (rule 702.164c), so twice from a double
 * striker. */
const poisonGiven = (attacker: CombatCreature, dealt: number): number =>
  dealt <= 0
    ? 0
    : attacker.keywords.has("infect")
      ? dealt
      : (attacker.toxic ?? 0) * (attacker.keywords.has("double-strike") ? 2 : 1);

export interface DamageThrough {
  /** Total damage to the defending player that costs them life: a source
   * with infect deals none (`poison`). */
  readonly damage: number;
  /** The poison counters the defending player can't block their way out of
   * (infect, toxic): the least the attackers give when the blocks are chosen
   * against poison rather than damage. Left out when there are none.
   * {@link isLethal} reads it beside the damage; a defender dead to neither
   * alone but to the two together, on different blocks, isn't seen. */
  readonly poison?: number;
  /** Of that, how much each commander dealt. */
  readonly commanderDamage: ReadonlyMap<ObjectId, number>;
  /** Life the defending player gains in the same combat from blockers with
   * lifelink (rule 702.15b: gained as the damage is dealt, so before
   * state-based actions look at their life). `isLethal` takes it off the
   * damage. Left out when a first or double striker gets damage through:
   * that damage lands a step before the blockers' does. Not read: a player
   * who can't gain life (rule 119.7). */
  readonly gained?: number;
}

/** Deals its combat damage in the first combat damage step (rule 510.4). */
const strikesFirst = (c: CombatCreature): boolean =>
  c.keywords.has("first-strike") || c.keywords.has("double-strike");

/** The life a lifelink `blocker` gains its controller by blocking
 * `attacker`: its damage, unless the attacker strikes first and kills it
 * before it deals any. */
function lifelinkGain(blocker: CombatCreature, attacker: CombatCreature): number {
  if (!blocker.keywords.has("lifelink") || blocker.damage <= 0) return 0;
  const diesFirst =
    strikesFirst(attacker) &&
    !strikesFirst(blocker) &&
    attacker.damage > 0 &&
    (attacker.damage >= blocker.lethal || attacker.keywords.has("deathtouch"));
  return diesFirst ? 0 : blocker.damage;
}

/**
 * The least damage `attackers` are guaranteed to deal to a player defending
 * with `blockers`, who blocks to take as little as possible.
 *
 * Greedy rather than an exact assignment: the attackers that would deal the
 * most are blocked first (ties to the one with fewer legal blockers), and each
 * takes the blocker useful against the fewest other attackers — so a reach
 * creature is saved for a flyer when a ground blocker would do. A trampler
 * takes the one with the most toughness instead, since only what's lethal to
 * it holds it back (`lethal`: toughness, or power under Zilortha). Menace
 * needs two. Close to exact at the board sizes that come up.
 *
 * Blockers with lifelink gain their controller life as they deal damage
 * (`gained`), and one left over joins a block already made for that alone.
 * Ten 1/1 lifelink Soldiers in front of seventeen attackers read as dead at
 * 12 life without it, and so "dead either way": the bot tapped eight of them
 * for Nullmage Shepherd and died to the attack (a watched game, 2026-11-15).
 */
export function damageThrough(
  attackers: readonly CombatCreature[],
  blockers: readonly CombatCreature[],
): DamageThrough {
  const free = new Set(blockers.map((_, i) => i));
  const legal = attackers.map((attacker) =>
    blockers.map((blocker, i) => (canBlock(blocker, attacker) ? i : -1)).filter((i) => i >= 0),
  );
  const order = attackers
    .map((_, i) => i)
    .sort(
      (x, y) =>
        unblockedDamage(attackers[y]) - unblockedDamage(attackers[x]) ||
        legal[x].length - legal[y].length,
    );
  const usefulness = (b: number): number => legal.filter((l) => l.includes(b)).length;

  let damage = 0;
  let gained = 0;
  let firstStrikeThrough = false;
  const blocked: number[] = [];
  const commanderDamage = new Map<ObjectId, number>();
  for (const index of order) {
    const attacker = attackers[index];
    const full = unblockedDamage(attacker);
    if (full === 0) continue;
    const trample = attacker.keywords.has("trample");
    const needed = attacker.keywords.has("menace") ? 2 : 1;
    const available = legal[index]
      .filter((b) => free.has(b))
      .sort((x, y) =>
        trample
          ? blockers[y].lethal - blockers[x].lethal
          : usefulness(x) - usefulness(y) || blockers[x].lethal - blockers[y].lethal,
      );

    let through = full;
    if (available.length >= needed && attacker.assignsPastBlockers !== true) {
      const chosen = available.slice(0, needed);
      // Blocking only stops a trampler's damage up to what's lethal to the
      // blockers (702.19b): their toughness, or their power under Zilortha.
      const absorbed = chosen.reduce((sum, b) => sum + Math.max(0, blockers[b].lethal), 0);
      const excess = trample ? Math.max(0, full - absorbed) : 0;
      // Worth spending the blockers only if they actually stop something.
      if (full - excess > 0) {
        for (const b of chosen) {
          free.delete(b);
          gained += lifelinkGain(blockers[b], attacker);
        }
        blocked.push(index);
        through = excess;
      }
    }
    damage += lifeLost(attacker, through);
    if (through > 0 && strikesFirst(attacker)) firstStrikeThrough = true;
    // Counted as combat damage dealt, infect or not (rule 903.10a).
    if (attacker.isCommander && through > 0) {
      commanderDamage.set(attacker.id, (commanderDamage.get(attacker.id) ?? 0) + through);
    }
  }
  // A lifelink blocker with nothing left to stop joins a block for its life.
  if (blocked.length > 0 && !firstStrikeThrough) {
    for (const b of free) {
      if (!blockers[b].keywords.has("lifelink")) continue;
      let best = 0;
      for (const index of blocked) {
        if (legal[index].includes(b)) best = Math.max(best, lifelinkGain(blockers[b], attackers[index]));
      }
      gained += best;
    }
  }
  const through: DamageThrough =
    gained > 0 && !firstStrikeThrough ? { damage, commanderDamage, gained } : { damage, commanderDamage };
  if (!attackers.some((attacker) => poisonGiven(attacker, 1) > 0)) return through;
  const poison = poisonThrough(attackers, blockers, legal);
  return poison > 0 ? { ...through, poison } : through;
}

/**
 * {@link damageThrough}'s question asked of poison: the fewest poison
 * counters `attackers` are sure to give a player who blocks against poison
 * first — the same greedy blocks, the attackers that would give the most
 * blocked first. Its own pass because the blocks differ: sixteen 1/1s with
 * toxic 1 beside one 8/8 are sixteen blocks to make on poison and one on
 * life. Found watching the tooling precons (2026-11-16): on 199 life, a bot
 * read sixteen toxic Mites as 15 damage to shrug off and died on ten poison.
 */
function poisonThrough(
  attackers: readonly CombatCreature[],
  blockers: readonly CombatCreature[],
  legal: readonly (readonly number[])[],
): number {
  const free = new Set(blockers.map((_, i) => i));
  const unblocked = (i: number): number => poisonGiven(attackers[i], unblockedDamage(attackers[i]));
  const order = attackers
    .map((_, i) => i)
    .filter((i) => unblocked(i) > 0)
    .sort((x, y) => unblocked(y) - unblocked(x) || legal[x].length - legal[y].length);
  const usefulness = (b: number): number => legal.filter((l) => l.includes(b)).length;

  let poison = 0;
  for (const index of order) {
    const attacker = attackers[index];
    const full = unblockedDamage(attacker);
    const trample = attacker.keywords.has("trample");
    const needed = attacker.keywords.has("menace") ? 2 : 1;
    const available = legal[index]
      .filter((b) => free.has(b))
      .sort((x, y) =>
        trample
          ? blockers[y].lethal - blockers[x].lethal
          : usefulness(x) - usefulness(y) || blockers[x].lethal - blockers[y].lethal,
      );
    let given = unblocked(index);
    if (available.length >= needed && attacker.assignsPastBlockers !== true) {
      const chosen = available.slice(0, needed);
      const absorbed = chosen.reduce((sum, b) => sum + Math.max(0, blockers[b].lethal), 0);
      const past = poisonGiven(attacker, trample ? Math.max(0, full - absorbed) : 0);
      if (past < given) {
        for (const b of chosen) free.delete(b);
        given = past;
      }
    }
    poison += given;
  }
  return poison;
}

/**
 * Does `through` kill `defender` — on life, on 21 damage from any one
 * commander counting what they've already taken, or on ten poison counters
 * counting the ones they have (rule 704.5c)? `margin` is life the defender
 * is assumed to find from somewhere (a trick, a blocker from hand); poison
 * is counted to the counter.
 */
export function isLethal(
  state: GameState,
  defender: PlayerId,
  through: DamageThrough,
  margin = 0,
): boolean {
  const p = state.players[defender];
  if (p === undefined || p.hasLost) return false;
  if (through.damage - (through.gained ?? 0) >= p.life + margin) return true;
  for (const [commander, amount] of through.commanderDamage) {
    if ((p.commanderDamageTaken[commander] ?? 0) + amount >= COMMANDER_DAMAGE_LETHAL) return true;
  }
  const poison = through.poison ?? 0;
  return poison > 0 && (p.counters.poison ?? 0) + poison >= POISON_LETHAL;
}

/** The steps of a turn in which its player's attack is still to be declared. */
const ATTACK_TO_COME: ReadonlySet<string> = new Set(["untap", "upkeep", "draw", "precombat-main", "begin-combat"]);

/**
 * Crackback: before `me` untaps again, every living opponent gets a turn. If
 * each swings every creature able to attack into the blockers `me` has
 * untapped right now, how much gets through?
 *
 * Blockers are reused across opponents — blocking doesn't tap — and each
 * opponent's damage is weighted by `paranoia`, except the one whose turn is
 * next, which always counts in full: at a four-player table the others have
 * each other to attack as well. Commander damage is summed per commander.
 * A later opponent whose swing alone would kill `me` (life within `margin`
 * of it, or 21 from one commander) counts at least `killShot`: a player who
 * can take an elimination mostly does, whoever else is at the table.
 *
 * `lost` are blockers to count as gone — ones a cost is about to tap or
 * sacrifice — or `"all"`, for the crackback with nothing left home.
 *
 * In another player's turn the opponents who have had their turn since `me`
 * last untapped are out of it: what is left is the turn's player, while its
 * attack is still to be declared ({@link ATTACK_TO_COME}), and the players
 * between it and `me`. On the turn of the player before `me`, with its
 * attack made, nothing is.
 */
export function crackback(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  paranoia: number,
  lost?: ReadonlySet<ObjectId> | "all",
  killShot: { readonly weight: number; readonly margin: number } = { weight: 0, margin: 0 },
): DamageThrough {
  let through: DamageThrough = { damage: 0, commanderDamage: new Map() };
  crackbackByOpponent(state, registry, me, paranoia, lost, killShot, (_opponent, sofar) => {
    through = sofar;
    return true;
  });
  return through;
}

/** The opponents whose attack is still to come before `me` untaps again, in
 * the order they act: every living one from a turn of our own; in another
 * player's turn, that player while its attack is still to be declared
 * ({@link ATTACK_TO_COME}) and the players between it and `me`. */
function opponentsToAct(state: GameState, me: PlayerId): PlayerId[] {
  const order = state.turnOrder.filter((p) => !state.players[p].hasLost);
  const mine = order.indexOf(me);
  const opponents = [...order.slice(mine + 1), ...order.slice(0, Math.max(0, mine))];
  const active = state.turnOrder[state.turn.activePlayerIndex];
  const acting = active === undefined ? -1 : opponents.indexOf(active);
  return acting >= 0 ? opponents.slice(ATTACK_TO_COME.has(state.turn.step) ? acting : acting + 1) : opponents;
}

/**
 * {@link crackback}'s sum, one opponent at a time in the order they act:
 * `each` is told the opponent whose swing was just added and the damage
 * through so far, and stops the count by returning `false`. An opponent
 * whose swing counts for nothing (no paranoia, no kill shot) is still told,
 * with the sum unchanged.
 */
function crackbackByOpponent(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  paranoia: number,
  lost: ReadonlySet<ObjectId> | "all" | undefined,
  killShot: { readonly weight: number; readonly margin: number },
  each: (opponent: PlayerId, sofar: DamageThrough) => boolean,
): void {
  const blockers =
    lost === "all"
      ? []
      : combatCreatures(state, registry, me, true).filter((c) => lost === undefined || !lost.has(c.id));
  const opponents = opponentsToAct(state, me);

  let damage = 0;
  let gained = 0;
  let poison = 0;
  const commanderDamage = new Map<ObjectId, number>();
  const shared = Math.max(0, Math.min(1, paranoia));
  const killWeight = Math.max(0, Math.min(1, killShot.weight));
  // The one map throughout: `each` reads it as it stands, and the last
  // record told is the whole sum.
  const sofar = (): DamageThrough => ({
    damage,
    commanderDamage,
    ...(gained > 0 ? { gained } : {}),
    ...(poison > 0 ? { poison } : {}),
  });
  for (const [i, opponent] of opponents.entries()) {
    if (!(i > 0 && shared === 0 && killWeight === 0)) {
      const attackers = combatCreatures(state, registry, opponent, false).filter((c) => c.canAttack);
      const through = damageThrough(attackers, blockers);
      const weight =
        i === 0 ? 1 : killWeight > shared && isLethal(state, me, through, -killShot.margin) ? killWeight : shared;
      if (weight !== 0) {
        gained += (through.gained ?? 0) * weight;
        damage += through.damage * weight;
        poison += (through.poison ?? 0) * weight;
        for (const [commander, amount] of through.commanderDamage) {
          commanderDamage.set(commander, (commanderDamage.get(commander) ?? 0) + amount * weight);
        }
      }
    }
    if (!each(opponent, sofar())) return;
  }
}

/**
 * The opponents still to act before `me` untaps whose swing kills it alone:
 * each one's creatures able to attack into the blockers home, counted in
 * full and by itself, with `margin` life in reserve (none by default).
 *
 * {@link crackback} adds the opponents up, the later ones at a weight, which
 * is the cautious reading and right for calling a board safe. It is the
 * wrong one for calling a board lost: three boards that kill only together
 * rarely all swing at one player. A seat no single opponent can kill has
 * something to protect, however the sum reads.
 */
export function opponentsLethalAlone(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  lost?: ReadonlySet<ObjectId> | "all",
  margin = 0,
): PlayerId[] {
  const blockers =
    lost === "all"
      ? []
      : combatCreatures(state, registry, me, true).filter((c) => lost === undefined || !lost.has(c.id));
  return opponentsToAct(state, me).filter((opponent) => {
    const attackers = combatCreatures(state, registry, opponent, false).filter((c) => c.canAttack);
    return isLethal(state, me, damageThrough(attackers, blockers), margin);
  });
}

/**
 * The opponents `me` lives through before it untaps again, in the order they
 * act: {@link crackback}'s sum taken one opponent further at a time, up to
 * the first whose swing (added to the ones before it) is lethal by
 * {@link isLethal} with `margin` life kept in reserve. All of them when the
 * whole crackback isn't lethal, none when the next swing alone is.
 *
 * "Dead to the table" isn't one thing: a player dead to the third opponent to
 * act and safe from the first two still has two turns of other people's play
 * to live through, and an attack that taps the blockers keeping it alive
 * through those dies sooner than it had to.
 */
export function opponentsOutlived(
  state: GameState,
  registry: CardRegistry,
  me: PlayerId,
  paranoia: number,
  lost?: ReadonlySet<ObjectId> | "all",
  killShot: { readonly weight: number; readonly margin: number } = { weight: 0, margin: 0 },
  margin = 0,
): PlayerId[] {
  const outlived: PlayerId[] = [];
  crackbackByOpponent(state, registry, me, paranoia, lost, killShot, (opponent, sofar) => {
    if (isLethal(state, me, sofar, margin)) return false;
    outlived.push(opponent);
    return true;
  });
  return outlived;
}
