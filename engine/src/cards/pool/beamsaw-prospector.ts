import { defineCard } from "../define.js";

export default defineCard({
  name: "Beamsaw Prospector",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, create a Lander token. (It's an artifact with \"{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\")",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a Lander token.",
    },
  ],
});
