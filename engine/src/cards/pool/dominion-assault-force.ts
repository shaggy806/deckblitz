import { defineCard } from "../define.js";

// EDHREC rank 32666.

const ETB_TEXT = "When this creature enters, choose one —";

export default defineCard({
  name: "Dominion Assault Force",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Jem'Hadar", "Warrior"],
  power: 4,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${ETB_TEXT}\n• Exile target card from a graveyard.\n• Surveil 1. (Look at the top card of your library. You may put it into your graveyard.)`,
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
            text: "Exile target card from a graveyard.",
            targets: [{ kind: "card-in-graveyard", whose: "any" }],
            effect: { kind: "exile", target: 0 },
          },
          { text: "Surveil 1.", effect: { kind: "surveil", amount: 1 } },
        ],
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
