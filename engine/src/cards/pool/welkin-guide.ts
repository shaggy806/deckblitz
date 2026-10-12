import { defineCard } from "../define.js";

export default defineCard({
  name: "Welkin Guide",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, target creature gets +2/+2 and gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "When this creature enters, target creature gets +2/+2 and gains flying until end of turn.",
    },
  ],
});
