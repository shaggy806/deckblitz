import { defineCard } from "../define.js";

// EDHREC rank 24435.

export default defineCard({
  name: "Skywatcher Adept",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 1,
  toughness: 1,
  text: "Level up {3} ({3}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-2\n2/2\nFlying\nLEVEL 3+\n4/2\nFlying",
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
          { kind: "self-counters", counter: "level", compare: { op: "lte", n: 2 } },
        ],
      },
      setBasePt: { power: 2, toughness: 2 },
      grantKeywords: ["flying"],
      text: "LEVEL 1-2\n2/2\nFlying",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "level", compare: { op: "gte", n: 3 } },
      setBasePt: { power: 4, toughness: 2 },
      grantKeywords: ["flying"],
      text: "LEVEL 3+\n4/2\nFlying",
    },
  ],
});
