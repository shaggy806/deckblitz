import { defineCard } from "../define.js";

// EDHREC rank 22654.

export default defineCard({
  name: "Caravan Escort",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 1,
  toughness: 1,
  text: "Level up {2} ({2}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-4\n2/2\nLEVEL 5+\n5/5\nFirst strike",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "level", amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: "Level up {2} ({2}: Put a level counter on this. Level up only as a sorcery.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "self-counters", counter: "level", compare: { op: "gte", n: 1 } },
          { kind: "self-counters", counter: "level", compare: { op: "lte", n: 4 } },
        ],
      },
      setBasePt: { power: 2, toughness: 2 },
      text: "LEVEL 1-4\n2/2",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "level", compare: { op: "gte", n: 5 } },
      setBasePt: { power: 5, toughness: 5 },
      grantKeywords: ["first-strike"],
      text: "LEVEL 5+\n5/5\nFirst strike",
    },
  ],
});
