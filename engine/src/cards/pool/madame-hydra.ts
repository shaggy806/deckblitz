import { defineCard } from "../define.js";

// Makes Villain → use "Villain Token".

export default defineCard({
  name: "Madame Hydra",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Villain"],
  power: 2,
  toughness: 3,
  text: "Whenever you cast a Villain spell, create a 2/1 black Villain creature token with menace. (It can't be blocked except by two or more creatures.)",
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { subtype: "Villain" } },
      targets: [],
      effect: { kind: "create-token", token: "Villain Token", count: 1 },
      resolve: null,
      text: "Whenever you cast a Villain spell, create a 2/1 black Villain creature token with menace.",
    },
  ],
});
