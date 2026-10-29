import { defineCard } from "../define.js";

// "That spell's controller" is a becomes-target trigger's "trigger-player" —
// whoever controls the targeting spell, this creature's controller included —
// not a target (Lava Runner).
export default defineCard({
  name: "Bonecrusher Giant",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 4,
  toughness: 3,
  text: "Whenever this creature becomes the target of a spell, this creature deals 2 damage to that spell's controller.",
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", spellOnly: true },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "trigger-player" },
      resolve: null,
      text: "Whenever this creature becomes the target of a spell, this creature deals 2 damage to that spell's controller.",
    },
  ],
  faces: ["Bonecrusher Giant", "Stomp"],
  adventure: true,
});
