import { defineCard } from "../define.js";

// EDHREC rank 26294.

const TEXT = "Whenever you cast a Spirit or Arcane spell, you may destroy target nonbasic land.";

export default defineCard({
  name: "Ore Gorger",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [{ kind: "permanent", filter: { type: "land", notSupertype: "basic" } }],
      effect: { kind: "may", prompt: "Destroy target nonbasic land?", effect: { kind: "destroy", target: 0 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
