import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// Chapter III reads the opponents' life totals after the damage, mid-resolution
// (no state-based actions in between, rule 704.3), so an opponent at 0 is
// still there to be asked about. "Otherwise" exiles this Saga (only while it's
// still the same object, rule 400.7) with a cast permission for this turn; once
// it's gone there's nothing left to sacrifice (rule 714.4).

const I_II_TEXT = "I, II — Investigate.";
const III_TEXT =
  "III — This Saga deals 1 damage to each opponent. Then if an opponent has 0 or less life, draw seven cards. Otherwise, exile this Saga and you may cast it this turn.";

export default defineCard({
  name: "Heaven Sent",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1, 2],
      targets: [],
      effect: investigate(),
      resolve: null,
      text: I_II_TEXT,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, who: "each-opponent" },
          {
            kind: "conditional",
            condition: { kind: "life-total", who: "opponent", atMost: 0 },
            then: { kind: "draw", amount: 7 },
            else: { kind: "exile", target: "source", mayCast: { duration: "end-of-turn" } },
          },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
