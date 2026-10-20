import { defineCard } from "../define.js";

const TEXT = "Whenever you cast a kicked spell, you gain 2 life.";

export default defineCard({
  name: "Lullmage's Familiar",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 4,
  text: `{T}: Add {G} or {U}.\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "U"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {G} or {U}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { kicked: true } },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
