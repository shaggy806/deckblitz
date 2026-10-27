import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 28499.

const TEXT =
  "Whenever you cast a Spirit or Arcane spell, this creature deals 2 damage to each creature without flying.";

export default defineCard({
  name: "Earthshaker",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
