import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, you may exile target creature if it attacked or blocked this turn. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Vizier of Deferment",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "conditional",
        condition: {
          kind: "target",
          index: 0,
          filter: { anyOf: [{ attackedThisTurn: true }, { blockedThisTurn: { relation: "blocked" } }] },
        },
        then: {
          kind: "may",
          prompt: "Exile that creature until the next end step?",
          effect: {
            kind: "flicker",
            target: 0,
            returnAt: "next-end-step",
            returnText: "Return that card to the battlefield under its owner's control.",
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
