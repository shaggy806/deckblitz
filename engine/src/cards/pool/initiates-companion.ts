import { defineCard } from "../define.js";

export default defineCard({
  name: "Initiate's Companion",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Cat"],
  power: 3,
  toughness: 1,
  text: "Whenever this creature deals combat damage to a player, untap target creature or land.",
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "permanent", filter: { typesAnyOf: ["creature", "land"] } }],
      effect: { kind: "untap", target: 0 },
      resolve: null,
      text: "Whenever this creature deals combat damage to a player, untap target creature or land.",
    },
  ],
});
