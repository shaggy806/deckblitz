import { defineCard } from "../define.js";

// Rulings:
//   [2014-02-01] The land enters the battlefield directly from your hand, but it is not "played".
//     This means it does not count towards the number of lands played this turn and doesn't
//     trigger abilities that would trigger if the Forest had been played.

const PUT = "{0}: You may put a basic Forest card from your hand onto the battlefield. Activate only as a sorcery and only once each turn.";
const SAC = "Sacrifice this enchantment: Add {G}{G}.";

export default defineCard({
  name: "Gaea's Touch",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${PUT}\n${SAC}`,
  activated: [
    {
      cost: { mana: "{0}", tap: false },
      sorcerySpeed: true,
      oncePerTurn: true,
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "land", subtype: "Forest", supertype: "basic" },
      },
      resolve: null,
      text: PUT,
    },
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: "G", amount: 2 },
      resolve: null,
      text: SAC,
    },
  ],
});
