import { defineCard } from "../define.js";

// EDHREC rank 30399.

const TEXT = "Whenever you cast a Spirit or Arcane spell, regenerate this creature.";

export default defineCard({
  name: "Fiddlehead Kami",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
