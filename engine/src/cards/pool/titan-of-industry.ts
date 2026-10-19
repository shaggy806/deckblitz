import { defineCard } from "../define.js";

// EDHREC rank 2551.

export default defineCard({
  name: "Titan of Industry",
  manaCost: "{4}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  keywords: ["reach", "trample"],
  text: "Reach, trample\nWhen this creature enters, choose two —\n• Destroy target artifact or enchantment.\n• Target player gains 5 life.\n• Create a 4/4 green Rhino Warrior creature token.\n• Put a shield counter on a creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 2,
        maxModes: 2,
        modes: [
          { text: "Destroy target artifact or enchantment.", targets: ["artifact-or-enchantment"], effect: { kind: "destroy", target: 0 } },
          { text: "Target player gains 5 life.", targets: ["player"], effect: { kind: "gain-life", amount: 5, toControllerOfTarget: 0 } },
          { text: "Create a 4/4 green Rhino Warrior creature token.", effect: { kind: "create-token", token: "Rhino Warrior Token", count: 1 } },
          {
            // "A creature you control": chosen as it resolves, not targeted.
            text: "Put a shield counter on a creature you control.",
            effect: {
              kind: "choose-permanents",
              filter: { type: "creature", controlledBy: "you" },
              min: 1,
              upTo: 1,
              then: { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
              prompt: "Put a shield counter on a creature you control",
            },
          },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose two —",
    },
  ],
});
