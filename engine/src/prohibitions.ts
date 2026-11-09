/**
 * One record for "can't" (rule 101.2: "can't" beats "can"). See
 * `docs/plans/need-key-themes.md`, theme 3c's design note (step 7).
 *
 * A {@link Prohibition} says what can't be done, by whom or to what. It has one
 * spelling on a static ability (`StaticAbility.prohibits`) and in an effect
 * (the `prohibit` effect, lowered to a timed static as it resolves), and one
 * read: {@link liveProhibitions}, then a player or object test at each gate.
 */

import type { CardRegistry } from "./cards/card-registry.js";
import type { StaticAbility } from "./cards/define.js";
import {
  computedCacheMemo,
  emblemStatics,
  grantedStatics,
  hasLostAbilities,
  playerIgnoresStatic,
  staticConditionMet,
} from "./characteristics.js";
import { defendingPlayerOf } from "./combat/eligibility.js";
import type { PlayerScope } from "./effects.js";
import { matchesFilter, type CardFilter } from "./filter.js";
import type { ObjectRef } from "./refs.js";
import { rulesTextName } from "./state.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { GameObject, GameState, ZoneType } from "./state.js";
import type { TargetRef } from "./target.js";

/** A static's words for who a prohibition binds, from its controller's side. */
export type StaticWho =
  | "you"
  | "opponents"
  | "each-player"
  | "enchanted-player"
  /** The controller of the permanent this Aura enchants (Brand of Ill Omen). */
  | "enchanted-controller"
  /** The player this creature is attacking, or that planeswalker's controller
   * (Wardscale Dragon). Nobody when it isn't attacking. */
  | "defending-player";

/** The players a resolved effect named (rule 611.2c: fixed as it resolves). */
export interface BoundPlayers {
  readonly players: readonly PlayerId[];
}

/** What's stored: a static's words, or the players an effect named. */
export type ProhibitedPlayer = StaticWho | BoundPlayers;

/** One permanent in the stint an effect named it (rule 400.7). */
export interface BoundObject {
  readonly object: ObjectId;
  readonly stint: number;
}

/**
 * What an object-side act reaches. `object` is a filter from the source's
 * controller's side, so `hostOfSource` ("enchanted creature"), `isSource` and
 * `inZone` ("cards in graveyards") all work; `target` is an effect's spelling
 * ("target creature"), resolved into `objects`.
 */
export interface ObjectSide {
  readonly object?: CardFilter;
  readonly target?: ObjectRef;
  readonly objects?: readonly BoundObject[];
}

/** When a cast or an activation is still allowed — "can cast spells only…". */
export type ProhibitionUnless = "sorcery-timing" | "own-turn";

/** The kinds of ability an `activate` or a paid cost leaves alone. */
export type AbilityExempt = "mana" | "loyalty";

/** One thing that can't be done. `W` is how an effect names a player before
 * it resolves; everything stored has been bound to {@link ProhibitedPlayer}. */
