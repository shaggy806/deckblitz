import { defineCard } from "../define.js";

// Urza's Saga. The artifacts are counted as the trigger resolves, from the
// side of the player it dealt the damage to.

const GAIN = "Whenever this creature deals combat damage to a player, you gain 1 life for each artifact that player controls.";

export default defineCard({
  name: "Emissary of Hope",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${GAIN}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "gain-life",
        amount: { countOf: { type: "artifact", controlledBy: "you" }, forPlayer: "trigger-player" },
      },
      resolve: null,
      text: GAIN,
    },
  ],
});
