import { defineCard } from "../define.js";

// Legends. EDHREC rank 29439.
//
// Rulings:
//   [2004-10-04] Paying to make the Wall capable of attacking does not override the normal rule
//     that a creature may not attack unless it began your turn on the battlefield.

export default defineCard({
  name: "Wall of Wonder",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 1,
  toughness: 5,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\n{2}{U}{U}: This creature gets +4/-4 until end of turn and can attack this turn as though it didn't have defender.",
  activated: [
    {
      cost: { mana: "{2}{U}{U}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 4, toughness: -4, duration: "end-of-turn" },
          { kind: "attack-despite-defender", target: "source" },
        ],
      },
      resolve: null,
      text: "{2}{U}{U}: This creature gets +4/-4 until end of turn and can attack this turn as though it didn't have defender.",
    },
  ],
});
