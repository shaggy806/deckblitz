import { defineCard } from "../define.js";

export default defineCard({
  name: "Civic Gardener",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 2,
  toughness: 2,
  text: "Whenever this creature attacks, untap target creature or land.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "Whenever this creature attacks, untap target creature or land.",
    },
  ],
});
