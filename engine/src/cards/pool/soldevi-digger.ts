import { defineCard } from "../define.js";

// Graveyard order (rule 404.2): `top-of-graveyard`, its `then` reading the card as target 0.

const TEXT = "{2}: Put the top card of your graveyard on the bottom of your library.";

export default defineCard({
  name: "Soldevi Digger",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "top-of-graveyard", then: { kind: "put-on-library", target: 0, position: "bottom" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
