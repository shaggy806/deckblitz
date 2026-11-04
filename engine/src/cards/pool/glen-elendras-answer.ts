import { defineCard } from "../define.js";

// One that can't be countered wasn't countered this way, and makes no Faerie.
export default defineCard({
  name: "Glen Elendra's Answer",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text:
    "This spell can't be countered.\n" +
    "Counter all spells your opponents control and all abilities your opponents control. Create a 1/1 blue and black Faerie creature token with flying for each spell and ability countered this way.",
  cantBeCountered: true,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-on-stack",
        spells: true,
        abilities: true,
        whose: "opponent",
        effect: { kind: "counter", target: 0 },
      },
      { kind: "create-token", token: "Faerie Token (Glen Elendra's Answer)", count: { thisWay: "countered" } },
    ],
  },
});
