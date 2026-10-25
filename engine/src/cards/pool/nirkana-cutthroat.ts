import { defineCard } from "../define.js";

// EDHREC rank 22512.

export default defineCard({
  name: "Nirkana Cutthroat",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Level up {2}{B} ({2}{B}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-2\n4/3\nDeathtouch\nLEVEL 3+\n5/4\nFirst strike, deathtouch",
  activated: [
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "level", amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: "Level up {2}{B} ({2}{B}: Put a level counter on this. Level up only as a sorcery.)",
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
      setBasePt: { power: 4, toughness: 3 },
      grantKeywords: ["deathtouch"],
      text: "LEVEL 1-2\n4/3\nDeathtouch",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "level", compare: { op: "gte", n: 3 } },
      setBasePt: { power: 5, toughness: 4 },
      grantKeywords: ["first-strike", "deathtouch"],
      text: "LEVEL 3+\n5/4\nFirst strike, deathtouch",
    },
  ],
});
