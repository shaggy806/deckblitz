import { defineCard } from "../define.js";
import { exploit } from "../helpers.js";

// EDHREC rank 21276.

export default defineCard({
  name: "Stitched Assistant",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 3,
  toughness: 2,
  text: "Exploit (When this creature enters, you may sacrifice a creature.)\nWhen this creature exploits a creature, scry 1, then draw a card. (To scry 1, look at the top card of your library, then you may put that card on the bottom.)",
  triggered: [
    exploit(),
    {
      trigger: { on: "exploits", who: "self" },
      targets: [],
      effect: { kind: "scry", amount: 1, then: { kind: "draw", amount: 1 } },
      resolve: null,
      text: "When this creature exploits a creature, scry 1, then draw a card.",
    },
  ],
});
