import { defineCard } from "../define.js";

export default defineCard({
  name: "Galactic Wayfarer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Scout"],
  power: 3,
  toughness: 3,
  text: "When this creature enters, create a Lander token. (It's an artifact with \"{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\")",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: 1 },
      resolve: null,
      text: "When this creature enters, create a Lander token.",
    },
  ],
});
