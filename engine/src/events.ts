/**
 * The event log. Every observable change to game state emits an event; the
 * ordered log is the engine's audit trail and the basis for future replay and
 * networking.
 */

import type { CastVia } from "./actions.js";
import type { CardType, CombatWord } from "./cards.js";
import type { Color, ManaType } from "./mana.js";
import type { ObjectId, PlayerId } from "./primitives.js";
import type { LeftBattlefield, PlayerCounterKind, ZoneType } from "./state.js";
import type { TargetRef } from "./target.js";
import type { Phase, Step } from "./turn.js";
import type { Expiry } from "./duration.js";
import type { PlayedUnder } from "./play-permission.js";

/**
 * What one vote was for (rule 701.38b): one of a vote's named options (its
 * index and words), a permanent (with its battlefield stint, rule 400.7), a
 * player, or a number — an "each player chooses a number" (Wheel of
 * Misfortune), kept the same way.
 */
export type VoteChoice =
  | {
      readonly option: number;
      readonly text: string;
      /** The player this one is about: "for each player, choose friend or
       * foe" is a question per player. */
      readonly about?: PlayerId;
    }
  | { readonly object: ObjectId; readonly zoneChangeCount: number }
  | { readonly player: PlayerId }
  | { readonly number: number };

/** One vote cast: who cast it, and for what. A player with more than one vote
 * (rule 701.38d) casts more than one of these. */
export interface Vote {
  readonly voter: PlayerId;
  readonly choice: VoteChoice;
}

/** Whether two votes are for the same choice. */
export function sameVoteChoice(a: VoteChoice, b: VoteChoice): boolean {
  if ("option" in a) return "option" in b && a.option === b.option && a.about === b.about;
  if ("object" in a) return "object" in b && a.object === b.object && a.zoneChangeCount === b.zoneChangeCount;
  if ("number" in a) return "number" in b && a.number === b.number;
  return "player" in b && a.player === b.player;
}

/** What a random choice picked — the `chosen-at-random` event: a player, a
 * card (in a graveyard everyone sees which; in a hand or face down in exile,
 * only the players who may see it learn what it is — the rest see which
 * object, not its face), or a mode by its text. */
export type RandomPick =
  | { readonly kind: "player"; readonly player: PlayerId }
  | { readonly kind: "card"; readonly object: ObjectId }
  | { readonly kind: "mode"; readonly text: string };

interface Base {
  /** Monotonic sequence number, assigned when the event is appended. */
  readonly seq: number;
}

