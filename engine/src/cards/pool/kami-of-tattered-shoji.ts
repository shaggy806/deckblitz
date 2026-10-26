import { defineCard } from "../define.js";

// EDHREC rank 31263.

const TEXT = "Whenever you cast a Spirit or Arcane spell, this creature gains flying until end of turn.";

export default defineCard({
  name: "Kami of Tattered Shoji",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
