import { defineCard } from "../define.js";

// EDHREC rank 6008.

export default defineCard({
  name: "Jungle Basin",
  colors: [],
  types: ["land"],
  text: "This land enters tapped.\nWhen this land enters, sacrifice it unless you return an untapped Forest you control to its owner's hand.\n{T}: Add {C}{G}.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { all: ["C", "G"] }, amount: 1 },
      resolve: null,
      text: "{T}: Add {C}{G}.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [
          {
            returnToHand: { subtype: "Forest", controlledBy: "you", tapped: false },
            text: "Return an untapped Forest you control to its owner's hand",
          },
        ],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: "When this land enters, sacrifice it unless you return an untapped Forest you control to its owner's hand.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This land enters tapped.",
    },
  ],
});
