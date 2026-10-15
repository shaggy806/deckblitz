import { defineCard } from "../define.js";

// EDHREC rank 13212. Shuri, Vibranium Technologist's modal enters trigger: the
// mode is chosen as it goes on the stack, with its target (rule 700.2a).

export default defineCard({
  name: "Coliseum Behemoth",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 7,
  toughness: 7,
  keywords: ["trample"],
  text: "Trample\nWhen this creature enters, choose one —\n• Destroy target artifact or enchantment.\n• Draw a card.",
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
          {
            text: "Destroy target artifact or enchantment.",
            targets: ["artifact-or-enchantment"],
            effect: { kind: "destroy", target: 0 },
          },
          { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: "When this creature enters, choose one —",
    },
  ],
});
