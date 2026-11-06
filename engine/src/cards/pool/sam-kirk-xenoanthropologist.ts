import { defineCard } from "../define.js";

export default defineCard({
  name: "Sam Kirk, Xenoanthropologist",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 3,
  toughness: 3,
  text: "Whenever an opponent casts a creature spell, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Whenever an opponent casts a creature spell, investigate.",
    },
  ],
});
