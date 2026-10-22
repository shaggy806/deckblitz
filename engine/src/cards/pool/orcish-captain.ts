import { defineCard } from "../define.js";

// EDHREC rank 22905. Fallen Empires.
//
// Rulings:
//   [2004-10-04] You choose the target when you activate the ability. You don't flip a coin
//     until the ability resolves.

const TEXT =
  "{1}: Flip a coin. If you win the flip, target Orc creature gets +2/+0 until end of turn. If you lose the flip, it gets -0/-2 until end of turn.";

export default defineCard({
  name: "Orcish Captain",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Orc" } }],
      effect: {
        kind: "flip-coin",
        won: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
        lost: { kind: "modify-pt", target: 0, power: 0, toughness: -2, duration: "end-of-turn" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
