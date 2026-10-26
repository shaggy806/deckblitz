import { defineCard } from "../define.js";

const CAST =
  "Whenever you cast a Spirit or Arcane spell, you may put a land card from your hand onto the battlefield tapped.";

export default defineCard({
  name: "Loam Dweller",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: CAST,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        enterTapped: true,
        leftover: "stay",
        filter: { type: "land" },
      },
      resolve: null,
      text: CAST,
    },
  ],
});
