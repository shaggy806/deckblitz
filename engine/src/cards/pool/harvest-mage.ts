import { defineCard } from "../define.js";

// Nemesis. `landManaInstead`'s `"any-color"` with `one`: one mana, the colour chosen as the land is
// tapped, for each land its controller taps this turn.

const TEXT =
  "{G}, {T}, Discard a card: Until end of turn, if you tap a land for mana, it produces one mana of a color of your choice instead of any other type and amount.";

export default defineCard({
  name: "Harvest Mage",
  manaCost: "{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "player-effect",
        duration: "end-of-turn",
        landManaInstead: { produces: "any-color", tapper: "you", one: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