export type Prohibition<W = ProhibitedPlayer> =
  | {
      /** "Can't cast spells" (rule 601.3). `limit`: only once they've cast
       * this many matching ones this turn, each read as it was cast (Rule of
       * Law). `more`: an effect's "only one more", bound into `limit` as it
       * resolves. `from`/`notFrom`: where the card is as the cast begins
       * (rule 601.2a). `unless`: "only any time they could cast a sorcery",
       * "only during their own turns". */
      readonly act: "cast";
      readonly who: W;
      readonly filter?: CardFilter;
      readonly from?: readonly ZoneType[];
      readonly notFrom?: readonly ZoneType[];
      readonly limit?: number;
      readonly more?: number;
      readonly unless?: ProhibitionUnless;
    }
  | {
      /** "Can't play lands" (rule 305.2). */
      readonly act: "play-land";
      readonly who: W;
      readonly filter?: CardFilter;
      readonly from?: readonly ZoneType[];
      readonly notFrom?: readonly ZoneType[];
    }
  | ({
      /** "Activated abilities of [these] can't be activated" (rule 602.5).
       * `of` reaches permanents alone (rule 109.2) unless `anyZone`. No `of`,
       * no objects: every ability. `only`: just loyalty abilities, or just
       * those with {T} in their costs. */
      readonly act: "activate";
      readonly who: W;
      readonly of?: CardFilter;
      readonly except?: readonly AbilityExempt[];
      readonly only?: "loyalty" | "tap";
      readonly anyZone?: true;
      readonly unless?: ProhibitionUnless;
    } & Pick<ObjectSide, "target" | "objects">)
  | {
      /** "Can't draw more than N cards each turn"; 0 is "can't draw cards".
       * See `Game.cantDrawMore`. */
      readonly act: "draw";
      readonly who: W;
      readonly perTurn: number;
    }
  | {
      /** "Can't search libraries." `causedByThemselves`: only a search of
       * their own library by an effect they control (Ashiok, Dream Render).
       * `ignoreCost`: any player may pay this for that player to ignore this
       * effect this turn (Leonin Arbiter, rule 116.2d). */
      readonly act: "search";
      readonly who: W;
      readonly causedByThemselves?: true;
      readonly ignoreCost?: string;
    }
  | {
      /** "Can't lose the game" (rule 104.3); conceding still loses (104.3a).
       * `only: "zero-life"`: "don't lose the game for having 0 or less life",
       * which stops rule 704.5a's loss and nothing else. */
      readonly act: "lose-game";
      readonly who: W;
      readonly only?: "zero-life";
    }
  | {
      /** "Can't win the game"; being the last player left still wins (104.2a). */
      readonly act: "win-game";
      readonly who: W;
    }
  | {
      /** "Can't lose life" (rule 119.8): damage is still dealt. */
      readonly act: "lose-life";
      readonly who: W;
    }
  | {
      /** "Your life total can't change" (rules 119.7, 119.8). */
      readonly act: "change-life";
      readonly who: W;
    }
  | {
      readonly act: "become-monarch";
      readonly who: W;
    }
  | {
      /** "Can't pay life to cast spells or activate abilities" (Angel of
       * Jubilation). Only those costs: a shock land's life is still paid. */
      readonly act: "pay-life";
      readonly who: W;
      readonly except?: readonly AbilityExempt[];
    }
  | {
      /** "…or sacrifice creatures to cast spells or activate abilities." */
      readonly act: "sacrifice-for-cost";
      readonly who: W;
      readonly filter?: CardFilter;
      readonly except?: readonly AbilityExempt[];
    }
  | {
      /** "Spells and abilities your opponents control can't cause you to
       * discard cards or sacrifice permanents" (Sigarda, Tamiyo). `who` is
       * the player protected. The cause's controller is read as an opponent
       * of the player protected. */
      readonly act: "be-caused";
      readonly who: W;
      readonly what: "discard" | "sacrifice";
    }
  | ({
      readonly act: "untap" | "transform" | "phase-in" | "phase-out" | "enter" | "become-suspected";
    } & ObjectSide)
  | ({
      /** "Can't be enchanted / equipped." `other`: "by other Auras". */
      readonly act: "be-attached";
      readonly attachment: "aura" | "equipment";
      readonly other?: true;
    } & ObjectSide)
  | ({
      /** "Can't be the target of …" (rules 601.2c, 602.2b). `by`:
       * "`opponents`" is what an opponent of this prohibition's controller
       * controls. `sourceFilter`: the source's own qualities. `only`: spells. */
      readonly act: "be-targeted";
      readonly who?: W;
      readonly by?: "opponents";
      readonly sourceFilter?: CardFilter;
      readonly only?: "spells";
    } & ObjectSide)
  | ({
      /** "Can't have counters put on it", "players can't get counters". */
      readonly act: "get-counters";
      readonly who?: W;
      readonly kind?: string;
    } & ObjectSide);

/** A prohibition as an effect writes it, before it resolves. */
export type EffectProhibition = Prohibition<PlayerScope>;

/** Every act's name. */
export type ProhibitionAct = Prohibition["act"];

/** The record for one act. */
export type ProhibitionOf<A extends ProhibitionAct> = Extract<Prohibition, { readonly act: A }>;

/** A live prohibition: what says so, and on what. */
export interface LiveProhibition<A extends ProhibitionAct = ProhibitionAct> {
  readonly source: GameObject;
  readonly ability: StaticAbility;
  readonly prohibition: ProhibitionOf<A>;
}

/** Every static on the battlefield (granted ones too) and the emblems. */
function eachStatic(
  state: GameState,
  registry: CardRegistry,
  visit: (source: GameObject, ability: StaticAbility) => void,
): void {
  for (const id of state.zones.shared.battlefield) {
    const source = state.objects[id];
    if (source === undefined || state.players[source.controller]?.hasLost === true) continue;
    if (!hasLostAbilities(state, registry, source)) {
      for (const ability of registry.get(rulesTextName(source)).static) visit(source, ability);
    }
    for (const ability of grantedStatics(state, registry, source)) visit(source, ability);
  }
  for (const { source, ability } of emblemStatics(state)) visit(source, ability);
}

