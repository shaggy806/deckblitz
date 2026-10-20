import { defineCard } from "../define.js";

const TEXT = "Whenever an opponent casts or copies an instant or sorcery spell, they lose 1 life.";

export default defineCard({
  name: "Mage Hunter",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 3,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: {
        on: "cast-spell",
        who: "opponent",
        orCopy: true,
        filter: { typesAnyOf: ["instant", "sorcery"] },
      },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
