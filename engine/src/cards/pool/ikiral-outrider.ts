import { defineCard } from "../define.js";

// EDHREC rank 25240.

export default defineCard({
  name: "Ikiral Outrider",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 2,
  text: "Level up {4} ({4}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-3\n2/6\nVigilance\nLEVEL 4+\n3/10\nVigilance",
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "level", amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: "Level up {4} ({4}: Put a level counter on this. Level up only as a sorcery.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "self-counters", counter: "level", compare: { op: "gte", n: 1 } },
          { kind: "self-counters", counter: "level", compare: { op: "lte", n: 3 } },
        ],
      },
      setBasePt: { power: 2, toughness: 6 },
      grantKeywords: ["vigilance"],
      text: "LEVEL 1-3\n2/6\nVigilance",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "level", compare: { op: "gte", n: 4 } },
      setBasePt: { power: 3, toughness: 10 },
      grantKeywords: ["vigilance"],
      text: "LEVEL 4+\n3/10\nVigilance",
    },
  ],
});
