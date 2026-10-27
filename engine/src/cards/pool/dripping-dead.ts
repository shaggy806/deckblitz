import { defineCard } from "../define.js";

// Legions (LGN). EDHREC rank 30933.

const CANT_BLOCK = "This creature can't block.";
const DESTROY =
  "Whenever this creature deals combat damage to a creature, destroy that creature. It can't be regenerated.";

export default defineCard({
  name: "Dripping Dead",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 4,
  toughness: 1,
  text: `${CANT_BLOCK}\n${DESTROY}`,
  static: [{ affects: { scope: "self" }, restrictions: ["cant-block"], text: CANT_BLOCK }],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "creature", combat: true },
      targets: [],
      effect: { kind: "destroy", target: "trigger-recipient", cantBeRegenerated: true },
      resolve: null,
      text: DESTROY,
    },
  ],
});
