import { defineCard } from "../define.js";

// EDHREC rank 13490.

export default defineCard({
  name: "Mascot Exhibition",
  manaCost: "{7}",
  colors: [],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text: "Create a 2/1 white and black Inkling creature token with flying, a 3/2 red and white Spirit creature token, and a 4/4 blue and red Elemental creature token.",
  targets: [],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "create-token", token: "Inkling Token", count: 1 },
      { kind: "create-token", token: "Spirit Token (Red-White)", count: 1 },
      { kind: "create-token", token: "4/4 Blue Red Elemental Token", count: 1 },
    ],
  },
});
