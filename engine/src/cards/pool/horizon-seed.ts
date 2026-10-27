import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 27099.

const TEXT = "Whenever you cast a Spirit or Arcane spell, regenerate target creature.";

export default defineCard({
  name: "Horizon Seed",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["creature"],
      effect: { kind: "regenerate", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
