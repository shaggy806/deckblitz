import { defineCard } from "../define.js";

// EDHREC rank 26552. An Aura spell targets what it will enchant (rule 303.4a).

export default defineCard({
  name: "Ring of Immortals",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: "{3}, {T}: Counter target instant or Aura spell that targets a permanent you control.",
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [
        {
          kind: "spell",
          filter: {
            anyOf: [{ type: "instant" }, { subtype: "Aura" }],
            targets: { permanent: { controlledBy: "you" } },
          },
        },
      ],
      effect: { kind: "counter", target: 0 },
      resolve: null,
      text: "{3}, {T}: Counter target instant or Aura spell that targets a permanent you control.",
    },
  ],
});
