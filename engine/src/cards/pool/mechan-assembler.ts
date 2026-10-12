import { defineCard } from "../define.js";

export default defineCard({
  name: "Mechan Assembler",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Artificer"],
  power: 4,
  toughness: 4,
  text: "Whenever another artifact you control enters, create a 2/2 colorless Robot artifact creature token. This ability triggers only once each turn.",
  triggered: [
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { type: "artifact" },
        otherOnly: true,
      },
      targets: [],
      effect: { kind: "create-token", token: "Robot Token", count: 1 },
      resolve: null,
      text: "Whenever another artifact you control enters, create a 2/2 colorless Robot artifact creature token. This ability triggers only once each turn.",
      oncePerTurn: true,
    },
  ],
});
