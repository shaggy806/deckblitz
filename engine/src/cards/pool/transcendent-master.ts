import { defineCard } from "../define.js";

// EDHREC rank 19126.

export default defineCard({
  name: "Transcendent Master",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric", "Avatar"],
  power: 3,
  toughness: 3,
  text: "Level up {1} ({1}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 6-11\n6/6\nLifelink\nLEVEL 12+\n9/9\nLifelink, indestructible",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "level", amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: "Level up {1} ({1}: Put a level counter on this. Level up only as a sorcery.)",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: {
        kind: "all",
        of: [
          { kind: "self-counters", counter: "level", compare: { op: "gte", n: 6 } },
          { kind: "self-counters", counter: "level", compare: { op: "lte", n: 11 } },
        ],
      },
      setBasePt: { power: 6, toughness: 6 },
      grantKeywords: ["lifelink"],
      text: "LEVEL 6-11\n6/6\nLifelink",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "level", compare: { op: "gte", n: 12 } },
      setBasePt: { power: 9, toughness: 9 },
      grantKeywords: ["lifelink", "indestructible"],
      text: "LEVEL 12+\n9/9\nLifelink, indestructible",
    },
  ],
});
