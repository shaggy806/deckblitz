import { defineCard } from "../define.js";

// EDHREC rank 22837.

const TEXT = "Whenever you cast a Spirit or Arcane spell, target creature gains fear until end of turn.";

export default defineCard({
  name: "Kami of the Waning Moon",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (It can't be blocked except by artifact creatures and/or black creatures.)`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: ["creature"],
      effect: { kind: "grant-keyword", target: 0, keyword: "fear", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
