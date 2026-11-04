import { defineCard } from "../define.js";
import type { TargetSpec } from "../../target.js";

// "For each player" is one slot a seat, each bound to the player sitting there; a seat past the
// table or whose player has left needs no target (`emptySeatOptional`). A player still in the game
// with no land leaves the enters trigger without a legal choice, so it's removed (rule 603.3d).
//
// "That creature's controller" chooses as the second ability resolves, not its controller: not a
// target, so a hexproof land can be taken. They gain control, and they untap it.
const ENTERS = "When this enchantment enters, for each player, put a contested counter on target land that player controls.";
const DAMAGE =
  "Whenever a creature deals combat damage to a player, if that player controls one or more lands with contested counters on them, that creature's controller gains control of one of those lands of their choice and untaps it.";

const landAtSeat = (seat: number): TargetSpec => ({ kind: "permanent", whose: { seat }, filter: { type: "land" } });
const CONTESTED = { type: "land", counters: { kind: "contested", compare: { op: "gte", n: 1 } } } as const;

export default defineCard({
  name: "Turf War",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `${ENTERS}\n${DAMAGE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [landAtSeat(0), landAtSeat(1), landAtSeat(2), landAtSeat(3)],
      effect: {
        kind: "sequence",
        effects: [0, 1, 2, 3].map((slot) => ({
          kind: "add-counter" as const,
          target: slot,
          counter: "contested",
          amount: 1,
        })),
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "deals-damage", who: "any", filter: { type: "creature" }, to: "player", combat: true },
      condition: {
        kind: "of-player",
        player: "that-player",
        condition: { kind: "controls", filter: CONTESTED, atLeast: 1 },
      },
      targets: [],
      effect: {
        kind: "choose-permanents",
        chooser: "trigger-controller",
        controlledByPlayer: "trigger-player",
        filter: CONTESTED,
        min: 1,
        upTo: 1,
        prompt: "Gain control of one of those lands and untap it",
        then: {
          kind: "sequence",
          effects: [
            { kind: "gain-control", target: 0, untilEndOfTurn: false },
            { kind: "untap", target: 0 },
          ],
        },
      },
      resolve: null,
      text: DAMAGE,
    },
  ],
});