/** Each static's prohibitions. Their conditions are read by
 * {@link liveProhibitions}, never cached here. */
function prohibitionTable(state: GameState, registry: CardRegistry): readonly LiveProhibition[] {
  return computedCacheMemo("prohibitions", () => {
    const out: LiveProhibition[] = [];
    eachStatic(state, registry, (source, ability) => {
      for (const prohibition of ability.prohibits ?? []) out.push({ source, ability, prohibition });
    });
    return out;
  });
}

/** The prohibitions of `act` in force now. */
export function liveProhibitions<A extends ProhibitionAct>(
  state: GameState,
  registry: CardRegistry,
  act: A,
): readonly LiveProhibition<A>[] {
  const out: LiveProhibition<A>[] = [];
  for (const entry of prohibitionTable(state, registry)) {
    if (entry.prohibition.act !== act) continue;
    if (entry.ability.condition !== undefined && !staticConditionMet(state, registry, entry.source, entry.ability.condition)) {
      continue;
    }
    out.push(entry as unknown as LiveProhibition<A>);
  }
  return out;
}

/** Whether `who`, as `source`'s controller reads it, names `player`. */
export function whoBinds(state: GameState, source: GameObject, who: ProhibitedPlayer, player: PlayerId): boolean {
  if (typeof who === "object") return who.players.includes(player);
  switch (who) {
    case "each-player":
      return true;
    case "you":
      return player === source.controller;
    case "opponents":
      return player !== source.controller;
    case "enchanted-player":
      return player === source.attachedToPlayer;
    case "enchanted-controller": {
      const host = source.attachedTo == null ? undefined : state.objects[source.attachedTo];
      return host?.zone === "battlefield" && host.controller === player;
    }
    case "defending-player": {
      const attacking = source.attacking;
      return attacking != null && defendingPlayerOf(state, attacking) === player;
    }
  }
}

/** The prohibitions of `act` binding `player` now. */
export function prohibitionsOnPlayer<A extends ProhibitionAct>(
  state: GameState,
  registry: CardRegistry,
  act: A,
  player: PlayerId,
): readonly LiveProhibition<A>[] {
  return liveProhibitions(state, registry, act).filter(({ source, prohibition }) => {
    const who = (prohibition as { readonly who?: ProhibitedPlayer }).who;
    return who !== undefined && whoBinds(state, source, who, player);
  });
}

/** Whether a prohibition's object side reaches `id`. Naming none, nothing. */
export function reachesObject(
  state: GameState,
  registry: CardRegistry,
  { source, prohibition }: { readonly source: GameObject; readonly prohibition: ObjectSide },
  id: ObjectId,
): boolean {
  const object = state.objects[id];
  if (object === undefined) return false;
  if (prohibition.objects !== undefined) {
    return prohibition.objects.some((b) => b.object === id && b.stint === (object.zoneChangeCount ?? 0));
  }
  if (prohibition.object === undefined) return false;
  return matchesFilter(state, registry, id, prohibition.object, { you: source.controller, source: source.id });
}

/** Whether `act` can't happen to `id`. */
export function objectProhibited(
  state: GameState,
  registry: CardRegistry,
  act: "untap" | "transform" | "phase-in" | "phase-out" | "enter" | "become-suspected",
  id: ObjectId,
): boolean {
  return liveProhibitions(state, registry, act).some((live) => reachesObject(state, registry, live, id));
}

/** Whether `player` can't lose the game right now (rule 104.3). `reason`:
 * "zero-life" when it's rule 704.5a's loss, the one `only: "zero-life"`
 * stops. Conceding isn't stopped by either (rule 104.3a). */
export function playerCantLoseGame(
  state: GameState,
  registry: CardRegistry,
  player: PlayerId,
  reason?: "zero-life",
): boolean {
  return prohibitionsOnPlayer(state, registry, "lose-game", player).some(
    ({ prohibition }) => prohibition.only === undefined || prohibition.only === reason,
  );
}

/** Whether `player` can't win the game right now; the last player left still
 * wins (rule 104.2a). */
export function playerCantWinGame(state: GameState, registry: CardRegistry, player: PlayerId): boolean {
  return prohibitionsOnPlayer(state, registry, "win-game", player).length > 0;
}

