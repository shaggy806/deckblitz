import { defineCard } from "../define.js";

// EDHREC rank 26532.

export default defineCard({
  name: "Shuri, Vibranium Technologist",
  manaCost: "{2}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer", "Hero"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: "Vigilance\nWhen Shuri enters, choose one —\n• Create a 1/1 colorless Robot Hero artifact creature token with flying.\n• Draw a card.",
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
            text: "Create a 1/1 colorless Robot Hero artifact creature token with flying.",
            effect: { kind: "create-token", token: "1/1 Robot Hero Token", count: 1 },
          },
          { text: "Draw a card.", effect: { kind: "draw", amount: 1 } },
        ],
      },
      resolve: null,
      text: "When Shuri enters, choose one —",
    },
  ],
});
