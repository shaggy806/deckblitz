import type { TargetSpec } from "../../target.js";
import { defineCard } from "../define.js";

// I — the five cards exiled at once, then the nonland ones among them given
// time counters and suspend (`give-suspend` over this way's exiles); a land,
// or a card of mana value 0, stays exiled, not suspended. II — two time
// travels, the second asked once the first is done. III — one optional slot
// per opponent seat (Age of Ultron's shape), destroyed as one instruction.
const CHAPTER_I =
  "I — Exile the top five cards of your library. For each nonland card exiled this way, put a number of time counters on that card equal to its mana value. If it doesn't have suspend, it gains suspend.";
const CHAPTER_II = "II — Time travel, then time travel.";
const CHAPTER_III = "III — For each opponent, destroy up to one target artifact that player controls.";

const perOpponent = (seat: number): TargetSpec => ({
  kind: "optional",
  of: { kind: "permanent", whose: { seat }, filter: { type: "artifact" } },
});

export default defineCard({
  name: "The Parting of the Ways",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile-from-library", amount: 5 },
          { kind: "give-suspend", timeCounters: "mana-value", filter: { notTypes: ["land"] } },
        ],
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: { kind: "sequence", effects: [{ kind: "time-travel" }, { kind: "time-travel" }] },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [perOpponent(1), perOpponent(2), perOpponent(3)],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "destroy", target: 0 },
          { kind: "destroy", target: 1 },
          { kind: "destroy", target: 2 },
        ],
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
