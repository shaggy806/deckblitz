import { defineCard } from "../define.js";

const TEXT =
  "At the beginning of the upkeep of enchanted artifact's controller, this Aura deals 2 damage to that player unless they sacrifice that artifact.";

// "That player" is the active player, as on Maddening Wind; with the artifact
// no longer theirs by then, they can't sacrifice it (rule 701.21a) and the
// damage is dealt.
export default defineCard({
  name: "Curse Artifact",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${TEXT}`,
  targets: ["artifact"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ sacrificeThat: "attached", text: "Sacrifice that artifact" }],
        otherwise: { kind: "damage", amount: 2, who: "active-player" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
