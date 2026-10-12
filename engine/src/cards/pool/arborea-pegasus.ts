import { defineCard } from "../define.js";

export default defineCard({
  name: "Arborea Pegasus",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Pegasus"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, target creature gets +1/+1 and gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, target creature gets +1/+1 and gains flying until end of turn.",
    },
  ],
});
