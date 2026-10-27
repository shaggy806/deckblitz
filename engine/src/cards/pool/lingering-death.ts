import { defineCard } from "../define.js";

const END_TEXT =
  "At the beginning of the end step of enchanted creature's controller, that player sacrifices that creature.";

export default defineCard({
  name: "Lingering Death",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${END_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "sacrifice-target", target: "attached", byItsController: true },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
