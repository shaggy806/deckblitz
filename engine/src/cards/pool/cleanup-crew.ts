import { defineCard } from "../define.js";

// Streets of New Capenna. A modal triggered ability announces its mode (and
// that mode's target) as it goes on the stack (rule 700.2b).

export default defineCard({
  name: "Cleanup Crew",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 6,
  toughness: 6,
  text: "When this creature enters, choose one —\n• Destroy target artifact.\n• Destroy target enchantment.\n• Exile target card from a graveyard.\n• You gain 4 life.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Destroy target artifact.", targets: ["artifact"], effect: { kind: "destroy", target: 0 } },
          { text: "Destroy target enchantment.", targets: ["enchantment"], effect: { kind: "destroy", target: 0 } },
          {
            text: "Exile target card from a graveyard.",
            targets: [{ kind: "card-in-graveyard", whose: "any" }],
            effect: { kind: "exile", target: 0 },
          },
          { text: "You gain 4 life.", effect: { kind: "gain-life", amount: 4 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
