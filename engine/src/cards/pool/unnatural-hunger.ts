import { defineCard } from "../define.js";

// Mercadian Masques. "That player" is the active player, as on Curse Artifact; "another
// creature" is one other than the enchanted creature (`notObject: "attached"`,
// bound as the trigger resolves), so it can't be the one sacrificed. The damage is
// the creature's power as the ability resolves, or as it last existed.

const TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, this Aura deals damage equal to that creature's power to that player unless they sacrifice another creature of their choice.";

export default defineCard({
  name: "Unnatural Hunger",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ sacrifice: { type: "creature", notObject: "attached" }, text: "Sacrifice another creature" }],
        otherwise: { kind: "damage", amount: { powerOf: "attached" }, who: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
