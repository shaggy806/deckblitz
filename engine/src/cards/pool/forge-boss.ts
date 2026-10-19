import { defineCard } from "../define.js";

const TEXT =
  "Whenever you sacrifice one or more other creatures, this creature deals 2 damage to each opponent. This ability triggers only once each turn.";

// "One or more" is a batch, but with "only once each turn" a trigger per
// sacrificed creature fires exactly as often: the first of the turn, and no
// other (Dina, Essence Brewer's shape, with "other").
export default defineCard({
  name: "Forge Boss",
  manaCost: "{2}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "sacrifice", who: "you", filter: { type: "creature" }, otherOnly: true },
      oncePerTurn: true,
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: TEXT,
    },
  ],
});
