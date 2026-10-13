/**
 * A tutorial room, as it travels between the room server and a client.
 *
 * The lessons themselves live on the server (`server/src/tutorials/`), as
 * data: boards, a scripted opponent, and chapters of coach cards with goals.
 * A client only ever names a lesson by id (`tutorial-create`) and is told,
 * on every `state` push, where the lesson stands (`TutorialInfo`) — never the
 * board's spec, so no hand or library the view hides leaks through it. See
 * `docs/plans/tutorials.md`.
 */

/**
 * Where a coach card points, as a string the client resolves every frame:
 *
 * - `tour:<name>` — the element carrying `data-tour="<name>"` (the top
 *   strip's buttons, the phase track, the priority actions, the decision
 *   banner…: the client's anchor contract).
 * - `card:<Card Name>` — the tile of the card with that name: the viewer's
 *   own first (hand, battlefield, command zone), then anyone's.
 * - `player:<seat>` — that player's panel (`data-player-id`); `player:me` is
 *   the viewer's own, `player:opponent` the first other seat.
 * - `step:<Step>` — that step's pip on the phase track (`precombat-main`,
 *   `declare-attackers`, … as the engine names steps).
 * - `css:<selector>` — any CSS selector, the escape hatch.
 *
 * Absent: the card stands on its own, centred, with no spotlight.
 */
export type TutorialAnchor = string;

/** One coach card: what to show now. */
export interface TutorialCoachStep {
  /** Stable within its lesson. */
  readonly id: string;
  readonly title: string;
  /** A few friendly sentences. Plain text; a blank line starts a paragraph. */
  readonly body: string;
  readonly anchor?: TutorialAnchor;
  readonly placement?: "top" | "bottom" | "left" | "right";
  /**
   * How the card goes away. `"next"`: the client shows a Next button and
   * sends `tutorial-next`. `"goal"`: no Next — the card waits for the server
   * to mark every one of `TutorialInfo.goals` done, then moves on by itself.
   */
  readonly advance: "next" | "goal";
}

/** Something the player is asked to do on the current coach card. */
export interface TutorialGoal {
  /** Stable within its lesson — what a client step's `{ goal: id }` names. */
  readonly id: string;
  /** A checklist line ("Play a land"). */
  readonly label: string;
  readonly done: boolean;
}

/** What a tutorial room adds to each `state` push. */
export interface TutorialInfo {
  /** The lesson's id, as `tutorial-create` named it. */
  readonly lesson: string;
  readonly title: string;
  /** The chapter under way (or, between chapters, the one last finished). */
  readonly chapter: string;
  readonly chapterTitle: string;
  /** 0-based. */
  readonly chapterIndex: number;
  readonly chapterCount: number;
  /**
   * The coach card to show now, or `null` for none: between chapters, while
   * the game plays on until the next one opens, and once the lesson is
   * `complete`.
   */
  readonly step: TutorialCoachStep | null;
  /** The current card's goals (empty for a `"next"` card, or no card). */
  readonly goals: readonly TutorialGoal[];
  /** `tutorial-retry` would rewind to this chapter's start. */
  readonly canRetry: boolean;
  /** Every chapter is done. The game itself may play on. */
  readonly complete: boolean;
}
