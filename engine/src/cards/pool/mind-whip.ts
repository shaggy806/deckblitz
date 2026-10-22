import { defineCard } from "../define.js";

// Ice Age. Wanderlust's upkeep of the enchanted creature's controller (the
// active player, as part of the trigger condition), with Erosion's punisher:
// that player may pay {3}; if they don't, the Aura deals them 2 damage and
// its controller taps the creature.

const UPKEEP_TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, that player may pay {3}. If they don't, this Aura deals 2 damage to that player and you tap that creature.";

export default defineCard({
  name: "Mind Whip",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ pay: "{3}", text: "Pay {3}" }],
        otherwise: {
          kind: "sequence",
          effects: [
            { kind: "damage", amount: 2, who: "active-player" },
            { kind: "tap", target: "attached" },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
