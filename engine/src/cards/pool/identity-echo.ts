import { defineCard } from "../define.js";

// Reality Fracture (FRA). EDHREC rank 17163.

const TEXT =
  "{3}{R}: Exile target creature or planeswalker you control. Reveal cards from the top of your library until you reveal a creature or planeswalker card. Put that card onto the battlefield and the rest on the bottom of your library in a random order. Activate only as a sorcery.";

export default defineCard({
  name: "Identity Echo",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{R}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "reveal-until",
            filter: { typesAnyOf: ["creature", "planeswalker"] },
            put: "battlefield",
            rest: "bottom-random",
          },
        ],
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