export type GameEvent =
  | (Base & {
      readonly type: "game-started";
      readonly players: readonly PlayerId[];
      readonly startingPlayer: PlayerId;
      readonly seed: number;
    })
  | (Base & {
      readonly type: "turn-began";
      readonly turn: number;
      /** The round it begins in (`TurnState.round`). */
      readonly round?: number;
      readonly activePlayer: PlayerId;
      /** True when this is an extra turn (Time Warp — ROADMAP Phase 7). */
      readonly extra?: boolean;
    })
  | (Base & {
      /** An extra-turn effect (Time Warp) queued a turn for `player`. */
      readonly type: "extra-turn-queued";
      readonly player: PlayerId;
    })
  | (Base & {
      /** `player`'s turn was skipped (rule 614.10): it never began. */
      readonly type: "turn-skipped";
      readonly player: PlayerId;
    })
  | (Base & {
      /** `controller` begins making `controlled`'s decisions (rule 723). */
      readonly type: "player-control-began";
      readonly controlled: PlayerId;
      readonly controller: PlayerId;
      readonly during: "next-turn" | "next-combat" | "search";
    })
  | (Base & {
      /** `player` skipped their untap step (rule 614.10 — the
       * `skip-untap-step` effect, Savor the Moment's extra turn). */
      readonly type: "untap-step-skipped";
      readonly player: PlayerId;
    })
  | (Base & {
      /** `player`'s untap step untapped one or more permanents they control
       * (rule 502.3), all at once: `count` of them, a token stack once per
       * token. Once a step, after each one's `permanent-untapped`; not what
       * another player's permanents did in that step (Seedborn Muse), and
       * not one that only lost a stun counter. "Whenever you untap one or
       * more permanents during your untap step" (The Millennium Calendar). */
      readonly type: "untap-step-untapped";
      readonly player: PlayerId;
      readonly count: number;
    })
  | (Base & {
      /** `player`'s upkeep or draw step was skipped (rules 500.11, 614.10 —
       * a static's `skipsSteps`, the `skip-step` effect): the turn went past
       * it as though it didn't exist, with no `step-began` for it. */
      readonly type: "step-skipped";
      readonly player: PlayerId;
      /** `"combat"` is the whole combat phase, `"main"` a main phase. */
      readonly step: "upkeep" | "draw" | "combat" | "main";
    })
  | (Base & {
      /** Aggravated Assault queued an extra combat phase this turn. */
      readonly type: "additional-combat-queued";
      readonly player: PlayerId;
    })
  | (Base & {
      /** The turn looped back to begin-combat for an additional combat phase. */
      readonly type: "additional-combat-phase";
    })
  | (Base & {
      /** An effect ended the turn (rule 724.1) or the combat phase (724.2):
       * the game skips to the cleanup step, or to the next phase. */
      readonly type: "phase-ended-by-effect";
      readonly what: "turn" | "combat";
    })
  | (Base & {
      /** A copy of a spell was put on the stack (storm / Twincast — rule
       * 707.10 / ROADMAP Phase 8). */
      readonly type: "spell-copied";
      readonly original: ObjectId;
      readonly copy: ObjectId;
      readonly controller: PlayerId;
    })
  | (Base & {
      /** A copy of an activated or triggered ability was put on the stack
       * (rule 707.10 — Lithoform Engine, Illusionist's Bracers). `original`
       * may be gone already (countered in response); `source` is the
       * ability's source, which the copy shares (707.10b). */
      readonly type: "ability-copied";
      readonly original: ObjectId;
      readonly copy: ObjectId;
      readonly source: ObjectId | null;
      readonly controller: PlayerId;
    })
  | (Base & {
      /** A lore counter was added to a Saga; `lore` is the new count (rule
       * 714.2 — ROADMAP Phase 10). */
      readonly type: "lore-counter-added";
      readonly object: ObjectId;
      readonly lore: number;
    })
  | (Base & {
      /** A Saga was sacrificed after its final chapter (SBA 704.5s) — also
       * announced as a `permanent-sacrificed` by its controller, rule 714.4. */
      readonly type: "saga-completed";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A Saga's chapter ability triggered (rule 714.2b), once per chapter
       * number reached; `final` when it's the final chapter number (rule
       * 714.2d-e). "Whenever the final chapter ability of a Saga you control
       * triggers" (Historian's Boon). */
      readonly type: "chapter-triggered";
      readonly saga: ObjectId;
      readonly final: boolean;
    })
  | (Base & {
      /** A Saga's chapter ability resolved (it wasn't removed for illegal
       * targets); `final` when it is the final chapter ability (rule 714.2d
       * — one whose chapter numbers include the Saga's highest). */
      readonly type: "chapter-resolved";
      readonly saga: ObjectId;
      readonly final: boolean;
    })
  | (Base & {
      /** A permanent turned over to its other face (rule 712.10 — a transform
       * keyword action / a day-night change / an "enters transformed" effect;
       * ROADMAP Phase 10b). Same object, same timestamp. `face` is the index
       * now up; `front` is `face === 0`. */
      readonly type: "permanent-transformed";
      readonly object: ObjectId;
      readonly face: number;
      readonly front: boolean;
    })
  | (Base & {
      /** A permanent flipped (rule 710 — the `flip` effect). Same object,
       * same timestamp; not a transform. */
      readonly type: "permanent-flipped";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A mutating creature spell merged with this permanent (rule
       * 702.140c — `Game.mergeMutatingSpell`): "whenever this creature
       * mutates" (702.140d). Same object, no entry. `player` is its
       * controller. */
      readonly type: "permanent-mutated";
      readonly object: ObjectId;
      readonly player: PlayerId;
    })
  | (Base & {
      /** A permanent became monstrous (rule 701.37a — the `monstrosity`
       * effect), its `amount` +1/+1 counters already put on it. Not emitted
       * for one already monstrous, which nothing happens to. */
      readonly type: "became-monstrous";
      readonly object: ObjectId;
      readonly amount: number;
    })
  | (Base & {
      /** A permanent became renowned (rule 702.112a — the `renown` effect),
       * its `amount` +1/+1 counters already put on it. Not emitted for one
       * already renowned, which nothing happens to (702.112c). */
      readonly type: "became-renowned";
      readonly object: ObjectId;
      readonly amount: number;
    })
  | (Base & {
      /** A permanent became harnessed (rule 701.64a — the `harness` effect).
       * Not emitted for one already harnessed, which nothing happens to. */
      readonly type: "became-harnessed";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A permanent became saddled (rule 702.171b — the `become-saddled`
       * effect). "For the first time each turn" reads the journal. */
      readonly type: "became-saddled";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A Vehicle became crewed (rule 702.122c): its crew ability resolved.
       * `crew`: the creatures tapped to pay its cost, as they were tapped. */
      readonly type: "became-crewed";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly crew: readonly ObjectId[];
    })
  | (Base & {
      /** `player` bent — waterbent (paid a waterbend cost, rule 701.67c),
       * earthbent (701.66b), firebent (a firebending ability resolved,
       * 702.189b) or airbent (carried out an instruction to airbend,
       * 701.65b — even one that could exile nothing, the Avatar Aang
       * ruling). */
      readonly type: "bent";
      readonly player: PlayerId;
      readonly how: "water" | "earth" | "fire" | "air";
    })
  | (Base & {
      /** `object` connived (rule 701.50a), under `player`, whether or not
       * any card was drawn or discarded (701.50c); `nonland` how many nonland
       * cards were discarded. Emitted after the counters, so "whenever a
       * creature you control connives, put a +1/+1 counter on it" sees it
       * still there. */
      readonly type: "connived";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly nonland: number;
    })
  | (Base & {
      /** The game became day or night (rule 731 — ROADMAP Phase 10b).
       * `previous` is what it was: `null` the first time (neither), which
       * isn't "day becomes night or night becomes day" (731.1a). */
      readonly type: "day-night-changed";
      readonly value: "day" | "night";
      readonly previous: "day" | "night" | null;
    })
  | (Base & {
      /** A `counter` effect / ward tried to counter a spell that can't be
       * countered (rule 701.5f — ROADMAP Phase 10). */
      readonly type: "counter-failed";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A player became the monarch (rule 720 — ROADMAP Phase 10). `via` is
       * how — an effect, or combat damage to the previous monarch. */
      readonly type: "monarch-changed";
      readonly player: PlayerId;
      /** `monarch-left`: the monarch left the game, and the designation
       * passed on (rule 725.4). */
      readonly via: "effect" | "combat-damage" | "monarch-left";
    })
  | (Base & {
      /** A player took the initiative (rule 726) — also when they already had
       * it (726.5: the "whenever a player takes the initiative" ability
       * triggers, but there's still one designation). `via` is how: an
       * effect, combat damage to the holder, or the holder leaving the game
       * (726.4). */
      readonly type: "initiative-taken";
      readonly player: PlayerId;
      readonly via: "effect" | "combat-damage" | "holder-left";
    })
  | (Base & {
      /** A player ventured (rule 701.49): their venture marker entered
       * `room` (an index into the dungeon's rooms — `cards/dungeons.ts`) of
       * `dungeon`, which `entered` says they've just put into the command
       * zone (701.49a, c). The room's ability triggers (309.4c). */
      readonly type: "ventured";
      readonly player: PlayerId;
      readonly dungeon: string;
      readonly room: number;
      readonly roomName: string;
      readonly entered: boolean;
    })
  | (Base & {
      /** A player completed a dungeon: it was removed from the game from its
       * bottommost room (rule 309.7 — by venturing on, 701.49c, or the
       * state-based action, 309.6). */
      readonly type: "dungeon-completed";
      readonly player: PlayerId;
      readonly dungeon: string;
    })
  | (Base & {
      /** A player's energy count changed (rule 122 / {E} — ROADMAP Phase 10). */
      readonly type: "energy-changed";
      readonly player: PlayerId;
      readonly delta: number;
      readonly energy: number;
      /** Who put them on, when they were put on rather than paid. */
      readonly by?: PlayerId;
    })
  | (Base & {
      /** A player's count of some other kind of counter changed (rule 122.1
       * — poison, experience; see `PlayerState.counters`). `total` is how
       * many they have now. */
      readonly type: "player-counters-changed";
      readonly player: PlayerId;
      readonly counter: PlayerCounterKind;
      readonly delta: number;
      readonly total: number;
      /** Who put them on, when they were put on rather than taken off. */
      readonly by?: PlayerId;
    })
  | (Base & {
      /** A player got an emblem (rule 114 — ROADMAP Phase 10). */
      readonly type: "emblem-created";
      readonly player: PlayerId;
      readonly text: string;
    })
  | (Base & {
      /** `player` rolled `results.length` `sides`-sided dice (rule 706) as one
       * roll — each die's natural result, in order. The client throws the
       * dice and lets them land on these. */
      readonly type: "class-level-gained";
      /** A Class's level became `level` (rule 716.2a) — "when this Class
       * becomes level N". */
      readonly object: ObjectId;
      readonly level: number;
    })
  | (Base & {
      readonly type: "static-effect-ignored";
      /** `player` paid `cost` to ignore `object`'s effect until end of turn
       * (rule 116.2d — Leonin Arbiter). */
      readonly player: PlayerId;
      readonly object: ObjectId;
      readonly cost: string;
    })
  | (Base & {
      readonly type: "door-unlocked";
      /** A Room was given an unlocked designation (rule 709.5h): its `door`
       * (the card's left or right half), by `player` — as it entered with the
       * door that was cast, by its unlock cost, or by an effect. `fully` when
       * that left it with both doors unlocked (709.5i). */
      readonly object: ObjectId;
      readonly door: "left" | "right";
      readonly player: PlayerId;
      readonly fully: boolean;
    })
  | (Base & {
      readonly type: "dice-rolled";
      readonly player: PlayerId;
      readonly sides: number;
      readonly results: readonly number[];
      /** What the instruction adds to the natural results (rule 706.2). */
      readonly modifier?: number;
      /** Natural results rolled and ignored, for the log and the dice thrown:
       * no trigger or effect sees them (706.6). */
      readonly ignored?: readonly number[];
      /** What rolled them, if a permanent or a spell did. */
      readonly source?: ObjectId;
    })
  | (Base & {
      /** The Ring tempted `player` (rule 701.54d): they finished choosing a
       * Ring-bearer — `chosen`, or `null` when they controlled no creature.
       * `count` is how many times it has tempted them now. */
      readonly type: "ring-tempted";
      readonly player: PlayerId;
      readonly chosen: ObjectId | null;
      readonly count: number;
    })
  | (Base & {
      /** An adventure spell resolved and its card was exiled with a "may cast
       * the creature later" permission (rule 715.3 — ROADMAP Phase 10). */
      readonly type: "card-on-adventure";
      readonly object: ObjectId;
      readonly player: PlayerId;
    })
  | (Base & {
      /** A player got an enduring story (rule 702.195a — storied), for the
       * rest of the game. */
      readonly type: "enduring-story";
      readonly player: PlayerId;
    })
  | (Base & {
      /** A player got the city's blessing (rule 702.131 — ascend), for the
       * rest of the game. */
      readonly type: "citys-blessing";
      readonly player: PlayerId;
    })
  | (Base & {
      /** A player's speed was set (rule 702.179): to 1 by start your
       * engines! (704.5aa — `from` absent: they had none), or up by its
       * inherent triggered ability (702.179d). */
      readonly type: "speed-changed";
      readonly player: PlayerId;
      readonly speed: number;
      readonly from?: number;
    })
  | (Base & {
      /** A permanent became prepared (rule 722.3a), and its controller made
       * `copy`, a copy of its prepare spell, in exile to cast (722.3c). */
      readonly type: "became-prepared";
      readonly object: ObjectId;
      readonly copy: ObjectId;
      readonly player: PlayerId;
    })
  | (Base & {
      /** A permanent lost the prepared designation (rule 722.3b) — its copy
       * was cast (601.2i), or an effect unprepared it. */
      readonly type: "became-unprepared";
      readonly object: ObjectId;
    })
  | (Base & {
      /** Cascade exiled cards off the top of the library; `cast` is the
       * nonland card with lesser mana value that will be cast free, or `null`
       * (ROADMAP Phase 8). */
      readonly type: "cascade-revealed";
      readonly player: PlayerId;
      readonly exiled: readonly ObjectId[];
      readonly cast: ObjectId | null;
    })
  | (Base & {
      readonly type: "step-began";
      readonly step: Step;
      readonly phase: Phase;
    })
  | (Base & { readonly type: "priority-received"; readonly player: PlayerId })
  | (Base & { readonly type: "priority-passed"; readonly player: PlayerId })
  | (Base & {
      readonly type: "permanent-untapped";
      readonly object: ObjectId;
      /** A shock land whose life was paid: it entered untapped (rule 614.1c),
       * turned upright only now that it's there — no untapping for a
       * "becomes untapped" trigger to see. */
      readonly asItEntered?: true;
      /** Untapped by this player's untap step (rule 502.3) — its own
       * permanents, or another player's that untap then too (Seedborn Muse).
       * "Whenever ~ becomes untapped during your untap step" (The Ninth
       * Doctor). */
      readonly untapStepOf?: PlayerId;
    })
  | (Base & {
      /** A permanent was exerted (rule 701.43a — the `exert` effect): it
       * won't untap during `player`'s next untap step. `asItAttacks` when its
       * own "you may exert this creature as it attacks" did it — what that
       * ability's linked "when you do" watches (rule 607.2h). */
      readonly type: "permanent-exerted";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly asItAttacks: boolean;
    })
  | (Base & {
      /** A creature was tapped to pay a cost of another permanent's keyword
       * that taps creatures for it: `creature` enlisted by the attacking
       * `for` (rule 702.154c), or `creature` crewed the Vehicle / saddled the
       * Mount `for` (702.122b, 702.171c). Announced as the cost is paid,
       * once per creature, after the creatures' own `permanent-tapped`. */
      readonly type: "creature-tapped-for";
      readonly creature: ObjectId;
      readonly for: ObjectId;
      readonly as: "enlist" | "crew" | "saddle";
    })
  | (Base & {
      /** Permanents phased out together (rule 702.26b) — those phased out
       * directly and, after them, what phased out indirectly with them
       * (702.26g). No zone changed (702.26d): nothing that watches a
       * permanent leave sees this. */
      readonly type: "permanents-phased-out";
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /** Permanents phased in together (rule 702.26c): no zone changed, so
       * nothing that watches a permanent enter sees this (702.26d). */
      readonly type: "permanents-phased-in";
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /** `player` promised `spell`'s gift to the opponent `to` (rule
       * 702.174a), as its gift cost was paid. The gift is given as it
       * resolves, or as the permanent it becomes enters. */
      readonly type: "gift-promised";
      readonly spell: ObjectId;
      readonly player: PlayerId;
      readonly to: PlayerId;
    })
  | (Base & {
      readonly type: "card-drawn";
      readonly player: PlayerId;
      readonly object: ObjectId;
      /** The first card they drew in their own draw step (Xyris's "except
       * the first one they draw in each of their draw steps"). */
      readonly firstInDrawStep?: true;
    })
  | (Base & {
      readonly type: "draw-from-empty-library";
      readonly player: PlayerId;
    })
  | (Base & {
      readonly type: "cards-discarded";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
      /** Who controlled the spell or ability that caused the discard — its
       * effect, or a cost paid for it (Psychic Purge's "when a spell or
       * ability an opponent controls causes you to discard this card").
       * Absent for a discard no spell or ability caused — the cleanup
       * step's (rule 514.1). A cost's discard is the paying player's own
       * (named, or absent for cycling's and channel's), never an
       * opponent's. */
      readonly cause?: PlayerId;
      /** Those of `objects` put into a hidden zone instead of a graveyard
       * without being revealed (Library of Leng): all their characteristics are
       * undefined (rule 701.9c), so no filter on a discarded card's matches them,
       * and no seat is told what they were. */
      readonly unrevealed?: readonly ObjectId[];
    })
  | (Base & {
      /**
       * Cards shown to every player (rule 701.16) — a tutor's "reveal it".
       * The identity crosses the wire because `revealedThisTurn` keeps those
       * ids visible in everyone's `PlayerView` until cleanup; without that a
       * client would receive an event naming cards it can't render.
       */
      readonly type: "cards-revealed";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
      /** Where they were revealed from — the caption reads better for it
       * ("revealed from their library"). */
      readonly from: "library" | "hand" | "graveyard" | "battlefield" | "sideboard";
    })
  | (Base & {
      readonly type: "cards-chosen-from-zone";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
      /** Chosen and not moved (a `destination: "stay"` choice — Sylvan
       * Library's two cards): what's done with them comes next. */
      readonly chosenOnly?: true;
      /** A split search (Cultivate): only the first of `objects` went to
       * `to`; the others went here. */
      readonly rest?: "hand" | "battlefield";
      /** Where the chosen cards were put, when not a hand or a library: the
       * log says "puts onto the battlefield", "puts into a graveyard" or
       * "exiles" rather than "takes". */
      readonly to?: "battlefield" | "graveyard" | "exile";
    })
  | (Base & {
      /** A player shuffled their library (after a search / tutor). */
      readonly type: "library-shuffled";
      readonly player: PlayerId;
    })
  | (Base & {
      /** A player foraged (rule 701.61a): exiled three cards from their
       * graveyard or sacrificed a Food, as forage. */
      readonly type: "foraged";
      readonly player: PlayerId;
    })
  | (Base & {
      /** A player paid mana to cast a spell (rule 700.14): the mana they had
       * spent on spells this turn went from `before` to `after` — what
       * "whenever you expend N" watches. Not for a spell cast for no mana. */
      readonly type: "mana-expended";
      readonly player: PlayerId;
      readonly before: number;
      readonly after: number;
    })
  | (Base & {
      /** `player` searched `owner`'s library (rule 701.23), as the search
       * begins, whatever it goes on to find. */
      readonly type: "library-searched";
      readonly player: PlayerId;
      readonly owner: PlayerId;
    })
  | (Base & {
      /** A scry / surveil resolved: `looked` cards seen, `movedAway` put on
       * the bottom (scry) or into the graveyard (surveil). */
      readonly type: "scried";
      readonly player: PlayerId;
      readonly mode: "scry" | "surveil";
      readonly looked: number;
      readonly movedAway: number;
    })
  | (Base & {
      /** A proliferate resolved (rule 701.27): `count` permanents and/or
       * players were chosen. The individual `counter-added` events come
       * first; this one marks what caused them, and records a choice of
       * *none* — which is legal, and otherwise leaves no trace at all. */
      readonly type: "proliferated";
      readonly player: PlayerId;
      readonly count: number;
    })
  | (Base & {
      readonly type: "damage-cleared";
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      readonly type: "land-played";
      readonly player: PlayerId;
      readonly object: ObjectId;
      /** The zone the land was played from — usually `hand`, but a land can
       * be played from exile (impulse draw), a graveyard or the top of a
       * library. What a "whenever you play a card from exile" trigger reads
       * (Prosper, Tome-Bound). */
      readonly from: ZoneType;
      /** The permanent whose permission it was played under — see
       * `spell-cast`'s. */
      readonly permission?: PlayedUnder;
    })
  | (Base & {
      readonly type: "permanent-tapped";
      readonly object: ObjectId;
      /** Who tapped it: the controller of the spell or ability whose effect
       * or cost did, the attacking player for an attack (508.1f). Absent for
       * a tapping no player did (an untap-step rule never taps). */
      readonly by?: PlayerId;
      /** Tapped by being declared as an attacker (rule 508.1f). */
      readonly asAttacker?: true;
    })
  | (Base & {
      /** A mana ability of `object` with {T} in its cost resolved and made
       * mana (rule 106.12a): "whenever … is tapped for mana". `player`
       * activated it, and `produced` is the types of mana it made. What a
       * triggered mana ability adds isn't "produced" by the permanent. */
      readonly type: "permanent-tapped-for-mana";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly produced: readonly ManaType[];
    })
  | (Base & {
      readonly type: "mana-added";
      readonly player: PlayerId;
      readonly mana: ManaType;
      readonly amount: number;
    })
  | (Base & {
      readonly type: "spell-cast";
      readonly player: PlayerId;
      readonly object: ObjectId;
      /** The zone the spell was cast from (rule 601.2a moves it to the stack
       * first, so this is recorded before that move) — `hand`, `exile`
       * (foretell, suspend, cascade, adventure, impulse), `graveyard`
       * (flashback, escape), `command`, or `library`. Read by a
       * `cast-spell` trigger's `from`/`notFrom` and by `plays-card`. */
      readonly from: ZoneType;
      readonly targets: readonly TargetRef[];
      /** The value chosen for `{X}`, or `null` when the cost had no `{X}`. */
      readonly x: number | null;
      /** The alternative permission the spell was cast under, if any (Phase 6
       * — flashback / escape / foretell / suspend / cascade). */
      readonly via?: CastVia;
      /** The permanent whose permission it was cast under, in that stint (a
       * static `mayPlay`, or one on the card linked to a source) — read by
       * `plays-card`'s `underThis` (Share the Spoils' "when they do"). */
      readonly permission?: PlayedUnder;
      /** The caster's spell count *including* this spell (the storm count —
       * ROADMAP Phase 8). Absent for a copy (a copy isn't cast). */
      readonly spellsThisTurn?: number;
    })
  | (Base & { readonly type: "spell-resolved"; readonly object: ObjectId })
  | (Base & {
      /** Snapcaster Mage granted a graveyard instant/sorcery flashback until
       * end of turn (ROADMAP Phase 6b). */
      readonly type: "flashback-granted";
      readonly object: ObjectId;
      readonly cost: string;
    })
  | (Base & {
      /** A one-shot "you may cast that card this turn" permission on a card
       * in a graveyard (Silas Renn, Emry). */
      readonly type: "graveyard-cast-granted";
      readonly object: ObjectId;
      readonly player: PlayerId;
    })
  | (Base & {
      readonly type: "flashback-grant-expired";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A card was suspended — exiled from hand with `timeCounters` time
       * counters (ROADMAP Phase 6b). */
      readonly type: "card-suspended";
      readonly player: PlayerId;
      readonly object: ObjectId;
      readonly timeCounters: number;
    })
  | (Base & {
      /** A time counter came off a suspended card — at its owner's upkeep,
       * or by an effect (time travel); `remaining` left. At 0 its owner may
       * cast it for free. */
      readonly type: "time-counter-removed";
      readonly object: ObjectId;
      readonly remaining: number;
    })
  | (Base & {
      /** Time travel put a time counter on a suspended card (rule 701.56a);
       * `now` it has that many. (A permanent's is a `counter-added`.) */
      readonly type: "time-counter-added";
      readonly object: ObjectId;
      readonly now: number;
    })
  | (Base & {
      /** A card was foretold — exiled face-down from hand for `{2}` (ROADMAP
       * Phase 6b). Its identity stays hidden from opponents in the view. */
      readonly type: "card-foretold";
      readonly player: PlayerId;
      readonly object: ObjectId;
    })
  | (Base & {
      /** A Case became solved (rule 719.3a). */
      readonly type: "case-solved";
      readonly object: ObjectId;
    })
  | (Base & {
      /** `player` discovered `amount` (rule 701.57b), finding `hit` — the
       * discovered card — or nothing. */
      readonly type: "discovered";
      readonly player: PlayerId;
      readonly amount: number;
      readonly hit: ObjectId | null;
    })
  | (Base & {
      /** `object` explored (rule 701.44b), controlled (or last controlled) by
       * `player`, whose library revealed `revealed` — nothing from an empty
       * one — a land card or not. */
      readonly type: "explored";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly revealed: ObjectId | null;
      readonly land: boolean;
    })
  | (Base & {
      /** `player` collected evidence (rule 701.59a): exiled `objects` from
       * their graveyard, total mana value `amount` or more, as a cost or an
       * effect. */
      readonly type: "evidence-collected";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
      readonly amount: number;
    })
  | (Base & {
      /** `player` committed a crime (rule 700.13): they cast a spell,
       * activated an ability or put a triggered ability on the stack — `object`
       * — targeting at least one opponent, something an opponent controls, or
       * a card in an opponent's graveyard. Once per spell or ability, however
       * many of its targets are a crime. */
      readonly type: "crime-committed";
      readonly player: PlayerId;
      readonly object: ObjectId;
      /** The source of the ability that committed it, when `object` is an
       * ability: the log names it once the ability has left the stack. */
      readonly source?: ObjectId;
    })
  | (Base & {
      /** A card in exile became plotted (rule 702.170) — `player` plotted it
       * from hand with its plot special action, or an effect `player`
       * controlled made it plotted. It's face up: everyone sees it. */
      readonly type: "card-plotted";
      readonly player: PlayerId;
      readonly object: ObjectId;
    })
  | (Base & {
      /** A player revealed a card from outside the game as their companion
       * (rule 103.2b). It stays out there, for everyone to see. */
      readonly type: "companion-revealed";
      readonly player: PlayerId;
      readonly object: ObjectId;
    })
  | (Base & {
      /** A player paid {3} and put their companion into their hand (rule
       * 702.139a, the special action of 116.2g). */
      readonly type: "companion-taken";
      readonly player: PlayerId;
      readonly object: ObjectId;
    })
  | (Base & {
      /** A card was cycled — its cycling cost paid, discarded, a card drawn
       * (rule 702.29). */
      readonly type: "card-cycled";
      readonly player: PlayerId;
      readonly object: ObjectId;
      /** The X its cycling cost was paid with (Shark Typhoon): a cycling
       * trigger's `{ triggerValue: true }`. */
      readonly x?: number;
    })
  | (Base & {
      /** `object` was cast via escape (rule 702.139) — `exiled` are the other
       * graveyard cards exiled to pay the additional cost. */
      readonly type: "escape-cost-paid";
      readonly object: ObjectId;
      readonly exiled: readonly ObjectId[];
    })
  | (Base & {
      readonly type: "ability-activated";
      readonly source: ObjectId;
      readonly player: PlayerId;
      readonly onStack: boolean;
      /** The ability object it put on the stack — what an `activates-ability`
       * trigger's "that ability" is. Absent for a mana ability. */
      readonly ability?: ObjectId;
      /** An ability of a permanent on the battlefield, as it was activated —
       * true even when paying its costs sacrificed that permanent (a
       * fetchland, a Clue), which a trigger then reads as it last existed
       * there. Absent for one from a hand, graveyard or the command zone. */
      readonly ofPermanent?: true;
      /** Its own cost sacrifices one or more permanents (Ashnod the Uncaring).
       * A Treasure sacrificed for the mana that paid it is another ability's
       * cost (the ruling), and doesn't count. */
      readonly sacrificedToActivate?: true;
    })
  | (Base & {
      /**
       * One object was chosen as a target of a spell or ability — emitted once
       * per targeted object as it goes on the stack, which is what a
       * "becomes the target of" trigger watches (Thunderbreak Regent).
       *
       * Separate from `spell-cast`'s `targets` list because the trigger is
       * about *one* object and needs `by` (whose spell it was) as its own
       * target, and because an activated ability's targets weren't reported
       * at all.
       */
      readonly type: "object-targeted";
      /** A permanent, or with `spell` a spell on the stack. */
      readonly object: ObjectId;
      /** The object is a spell on the stack, not a permanent — read only by a
       * `becomes-target` trigger with `orSpell` (Surrak, Elusive Hunter). */
      readonly spell?: true;
      readonly by: PlayerId;
      readonly source: ObjectId;
      /** The spell or ability object doing the targeting — the spell itself
       * (so equal to `source`) for a spell, the ability object on the stack
       * for an ability. What ward counters (rule 702.21a). */
      readonly stackObject: ObjectId;
      readonly bySpell: boolean;
    })
  | (Base & {
      /**
       * A player became the target of a spell or ability (rule 115.7 /
       * 603.2) — once per player a spell or ability names, as it's put on
       * the stack: "whenever **you** become the target of a spell or ability
       * an opponent controls" (Amulet of Safekeeping), "whenever you or a
       * permanent you control becomes the target" (Unsettled Mariner), "a
       * player or permanent" (Loki, God of Mischief). The fields are
       * `object-targeted`'s.
       */
      readonly type: "player-targeted";
      readonly player: PlayerId;
      readonly by: PlayerId;
      readonly source: ObjectId;
      readonly stackObject: ObjectId;
      readonly bySpell: boolean;
    })
  | (Base & {
      readonly type: "ability-resolved";
      readonly source: ObjectId;
      /** The ability on the stack that resolved — what a client finds its
       * entry by. Several abilities of one source can be on the stack at once. */
      readonly object: ObjectId;
    })
  | (Base & {
      readonly type: "ability-triggered";
      readonly source: ObjectId;
      readonly controller: PlayerId;
      /** The ability on the stack — what a client finds its entry by, to fly
       * it there from its source. */
      readonly object: ObjectId;
      /** Its source attacking caused it (`LastKnownRefs.byOwnAttack`). */
      readonly byOwnAttack?: true;
      /** Its source entering caused it (`LastKnownRefs.byOwnEntry`). */
      readonly byOwnEntry?: true;
    })
  | (Base & {
      /** Identical tokens folded into one stack object (`Game.foldTokensInto`:
       * split-off tokens back together once nothing tells them apart, or the
       * cleanup compaction). Not a game event — the tokens didn't go
       * anywhere — but the ids `folded` stop existing, so a client finds what
       * an earlier event named them for (Tribute to the World Tree's counters,
       * one token at a time) on `into`. Nothing triggers on it. */
      readonly type: "tokens-folded";
      readonly into: ObjectId;
      readonly folded: readonly ObjectId[];
    })
  | (Base & {
      /** A delayed triggered ability was set up (rule 603.7) — it fires at
       * some later step, not now. */
      readonly type: "delayed-trigger-created";
      readonly source: ObjectId;
      readonly controller: PlayerId;
      readonly text: string;
    })
  | (Base & {
      readonly type: "trigger-removed";
      readonly source: ObjectId;
      readonly reason: string;
    })
  | (Base & {
      readonly type: "pt-modified";
      readonly object: ObjectId;
      readonly power: number;
      readonly toughness: number;
      readonly duration: Expiry;
    })
  | (Base & {
      readonly type: "counter-added";
      readonly object: ObjectId;
      readonly counter: string;
      /** How many were put on each token, for a token stack (`stackCount`):
       * a "whenever counters are put on" watcher fires once per token. */
      readonly amount: number;
      /** Who put them (Hapatra's "whenever **you** put …"): the controller of
       * the effect, or the permanent's own controller for counters it
       * entered with. */
      readonly by?: PlayerId;
      /** How many tokens of `object`'s stack got them, when it isn't all of
       * them: a batch that entered with counters and folded into a stack
       * already there. Absent, every token the object stands for did. */
      readonly count?: number;
      /** How many of that kind the object has once these are on — what "when
       * the Nth counter is put on" reads (the placement crossing N). Absent
       * for a token stack's arrivals. */
      readonly after?: number;
      /** Put by a resolving training ability: the creature trained (rule
       * 702.149c — a `trains` trigger). */
      readonly training?: true;
      /** Put by a resolving evolve ability: the creature evolved (rule
       * 702.100b — an `evolves` trigger). Once, however many counters a
       * replacement made of the one. */
      readonly evolved?: true;
    })
  | (Base & {
      /** Counters removed — by an ability's cost (Walking Ballista), an
       * effect, time travel, a stun counter replacing an untap, or +1/+1 and
       * -1/-1 counters annihilating. */
      readonly type: "counter-removed";
      readonly object: ObjectId;
      readonly counter: string;
      readonly amount: number;
      /** How many of that kind it has left — 0 is vanishing's "the last"
       * (the `counters-removed` trigger's `last`). */
      readonly after: number;
      /** A token stack that lost them together (`remove-counter-all`): how
       * many tokens, each losing `amount` — what "the number of counters
       * removed this way" counts. Absent, one object. */
      readonly tokens?: number;
    })
  | (Base & {
      /** An Aura or Equipment stopped being attached to a permanent while it
       * stayed on the battlefield — attached to something else, unattached by
       * an effect or a state-based action, or what it was attached to left.
       * Its own leaving while attached is its `permanent-left-battlefield`.
       * Grafted Exoskeleton's "becomes unattached from a permanent". */
      readonly type: "permanent-unattached";
      readonly object: ObjectId;
      /** What it was attached to. */
      readonly from: ObjectId;
    })
  | (Base & {
      readonly type: "keyword-granted";
      readonly object: ObjectId;
      readonly keyword: string;
      readonly duration: Expiry;
    })
  | (Base & {
      /** A creature was removed from combat by an effect (rule 506.4 —
       * Labyrinth of Skophos). */
      readonly type: "removed-from-combat";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A permanent loses keywords for a while ("loses flying until end of
       * turn" — the `become` effect). */
      readonly type: "keywords-lost";
      readonly object: ObjectId;
      readonly keywords: readonly string[];
      readonly duration: Expiry;
    })
  | (Base & {
      readonly type: "pt-modifier-expired";
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /** A permanent became a creature via an "animate" effect (a man-land's
       * activated ability — rule 613 layer 4). */
      readonly type: "permanent-animated";
      readonly object: ObjectId;
      readonly power: number;
      readonly toughness: number;
      readonly duration: Expiry;
    })
  | (Base & {
      /** A permanent gained types or subtypes "in addition to its other
       * types" (the `become` effect — layer 4). */
      readonly type: "types-added";
      readonly object: ObjectId;
      readonly types: readonly CardType[];
      readonly subtypes: readonly string[];
      readonly duration: Expiry;
      /** Some of them *replace* its others ("becomes the basic land type of
       * your choice", "becomes a Coward"): the set ones are listed first. */
      readonly replaces?: true;
    })
  | (Base & {
      /** `player`'s effect from `source` picked `chosen` at random — a
       * player (Vial Smasher the Fierce's opponent), a card in a graveyard
       * (Deadbridge Chant's) or a mode (Summon: Magus Sisters'). See
       * `RandomPick`. */
      readonly type: "chosen-at-random";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly chosen: RandomPick;
    })
  | (Base & {
      /** `player` amassed, choosing the Army `object` (rule 701.47c) — the
       * `"amassed"` this-way kind's record of "the amassed Army". Not emitted
       * when no Army could be chosen: there's none to record. */
      readonly type: "amassed";
      readonly player: PlayerId;
      readonly object: ObjectId;
    })
  | (Base & {
      /** `player`'s effect picked `chosen` at random for `object` — the
       * opponent Territorial Hellkite must attack this combat. */
      readonly type: "random-player-chosen";
      readonly player: PlayerId;
      readonly chosen: PlayerId;
      readonly object: ObjectId;
    })
  | (Base & {
      readonly type: "attacker-declared";
      readonly attacker: ObjectId;
      /** A player, or an opponent's planeswalker (rule 508.1). */
      readonly defender: PlayerId | ObjectId;
    })
  | (Base & {
      /** A creature was put onto the battlefield attacking `defender` (rule
       * 508.4) — once its target is settled. It was never declared, so it
       * never "attacked" (508.3a): no attack trigger reads this. */
      readonly type: "entered-attacking";
      readonly object: ObjectId;
      readonly defender: PlayerId | ObjectId;
    })
  | (Base & {
      /** What an attacker is attacking was reselected (rule 508.7). It wasn't
       * declared again, so no attack trigger reads this (508.7a). */
      readonly type: "attack-reselected";
      readonly object: ObjectId;
      readonly defender: PlayerId | ObjectId;
    })
  | (Base & {
      /** The whole attack declaration, once it's known — for "whenever you
       * attack with N or more creatures" (Overwhelming Instinct, Tide
       * Skimmer), which can't be read off the per-attacker events. Emitted
       * for the same reason `attacked-alone` is. */
      readonly type: "attackers-declared";
      readonly player: PlayerId;
      readonly attackers: readonly ObjectId[];
    })
  | (Base & {
      /** One player the declaration attacks (rule 508.3d) — once per player
       * with at least one creature attacking them directly, after
       * `attackers-declared`, for "whenever a player attacks one of your
       * opponents" (Breena, the Demagogue). A creature attacking a
       * planeswalker attacks that planeswalker, not its controller, so it's
       * in nobody's `attackers` here: it's in `planeswalkerAttackers` of the
       * planeswalker's controller, for "attack one of your opponents **or a
       * planeswalker they control**" (Frontier Warmonger). The event is
       * emitted for a player when either list has a creature, so
       * `attackers` may be empty. */
      readonly type: "player-attacked";
      /** The attacking (active) player. */
      readonly player: PlayerId;
      readonly defender: PlayerId;
      readonly attackers: readonly ObjectId[];
      readonly planeswalkerAttackers?: readonly ObjectId[];
    })
  | (Base & {
      /** Exactly one creature was declared as an attacker this combat (rule
       * 702.111a — Exalted, needed-cards P15). Emitted once, after every
       * `attacker-declared` event for the same declaration. */
      readonly type: "attacked-alone";
      readonly attacker: ObjectId;
    })
  | (Base & {
      /** A planeswalker's loyalty changed — a loyalty-ability cost, or
       * damage (rule 306.7 / 120.3c). `loyalty` is the new total. */
      readonly type: "loyalty-changed";
      readonly object: ObjectId;
      readonly delta: number;
      readonly loyalty: number;
    })
  | (Base & {
      readonly type: "blocker-declared";
      readonly blocker: ObjectId;
      readonly attacker: ObjectId;
      /** It blocks `attacker` beside another attacker: one in `attacker`'s
       * band it blocked (rule 702.22h), or a second declared block of a
       * creature that can block additional creatures (`blockAdditional`).
       * "Whenever ~ blocks" has already triggered for it (509.3a), while "blocks a
       * creature" and "becomes blocked by a creature" trigger for each
       * (509.3b, 509.3d). */
      readonly alsoBlocked?: true;
    })
  | (Base & {
      /** An attacking creature became blocked (rule 509.1h) — once per
       * attacker, after its blockers' `blocker-declared` events, as its
       * defending player's declaration completes: "whenever ~ becomes
       * blocked" triggers once however many creatures block it (509.3c). */
      readonly type: "attacker-blocked";
      readonly attacker: ObjectId;
      readonly blockers: readonly ObjectId[];
    })
  | (Base & {
      /** The attackers that became blocked this combat, all of them, as the
       * last defending player's declaration completes: "whenever one or more
       * creatures you control become blocked" (Hezrou). Not announced when
       * nothing is blocked. */
      readonly type: "attackers-blocked";
      readonly attackers: readonly ObjectId[];
    })
  | (Base & {
      /** An attacking creature had no creatures declared as blockers for it
       * (rule 509.1h) — once per attacker, as the last defending player's
       * declaration completes (or is skipped): "whenever ~ attacks and isn't
       * blocked" (509.3g). Never for one blocked and then left with no
       * blockers, nor one put onto the battlefield attacking afterward. */
      readonly type: "attacker-unblocked";
      readonly attacker: ObjectId;
    })
  | (Base & {
      /** The unblocked creatures attacking one player directly, after their
       * `attacker-unblocked`s — once per such player, for "whenever one or
       * more creatures attack you and aren't blocked" (Coveted Jewel). A
       * creature attacking a planeswalker is in nobody's `attackers`. */
      readonly type: "player-attacked-unblocked";
      /** The attacking (active) player. */
      readonly player: PlayerId;
      readonly defender: PlayerId;
      readonly attackers: readonly ObjectId[];
    })
  | (Base & {
      readonly type: "spell-fizzled";
      readonly object: ObjectId;
      readonly reason: string;
    })
  | (Base & {
      readonly type: "spell-countered";
      readonly object: ObjectId;
      /** Who controlled it: a copy or an ability is gone by now. */
      readonly controller: PlayerId;
      /** Who controls the spell or ability that countered it. */
      readonly by: PlayerId;
      /** What was countered was an ability, not a spell (rule 701.6a counters
       * either): "counters a spell" asks. */
      readonly ability?: true;
      /** That ability's source: the ability itself is gone by now, so the
       * log names it by this. */
      readonly source?: ObjectId;
      /** Who cast it, if it was cast: not a copy (rule 707.10) or an ability. */
      readonly castBy?: PlayerId;
    })
  | (Base & {
      /** A spell was exiled from the stack — not countered (Mindbreak
       * Trap). */
      readonly type: "spell-exiled";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A player paid a permanent's ward cost (rule 702.21) to keep their
       * spell/ability from being countered. */
      readonly type: "ward-paid";
      readonly object: ObjectId;
      readonly player: PlayerId;
    })
  | (Base & {
      /** A player didn't (or couldn't) pay a permanent's ward cost, so the
       * ward trigger counters `spell` — their spell or ability that targeted
       * `object` (rule 702.21a). A `spell-countered` (or, for a spell that
       * can't be countered, `counter-failed`) follows. */
      readonly type: "ward-unpaid";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly spell: ObjectId;
    })
  | (Base & {
      readonly type: "control-changed";
      readonly object: ObjectId;
      readonly controller: PlayerId;
      /** Who controlled it just before — "when you lose control of this",
       * "… gains control of a permanent from you" (rule 603.10d). */
      readonly previousController: PlayerId;
      readonly untilEndOfTurn: boolean;
    })
  | (Base & {
      /** `controller` gained control of a spell on the stack (Commandeer):
       * not a permanent, so not a `control-changed` for what watches those. */
      readonly type: "spell-control-changed";
      readonly object: ObjectId;
      readonly controller: PlayerId;
      readonly previousController: PlayerId;
    })
  | (Base & {
      /** A Clone-style permanent chose what to copy (rule 707); `copyOf` is
       * `null` when it copied nothing. */
      readonly type: "permanent-copied";
      readonly object: ObjectId;
      readonly copyOf: string | null;
    })
  | (Base & {
      /** `player` manifested (rule 701.40) — or cloaked (701.58) — the top
       * card of their library: `object`, now a face-down 2/2 on the
       * battlefield. Which card it is isn't in the event. */
      readonly type: "card-manifested";
      readonly player: PlayerId;
      readonly object: ObjectId;
      readonly kind: "manifest" | "cloak";
      /** The player whose library it came from, when not `player`'s own
       * ("you manifest the top card of that player's library"). */
      readonly library?: PlayerId;
    })
  | (Base & {
      /** The permanent `object`, controlled by `player`, was turned face
       * down by an effect (rule 708.2a — Cyber Conversion): now a face-down
       * permanent, the same object. */
      readonly type: "permanent-turned-face-down";
      readonly player: PlayerId;
      readonly object: ObjectId;
    })
  | (Base & {
      /** `player` turned the face-down permanent `object` face up (rule
       * 701.40b), revealing it — no longer a face-down 2/2. */
      readonly type: "permanent-turned-face-up";
      readonly player: PlayerId;
      readonly object: ObjectId;
      /** The X paid in its morph or disguise cost (rules 702.37f, 702.168e),
       * when more than 0: a "turned face up" trigger's `{ triggerValue: true }`. */
      readonly x?: number;
    })
  | (Base & {
      /** `object` fought `opponent` (rule 701.14a) — one event for each of
       * the two creatures, as the fight happens (both still creatures on the
       * battlefield, 701.14b). A creature that fights itself (701.14c) is one.
       * Not for a one-sided "deals damage equal to its power" — that's no
       * fight. */
      readonly type: "creature-fought";
      readonly object: ObjectId;
      readonly opponent: ObjectId;
    })
  | (Base & {
      /** One fight, or the several an effect has happen at once: every
       * creature that fought in it, each once, after their own
       * `creature-fought` events. What "whenever **one or more** creatures you
       * control fight" triggers on, once (Neyith of the Dire Hunt). */
      readonly type: "creatures-fought";
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /** Two permanents exchanged text boxes (rule 612.5 — Deadpool, Trading
       * Card): `object` now has `withObject`'s rules text, and the other way
       * round. */
      readonly type: "text-boxes-exchanged";
      readonly object: ObjectId;
      readonly withObject: ObjectId;
    })
  | (Base & {
      /** "As this enters, choose a creature type" was answered (Urza's
       * Incubator — needed-cards P14). */
      readonly type: "creature-type-chosen";
      readonly object: ObjectId;
      readonly creatureType: string;
    })
  | (Base & {
      /** `player` secretly chose something for `object` (`GameObject.
       * secretChoice`): that they did, never what. */
      readonly type: "secret-choice-made";
      readonly object: ObjectId;
      readonly player: PlayerId;
    })
  | (Base & {
      /** `player` revealed the secret choice made for `object`, as a cost:
       * `choice` is the player or word chosen. */
      readonly type: "secret-choice-revealed";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly choice: string;
    })
  | (Base & {
      /** A card name was chosen (rule 201.4) for `object` — as it entered
       * (Pithing Needle) or as its spell or ability resolved (Memoricide). */
      readonly type: "card-name-chosen";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly name: string;
    })
  | (Base & {
      /** `player` chose `effect` to apply first to `event` (rule 616.1). */
      readonly type: "replacement-order-chosen";
      readonly player: PlayerId;
      readonly event: string;
      readonly effect: string;
    })
  | (Base & {
      /** `player` chose pile `pile` of a `separate-into-piles` (rule 700.3)
       * — `objects` are what was in it. */
      readonly type: "pile-chosen";
      readonly player: PlayerId;
      readonly source: ObjectId;
      readonly pile: number;
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /** `player` chose `number` as `object` resolved (a `choose-value` of
       * `value: "number"` — Void's "choose a number"). */
      readonly type: "number-chosen";
      readonly player: PlayerId;
      readonly object: ObjectId;
      readonly number: number;
    })
  | (Base & {
      /** `caster` cast `object`, a spell with assist, choosing `player` to
       * help pay (rule 702.132a), who may pay up to `max` of its generic
       * mana. */
      readonly type: "assist-requested";
      readonly player: PlayerId;
      readonly caster: PlayerId;
      readonly object: ObjectId;
      readonly max: number;
    })
  | (Base & {
      /** The assisting `player` chose to pay `amount` of `object`'s generic
       * mana (rule 702.132a) — paid as the cast goes on, or not at all if
       * it's reversed (`cast-reversed`). */
      readonly type: "assist-chosen";
      readonly player: PlayerId;
      readonly caster: PlayerId;
      readonly object: ObjectId;
      readonly amount: number;
    })
  | (Base & {
      /** `caster` cast `object` (or activated an ability of it) naming
       * `player`, an opponent, to choose some of its targets (rule 601.2c)
       * or its modes (rule 700.2e) — `what` — which they're now asked. */
      readonly type: "choice-requested";
      readonly player: PlayerId;
      readonly caster: PlayerId;
      readonly object: ObjectId;
      readonly what: "targets" | "modes";
    })
  | (Base & {
      /** `player` started casting `object` but couldn't complete it (rule
       * 733.1): the whole cast is undone, nothing paid, and they keep
       * priority (733.2) — an assisted spell whose helper paid too little
       * for its caster to pay the rest. */
      readonly type: "cast-reversed";
      readonly player: PlayerId;
      readonly object: ObjectId;
      readonly reason: string;
    })
  | (Base & {
      readonly type: "permanent-entered-battlefield";
      readonly object: ObjectId;
      /** How many real permanents this one event stands for — set > 1 only
       * when a batch of otherwise-identical fresh tokens was minted as one
       * compacted `stackCount` object (a pure engine resource-safety
       * optimization, not a rule) instead of one event per token. A watcher
       * whose triggered effect isn't safe to scale (see
       * `Game.isCountScalableEffect`) still fires once per real entry — this
       * only lets the *cheap* case skip materializing them. `undefined`/`1`
       * = one ordinary entry. */
      readonly count?: number;
    })
  | (Base & {
      /** A permanent left the battlefield, for any destination. Fires
       * alongside (and just before) `permanent-destroyed` when the
       * destination is a graveyard; on its own otherwise. The hook for
       * `leaves-battlefield` triggers (rule 603.6d). */
      readonly type: "permanent-left-battlefield";
      readonly object: ObjectId;
      readonly toZone: "graveyard" | "exile" | "hand" | "library" | "command";
      /** For a token split off a compacted stack, the stack, while it's still
       * on the battlefield (`GameObject.splitFrom`): the client draws the
       * stack going down rather than a token it never drew leaving. */
      readonly stack?: ObjectId;
    })
  | (Base & {
      readonly type: "permanent-attached";
      readonly source: ObjectId;
      readonly target: ObjectId;
    })
  | (Base & {
      /** An Aura moved onto a player (rule 303.4): a Curse. */
      readonly type: "permanent-attached-to-player";
      readonly source: ObjectId;
      readonly player: PlayerId;
    })
  | (Base & {
      readonly type: "damage-dealt";
      /** How many identical sources dealt it, each `amount / sources`: an
       * unblocked token stack attacking as one counted object (`Game.
       * attackingStackPart`), its tokens' combat damage dealt as one event.
       * A trigger on the source side ("whenever a creature deals combat
       * damage to a player") fires once per source, each for its share.
       * Absent: one source dealt all of `amount`. */
      readonly sources?: number;
      readonly source: ObjectId;
      readonly target: TargetRef;
      readonly amount: number;
      /** True for combat damage (rule 510) — as opposed to burn, abilities, etc. */
      readonly combat: boolean;
      /** Damage to a permanent beyond what it needed (rule 120.4a): past lethal
       * for a creature, past its loyalty for a planeswalker, the greater for
       * one that's both. Absent when there was none. */
      readonly excess?: number;
      /** Who controlled the source as it dealt the damage (as it last existed,
       * for a source that has left — rule 608.2h), when known: what a client
       * tallies a player's damage dealt by. */
      readonly by?: PlayerId;
    })
  | (Base & {
      readonly type: "life-changed";
      readonly player: PlayerId;
      readonly delta: number;
      readonly life: number;
      /** A loss an effect caused (rule 119.3): the controller of the spell or
       * ability whose effect it was. Absent for damage's (119.2), a cost's,
       * and a gain. */
      readonly byEffectOf?: PlayerId;
    })
  | (Base & {
      /** An activated mana ability of `object` resolved (rule 605.3b —
       * activated by hand or while paying), `player` its activator, making
       * `amount` mana: its own, a "twice as much" tap doubler's included,
       * never what a triggered mana ability added. "Whenever a mana ability
       * of this creature resolves" (Tyvar the Bellicose). */
      readonly type: "mana-ability-resolved";
      readonly object: ObjectId;
      readonly player: PlayerId;
      readonly amount: number;
    })
  | (Base & {
      /** `player` investigated (rule 701.16a): once per investigation —
       * "investigate twice" is two — after its Clue was created, or
       * whatever a replacement made of it. "Whenever you investigate"
       * (Erdwal Illuminator). Creating a Clue without the word isn't one. */
      readonly type: "investigated";
      readonly player: PlayerId;
    })
  | (Base & {
      /** `player` paid `amount` life (rule 119.4), after its `life-changed`:
       * a cost's, Phyrexian mana's, a shock land's, an "unless … pays N
       * life" or a "you may pay N life". What "whenever you pay life"
       * watches (Font of Agonies). Paying 0 (119.4b) isn't one, nor is
       * losing life without the word "pay" (the card's ruling). */
      readonly type: "life-paid";
      readonly player: PlayerId;
      readonly amount: number;
    })
  | (Base & {
      readonly type: "permanent-destroyed";
      readonly object: ObjectId;
      readonly reason: string;
      /** A "destroy" effect's (rule 701.8): who controls the spell or ability
       * that destroyed it — "a spell or ability an opponent controls destroys
       * …" (Karmic Justice). Absent for the state-based actions' and for
       * anything else put into a graveyard. */
      readonly by?: PlayerId;
    })
  | (Base & {
      /** Despite the name, also a card returned from a graveyard or exile,
       * or a spell from the stack — `from` says which (absent: the
       * battlefield). */
      readonly type: "permanent-returned-to-hand";
      readonly object: ObjectId;
      readonly owner: PlayerId;
      readonly from?: "graveyard" | "exile" | "stack";
    })
  | (Base & {
      readonly type: "permanent-exiled";
      readonly object: ObjectId;
    })
  | (Base & {
      readonly type: "permanent-sacrificed";
      readonly object: ObjectId;
      /** Who sacrificed it: its controller as it left, not its owner (rule
       * 701.21a) — "whenever you sacrifice" counts a stolen permanent. */
      readonly player: PlayerId;
      /** Sacrificed to this creature's exploit ability as it resolved: it
       * "exploited" it (rule 702.110b — an `exploits` trigger). */
      readonly exploitedBy?: ObjectId;
    })
  | (Base & {
      /** `reason` "regenerated": a regeneration shield used up (rule 701.15a). */
      readonly type: "permanent-destroy-prevented";
      readonly object: ObjectId;
      readonly reason: string;
    })
  | (Base & {
      /** A permanent got a regeneration shield (rule 701.15a). */
      readonly type: "regeneration-shield-created";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A Fog-style effect resolved — all combat damage is prevented for the
       * rest of the turn (rule 614 replacement, turn-scoped). */
      readonly type: "combat-damage-prevention-set";
      /** Only some sources' — the effect's source, which says whose
       * (Arachnogenesis's "by non-Spider creatures"). */
      readonly partialBy?: ObjectId;
    })
  | (Base & {
      /** Damage was prevented by a replacement effect (Fog) — the event fires
       * in place of `damage-dealt`. */
      readonly type: "damage-prevented";
      readonly source: ObjectId;
      readonly target: TargetRef;
      readonly amount: number;
      /** A one-shot or turn-long shield's: the resolution that made it
       * (`ActiveReplacement.madeIn`) — "damage prevented this way". */
      readonly shieldMadeIn?: number;
    })
  | (Base & {
      /** Damage that would have been dealt to `from` is dealt to `to`
       * instead, by a redirection shield (rule 614.9 — Warrior en-Kor). The
       * `damage-dealt` to `to` follows. */
      readonly type: "damage-redirected";
      readonly source: ObjectId;
      readonly from: TargetRef;
      readonly to: TargetRef;
      readonly amount: number;
    })
  | (Base & {
      /** A card that would have gone to a graveyard was exiled instead (Rest
       * in Peace — rule 614). */
      readonly type: "graveyard-replaced-with-exile";
      readonly object: ObjectId;
    })
  | (Base & {
      /** A permanent that would have left the battlefield for `intendedZone`
       * was exiled instead, by a replacement it carried itself — "if it would
       * leave the battlefield, exile it instead of putting it anywhere else"
       * (Whip of Erebos — rule 614). Also a flashed-back spell leaving the
       * stack for a hand or library (rule 702.34a — Remand on a flashback
       * spell). */
      readonly type: "leave-replaced-with-exile";
      readonly object: ObjectId;
      readonly intendedZone: "graveyard" | "hand" | "library";
    })
  | (Base & {
      /** A spell or permanent's colours were set (`become` — Deathlace). */
      readonly type: "color-changed";
      readonly object: ObjectId;
      readonly colors: readonly Color[];
    })
  | (Base & {
      /** A one-shot damage-prevention shield was created (Healing Salve —
       * ROADMAP Phase 11 EG-6). */
      readonly type: "prevention-shield-created";
      /** Absent for a rule over a set of recipients (a `damage-rule`). */
      readonly target?: TargetRef;
      readonly amount: number;
      /** Only against damage from this source (a source of your choice —
       * Circle of Protection); with `nextTime`, all of its next damage to
       * `target` (`amount` is 0 then). */
      readonly from?: ObjectId;
      readonly nextTime?: true;
      /** A redirection (rule 614.9): what it takes is dealt here instead. */
      readonly redirectTo?: TargetRef;
      /** It prevents all damage to `target` this turn (Gideon Jura's 0);
       * `amount` is 0 then. */
      readonly all?: true;
    })
  | (Base & {
      /** A player's draw was replaced by another player drawing instead
       * (Notion Thief — rule 614 / ROADMAP Phase 11 EG-6). One per
       * redirect: a draw handed on twice is two of these. */
      readonly type: "draw-redirected";
      readonly from: PlayerId;
      readonly to: PlayerId;
    })
  | (Base & {
      /** A player did one of the things done "at random", once per
       * instruction however many cards, targets, modes, coins or dice it
       * took: discarded at random, selected targets at random (`randomTargets`),
       * chose modes at random, flipped coins, rolled dice — what Chira, All
       * In's "whenever you discard one or more cards at random, select one or
       * more targets at random, …" watches (`acts-at-random`). A new random
       * act in the engine emits it too. */
      readonly type: "acted-at-random";
      readonly player: PlayerId;
      readonly act: "discard" | "targets" | "modes" | "coins" | "dice";
    })
  | (Base & {
      /** A player flipped a coin (rule 705) and won or lost the flip. */
      readonly type: "coin-flipped";
      readonly player: PlayerId;
      readonly came: "heads" | "tails";
      /** Absent on a flip that cares only about heads or tails (Molten
       * Sentry): no player wins or loses it (rule 705.2), so neither
       * `wins-coin-flip` nor `loses-coin-flip` fires on it. */
      readonly won?: boolean;
    })
  | (Base & {
      /** A player clashed (rule 701.30) — one event per clashing player,
       * once both revealed cards have moved — and won or not (701.30d). */
      readonly type: "clashed";
      readonly player: PlayerId;
      readonly won: boolean;
    })
  | (Base & {
      /** Cards were put into exile **at the same time** — the exile-side
       * twin of `cards-put-into-graveyard`: one per simultaneous move, each
       * card with the zone it came from and its `owner`. Exile is one shared
       * zone, so it's the owner that says whose library (or graveyard) a
       * card left — public even for a card exiled face down (rule 406.3
       * hides only its face), and still known once the card has gone back
       * (cascade's misses, rule 702.85a). Tokens aren't cards. */
      readonly type: "cards-put-into-exile";
      readonly arrivals: readonly {
        readonly object: ObjectId;
        readonly from: ZoneType;
        readonly owner: PlayerId;
      }[];
      /** The controller of the spell or ability whose effect exiled them;
       * absent outside a resolution (a cost, a state-based action). */
      readonly byEffectOf?: PlayerId;
    })
  | (Base & {
      /** Prohibitions for the rest of the turn (the `prohibit` effect):
       * `players` can't cast spells and/or activate abilities, or `object`'s
       * activated abilities can't be activated. */
      readonly type: "prohibition-imposed";
      readonly players: readonly PlayerId[];
      readonly object?: ObjectId;
      /** Several permanents at once — "creatures dealt damage this way can't
       * be regenerated this turn". */
      readonly objects?: readonly ObjectId[];
      readonly spells: boolean;
      /** Only these spells — "noncreature spells" — when not every one. */
      readonly spellsLabel?: string;
      readonly abilities: boolean;
      /** The permanents can't be regenerated this turn (rule 701.19c). */
      readonly regeneration?: true;
      /** The players can't become the monarch this turn (rule 725.4). */
      readonly monarch?: true;
      /** The players can't play lands this turn (Turf Wound). */
      readonly lands?: true;
      /** Until the imposing player's next turn rather than this turn
       * (detain, Dovin Baan). */
      readonly untilYourNextTurn?: true;
      /** The player imposing it, when `untilYourNextTurn`. */
      readonly by?: PlayerId;
    })
  | (Base & {
      /** Combat restrictions (the `restrict` effect): on `object`, or —
       * with no object — as a rule over every permanent matching the
       * effect's filter, until end of turn. */
      readonly type: "restrictions-imposed";
      readonly object?: ObjectId;
      readonly player: PlayerId;
      readonly restrictions: readonly CombatWord[];
      /** How long `object`'s last; absent means until end of turn. */
      readonly duration?: Expiry;
      /** They apply only during this player's next turn (Wall of Dust). */
      readonly nextTurnOf?: PlayerId;
    })
  | (Base & {
      /** A modal spell/ability's controller (or a "you may" clause) chose
       * which modes to apply — `modes` are indices into the mode list, or
       * empty for a declined "you may". `player` is who chose — not always
       * the controller (an "unless" punisher, an "each player may"). */
      readonly type: "modes-chosen";
      readonly source: ObjectId;
      readonly player?: PlayerId;
      readonly modes: readonly number[];
      /** The modes of a modal spell or ability (rule 700.2), chosen as it's
       * cast, activated or put on the stack — not a "you may", a vote or a
       * choice made on resolution. What "face a dilemma" reads. */
      readonly modal?: true;
    })
  | (Base & {
      /** A player voted (rule 701.38) in an open vote — "starting with you,
       * each player votes …", which each later voter sees. A secret vote
       * ("each player secretly votes") emits none: its votes are only shown
       * by the `votes-finished` that reveals them all. */
      readonly type: "vote-cast";
      readonly source: ObjectId;
      readonly vote: Vote;
      /** A choice of an "each player chooses" (rule 101.4), not a vote. */
      readonly choice?: true;
    })
  | (Base & {
      /** Every player has voted in the vote `source`'s spell or ability
       * held, `controller` that spell's or ability's controller: `votes` is
       * every vote cast, in the order cast — a secret vote's revealed now.
       * The hook for "whenever players finish voting" (Erestor of the
       * Council). */
      readonly type: "votes-finished";
      readonly source: ObjectId;
      readonly controller: PlayerId;
      readonly votes: readonly Vote[];
      readonly secret: boolean;
      /** Every player of an "each player chooses" has chosen (rule 101.4):
       * not a vote, so "whenever players finish voting" doesn't see it. */
      readonly choice?: true;
    })
  | (Base & {
      /** Cards were put into graveyards **at the same time** — dying,
       * milled, discarded, surveilled, a spell resolving or countered —
       * each with the zone it came from. Once per simultaneous move (a
       * wrath, one state-based sweep, one mill or discard); a move of its
       * own is its own. Tokens aren't cards and never appear. The hook for
       * `put-into-graveyard` triggers. */
      readonly type: "cards-put-into-graveyard";
      readonly arrivals: readonly { readonly object: ObjectId; readonly from: ZoneType }[];
    })
  | (Base & {
      /** Permanents went from the battlefield to graveyards (rule 700.4), once
       * per simultaneous event (a wrath, one state-based sweep, an edict each
       * player has answered); a death of its own is its own. Tokens count, as
       * `cards-put-into-graveyard` can't say. The hook for batched `dies`
       * triggers ("whenever one or more creatures die"). `left` is everything
       * that left the battlefield in that event, for any destination: those
       * look back and see it (rule 603.10a). Never in the event log: each
       * death has its own events there, and this only asks the triggers. */
      readonly type: "permanents-died";
      readonly died: readonly ObjectId[];
      readonly left: readonly ObjectId[];
    })
  | (Base & {
      /** One simultaneous event took these off the battlefield, once it's
       * done, for "whenever one or more … leave the battlefield". As
       * `permanents-died`: everything in it looks back and sees it (rule
       * 603.10a), and it's never in the event log. */
      readonly type: "permanents-left";
      readonly left: readonly LeftBattlefield[];
    })
  | (Base & {
      readonly type: "cards-milled";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /**
       * One or more cards left graveyards **at the same time** — for any
       * destination: cast or played from there, returned to a hand or the
       * battlefield, exiled (a whole graveyard at once, or as an escape
       * cost), put into a library. One event per simultaneous move, however
       * many cards and graveyards it took them from, which is what makes a
       * "whenever one or more cards leave your graveyard" trigger (Teval, the
       * Balanced Scale) fire once for it. Each card's owner is whose
       * graveyard it left. Tokens aren't cards, so they never appear here.
       * Emitted once the cards have arrived wherever they went.
       */
      readonly type: "cards-left-graveyard";
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      readonly type: "player-lost";
      readonly player: PlayerId;
      readonly reason: string;
    })
  | (Base & {
      readonly type: "game-ended";
      readonly winner: PlayerId | null;
      readonly reason: string;
    })
  | (Base & {
      readonly type: "mulligan-taken";
      readonly player: PlayerId;
      /** Total mulligans this player has now taken. */
      readonly count: number;
    })
  | (Base & {
      /** A card's "any time you could mulligan" ability exiled this player's
       * hand (rule 103.5b — Serum Powder); the draws follow as `card-drawn`. */
      readonly type: "hand-exiled-while-mulliganing";
      readonly player: PlayerId;
      /** The card whose ability it was, exiled with the rest. */
      readonly card: ObjectId;
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      readonly type: "hand-kept";
      readonly player: PlayerId;
      /** Mulligans taken before keeping this hand (0 for the opening hand). */
      readonly mulligans: number;
    })
  | (Base & {
      readonly type: "cards-put-on-bottom";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /** Cards exiled from a library going back under it: a cascade's
       * misses (rule 702.85a), discover's (701.57a), the rest of a
       * reveal-until that exiled — on the bottom of their owner's
       * (`player`'s) library in a random order. Not a choice from a hand
       * (`cards-put-on-bottom`, which "put on the bottom this way" counts):
       * what the client flies back onto the pile. */
      readonly type: "cards-returned-to-library";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /** Cards an effect shuffled into `player`'s library from a public zone
       * (rule 701.24a — `shuffle-graveyard-into-library`'s graveyard cards,
       * `put-on-libraries`' `"shuffle"`), logged once the library is
       * shuffled: Elixir's "the number of cards shuffled into your library
       * this way". A hand's cards aren't named here. */
      readonly type: "cards-shuffled-into-library";
      readonly player: PlayerId;
      readonly objects: readonly ObjectId[];
    })
  | (Base & {
      /** A commander's owner chose whether to put it into the command zone
       * (rule 903.9). `from` is the graveyard or exile it was in (903.9a), or
       * the hand or library it was headed for (903.9b). */
      readonly type: "commander-zone-decision";
      readonly object: ObjectId;
      readonly toCommandZone: boolean;
      readonly from: "graveyard" | "exile" | "hand" | "library";
      /** For a 903.9b move to a hand or library, the zone it was moving out
       * of: "returned this way" counts a commander its owner sent to the
       * command zone instead (Flood of Tears' ruling). */
      readonly leaving?: "battlefield" | "stack" | "graveyard" | "exile" | "hand" | "command";
    });

export type GameEventType = GameEvent["type"];

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

/** A {@link GameEvent} without its `seq`, as passed to the emitter. */
export type GameEventInput = DistributiveOmit<GameEvent, "seq">;

/** The event variant for a given `type` discriminant. */
export type EventOfType<K extends GameEventType> = Extract<
  GameEvent,
  { type: K }
>;
