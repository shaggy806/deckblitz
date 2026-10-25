import { defineCard } from "../define.js";

// EDHREC rank 24596.

export default defineCard({
  name: "Knight of Cliffhaven",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kor", "Knight"],
  power: 2,
  toughness: 2,
  text: "Level up {3} ({3}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-3\n2/3\nFlying\nLEVEL 4+\n4/4\nFlying, vigilance",
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "level", amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: "Level up {3} ({3}: Put a level counter on this. Level up only as a sorcery.)",
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
      setBasePt: { power: 2, toughness: 3 },
      grantKeywords: ["flying"],
      text: "LEVEL 1-3\n2/3\nFlying",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "level", compare: { op: "gte", n: 4 } },
      setBasePt: { power: 4, toughness: 4 },
      grantKeywords: ["flying", "vigilance"],
      text: "LEVEL 4+\n4/4\nFlying, vigilance",
    },
  ],
});
