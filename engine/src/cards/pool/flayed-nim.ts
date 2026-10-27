import { defineCard } from "../define.js";

// EDHREC rank 25072. Mirrodin.
//
// Stinkweed Imp's trigger; "that creature's controller" is the trigger
// player (the controller of the permanent dealt damage), and "that much" the
// damage dealt.

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a creature, that creature's controller loses that much life.";

export default defineCard({
  name: "Flayed Nim",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton"],
  power: 2,
  toughness: 2,
  text: `${DAMAGE_TEXT}\n{2}{B}: Regenerate this creature.`,
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{2}{B}: Regenerate this creature.",
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "lose-life", amount: { triggerValue: true }, who: "trigger-player" },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