/** Whether `player`'s life total can't change (rules 119.7, 119.8). */
export function playerLifeCantChange(state: GameState, registry: CardRegistry, player: PlayerId): boolean {
  return prohibitionsOnPlayer(state, registry, "change-life", player).length > 0;
}

/** Whether `player` can't lose life (rule 119.8). A life total that can't
 * change can't lose it either. */
export function playerCantLoseLife(state: GameState, registry: CardRegistry, player: PlayerId): boolean {
  return (
    prohibitionsOnPlayer(state, registry, "lose-life", player).length > 0 ||
    playerLifeCantChange(state, registry, player)
  );
}

/** Whether `searcher` can't search `owner`'s library right now, for a search
 * `causedBy` a spell or ability that player controls, unless they paid to
 * ignore that permanent's effect this turn (rule 116.2d). */
export function playerCantSearchLibrary(
  state: GameState,
  registry: CardRegistry,
  searcher: PlayerId,
  owner: PlayerId,
  causedBy: PlayerId,
): boolean {
  return prohibitionsOnPlayer(state, registry, "search", searcher).some(({ source, prohibition }) => {
    if (prohibition.causedByThemselves === true && (causedBy !== searcher || owner !== searcher)) return false;
    return !playerIgnoresStatic(state, searcher, source);
  });
}

/** Whether a spell or ability `causedBy` that player can't make `player` do
 * `what` (Sigarda, Tamiyo). Nothing causes a cost the player pays themself. */
export function causeProhibited(
  state: GameState,
  registry: CardRegistry,
  what: "discard" | "sacrifice",
  player: PlayerId,
  causedBy: PlayerId | undefined,
): boolean {
  if (causedBy === undefined || causedBy === player) return false;
  return prohibitionsOnPlayer(state, registry, "be-caused", player).some(
    ({ source, prohibition }) => prohibition.what === what && causedBy !== source.controller,
  );
}

/** Whether a cost of this kind is exempted by `except`. */
export function costExempt(
  except: readonly AbilityExempt[] | undefined,
  mana: boolean,
  loyalty = false,
): boolean {
  return except !== undefined && ((mana && except.includes("mana")) || (loyalty && except.includes("loyalty")));
}

/** Whether a prohibition stops `forPlayer`, by way of `spell` or `object`,
 * from targeting `ref` (rules 601.2c, 602.2b). */
export function targetProhibited(
  state: GameState,
  registry: CardRegistry,
  ref: TargetRef,
  forPlayer: PlayerId,
  by: { readonly object?: ObjectId; readonly spell?: true } | undefined,
): boolean {
  return liveProhibitions(state, registry, "be-targeted").some((live) => {
    const { source, prohibition } = live;
    if (prohibition.by === "opponents" && forPlayer === source.controller) return false;
    if (prohibition.only === "spells" && by?.spell !== true) return false;
    if (
      prohibition.sourceFilter !== undefined &&
      (by?.object === undefined ||
        !matchesFilter(state, registry, by.object, prohibition.sourceFilter, { you: source.controller, source: source.id }))
    ) {
      return false;
    }
    return ref.kind === "object"
      ? reachesObject(state, registry, live, ref.object)
      : prohibition.who !== undefined && whoBinds(state, source, prohibition.who, ref.player);
  });
}

/** Whether `forPlayer` may target `ref` as though it didn't have hexproof
 * (`targetsIgnoringHexproof`, rule 702.11). */
export function targetsIgnoreHexproof(
  state: GameState,
  registry: CardRegistry,
  ref: TargetRef,
  forPlayer: PlayerId,
): boolean {
  const statics = computedCacheMemo("targets-ignoring-hexproof", () => {
    const out: { readonly source: GameObject; readonly ability: StaticAbility }[] = [];
    eachStatic(state, registry, (source, ability) => {
      if (ability.targetsIgnoringHexproof !== undefined) out.push({ source, ability });
    });
    return out;
  });
  return statics.some(({ source, ability }) => {
    const rule = ability.targetsIgnoringHexproof;
    if (rule === undefined) return false;
    if (rule.anyController !== true && forPlayer !== source.controller) return false;
    if (ability.condition !== undefined && !staticConditionMet(state, registry, source, ability.condition)) return false;
    if (ref.kind === "player") return rule.players === "opponents" && ref.player !== source.controller;
    return (
      rule.object !== undefined &&
      matchesFilter(state, registry, ref.object, rule.object, { you: source.controller, source: source.id })
    );
  });
}
