import { defineCard } from "../define.js";

// EDHREC rank 14806. The target is chosen as each trigger goes on the stack;
// whether to exile it is asked as it resolves (the ruling). "If you do":
// declining keeps Act of Authority where it is. "Its controller" is read as
// the exiled permanent last existed on the battlefield.

export default defineCard({
  name: "Act of Authority",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: "When this enchantment enters, you may exile target artifact or enchantment.\nAt the beginning of your upkeep, you may exile target artifact or enchantment. If you do, its controller gains control of this enchantment.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["artifact-or-enchantment"],
      effect: {
        kind: "may",
        prompt: "Exile target artifact or enchantment?",
        effect: { kind: "exile", target: 0 },
      },
      resolve: null,
      text: "When this enchantment enters, you may exile target artifact or enchantment.",
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["artifact-or-enchantment"],
      effect: {
        kind: "may",
        prompt: "Exile target artifact or enchantment? If you do, its controller gains control of Act of Authority.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: 0 },
            { kind: "gain-control", target: "source", untilEndOfTurn: false, who: { controllerOfTarget: 0 } },
          ],
        },
      },
      resolve: null,
      text: "At the beginning of your upkeep, you may exile target artifact or enchantment. If you do, its controller gains control of this enchantment.",
    },
  ],
});
