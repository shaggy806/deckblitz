import { defineCard } from "../define.js";

// EDHREC rank 24309.

export default defineCard({
  name: "Beastbreaker of Bala Ged",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: "Level up {2}{G} ({2}{G}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-3\n4/4\nLEVEL 4+\n6/6\nTrample",
  activated: [
    {
      cost: { mana: "{2}{G}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "level", amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: "Level up {2}{G} ({2}{G}: Put a level counter on this. Level up only as a sorcery.)",
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
      setBasePt: { power: 4, toughness: 4 },
      text: "LEVEL 1-3\n4/4",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "level", compare: { op: "gte", n: 4 } },
      setBasePt: { power: 6, toughness: 6 },
      grantKeywords: ["trample"],
      text: "LEVEL 4+\n6/6\nTrample",
    },
  ],
});
