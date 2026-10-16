import { defineCard } from "../define.js";

// EDHREC rank 12824.
//
// Rulings:
//   [2024-06-07] Hope-Ender Coatl's triggered ability will resolve before Hope-Ender Coatl does.
//     If Hope-Ender Coatl is countered or otherwise leaves the stack in response to that triggered
//     ability, the triggered ability will still resolve as normal.
//   [2024-06-07] A card with devoid is just colorless. It's not colorless and the colors of mana
//     in its mana cost.
//
// Devoid is `colors: []`. The cast trigger is Censor's "unless its controller
// pays {1}", on a spell an opponent controls.
const CAST_TEXT = "When you cast this spell, counter target spell an opponent controls unless they pay {1}.";

export default defineCard({
  name: "Hope-Ender Coatl",
  manaCost: "{2}{U}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Snake"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "flying"],
  text: `Devoid (This card has no color.)\nFlash\n${CAST_TEXT}\nFlying`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [{ kind: "spell", whose: "opponent", filter: {} }],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "counter", target: 0 },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
