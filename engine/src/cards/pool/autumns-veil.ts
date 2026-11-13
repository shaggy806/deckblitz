import { defineCard } from "../define.js";

// EDHREC rank 3173.
// Rulings:
//   [2021-03-19] If a creature you control is being targeted by a spell when Autumn's Veil
//     resolves, nothing happens right away. When that spell would resolve, its color is checked.
//     If it's blue or black, that creature will be an illegal target for that spell.
//   [2021-03-19] Autumn's Veil has no effect on abilities.
//   [2021-03-19] Autumn's Veil affects any spells and creatures you happen to control at any
//     point during the rest of the turn, not just spells and creatures you control as it resolves.
//
// Both halves change the game's rules for the turn (rule 611.2c), so they
// reach spells and creatures you come to control later: the first a turn
// grant to your spells, judged against the countering spell as it resolves;
// the second a timed static, Karplusan Strider's "can't be the target of blue
// or black spells" over the creatures you control, rechecked as each targeting
// spell resolves (rule 608.2b).

export default defineCard({
  name: "Autumn's Veil",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Spells you control can't be countered by blue or black spells this turn, and creatures you control can't be the targets of blue or black spells this turn.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-spells-this-turn", cantBeCounteredBy: { anyOf: [{ colors: ["U"] }, { colors: ["B"] }] } },
      {
        kind: "timed-static",
        duration: "end-of-turn",
        text: "Creatures you control can't be the targets of blue or black spells this turn.",
        static: [
          {
            affects: { scope: "creatures-you-control" },
            hexproofFrom: { colors: ["U", "B"], spellsOnly: true, anyController: true, notHexproof: true },
            text: "Creatures you control can't be the targets of blue or black spells this turn.",
          },
        ],
      },
    ],
  },
});
