import { defineCard } from "../define.js";

// EDHREC rank 8800.

export default defineCard({
  name: "Audacious Reshapers",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 3,
  toughness: 3,
  text: "{T}, Sacrifice an artifact: Reveal cards from the top of your library until you reveal an artifact card. Put that card onto the battlefield and the rest on the bottom of your library in a random order. This creature deals damage to you equal to the number of cards revealed this way.",
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "reveal-until",
            filter: { type: "artifact" },
            put: "battlefield",
            rest: "bottom-random",
          },
          { kind: "damage", amount: { thisWay: "revealed" }, who: "you" },
        ],
      },
      resolve: null,
      text: "{T}, Sacrifice an artifact: Reveal cards from the top of your library until you reveal an artifact card. Put that card onto the battlefield and the rest on the bottom of your library in a random order. This creature deals damage to you equal to the number of cards revealed this way.",
    },
  ],
});
