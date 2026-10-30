/**
 * The scenario builder's board, as it travels between a developer's client
 * and a server started with `--builder` (never the public site).
 *
 * A scenario is plain data: who sits where, their life, whose turn, which
 * turn and which step it is, and every card placed, with the zone it's in and
 * how it lies.
 * The server builds a fresh `Game` from it on every edit — cards are placed
 * silently, so nothing triggers while the board is being built — and again
 * when play starts. See `docs/plans/scenario-builder.md`.
 */

import type { PlayerId } from "engine";

/** The zones a card can be placed in. A library's cards are listed top first.
 * `"sideboard"` isn't a zone: it's outside the game (rule 400.11a), where a
 * wish finds it — never for a player with a commander (903.5e). */
export type ScenarioZone = "battlefield" | "hand" | "graveyard" | "exile" | "library" | "command" | "sideboard";

/** The steps a scenario can start in: every step with a priority window that
 * isn't inside a combat (a combat step needs attackers declared first). */
export type ScenarioStep = "upkeep" | "draw" | "precombat-main" | "begin-combat" | "postcombat-main" | "end";

export interface ScenarioCard {
  /** Stable within the scenario: what an edit names the card by, since the
   * game's object ids change with every rebuild. */
  readonly key: string;
  readonly name: string;
  readonly owner: PlayerId;
  readonly zone: ScenarioZone;
  /** One of its owner's commanders (rule 903.3): put in the command zone by
   * the game itself, then moved to `zone`. At most two per player. */
  readonly commander?: boolean;
  /** Battlefield only. */
  readonly tapped?: boolean;
  /** Battlefield only: summoning sick (it came under its controller's
   * control this turn). Placed permanents aren't, unless this says so. */
  readonly sick?: boolean;
  /** Battlefield only: counters on it, by kind ("+1/+1", "loyalty", …). A
   * planeswalker without `loyalty` here enters with its printed loyalty. */
  readonly counters?: Readonly<Record<string, number>>;
  /** Battlefield only: the `key` of the permanent this Aura or Equipment is
   * attached to. */
  readonly attachedTo?: string;
  /** Battlefield only, and only on a creature: damage marked on it this turn
   * (rule 120.3e), there until the cleanup step (514.2). Never lethal — a
   * board where it would be (704.5g) is refused, unless it's indestructible.
   * Absent means 0. */
  readonly damage?: number;
  /** A commander only: how many times its owner has cast it from the command
   * zone already, each adding {2} to its next cast from there (rule 903.8).
   * Absent means 0. */
  readonly casts?: number;
  /** A commander only: the combat damage it has dealt each player this game
   * (rule 903.10a — 21 from one commander loses the game). Absent means none. */
  readonly commanderDamage?: Readonly<Partial<Record<PlayerId, number>>>;
}

export interface ScenarioSeat {
  readonly player: PlayerId;
  readonly life: number;
  readonly poison?: number;
  /** Played by a bot once play starts. The developer's own seat never is. */
  readonly bot: boolean;
}

export interface ScenarioSpec {
  /** Two to four, in turn order. */
  readonly seats: readonly ScenarioSeat[];
  readonly cards: readonly ScenarioCard[];
  /** Whose turn it is. */
  readonly active: PlayerId;
  readonly step: ScenarioStep;
  /** The game's turn number (1 or more; absent means 1). Past the first
   * turn nobody skips a draw (rule 103.8a only skips the starting player's
   * first), and the starting player is whoever's seat makes this turn the
   * active player's. */
  readonly turn?: number;
  /** Basic lands under each library's listed cards, so drawing doesn't lose
   * the game at once. */
  readonly libraryFill: number;
}

/** What a builder room adds to each `state` push. */
export interface BuilderInfo {
  /** Building: the board is the scenario, frozen — nobody acts. Playing: a
   * real game, started from `spec`. */
  readonly mode: "build" | "play";
  /** The scenario being built, or the one play started from. */
  readonly spec: ScenarioSpec;
  /** In build mode, which scenario card each game object is — for picking a
   * card on the board to edit. Empty while playing. */
  readonly objects: Readonly<Record<string, string>>;
}
