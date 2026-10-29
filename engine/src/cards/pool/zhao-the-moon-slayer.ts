import { defineCard } from "../define.js";

const NONBASIC_LAND = { type: "land", notSupertype: "basic" } as const;

// Every nonbasic land enters tapped, whoever's, even one whose own "enters
// tapped unless" condition holds (the ruling). With a conqueror counter, rule
// 305.7: the lands lose their other land types and rules-text abilities and
// have "{T}: Add {R}" — a land entering then has none of its own entering
// abilities.
export default defineCard({
  name: "Zhao, the Moon Slayer",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: "Menace\nNonbasic lands enter tapped.\n{7}: Put a conqueror counter on Zhao.\nAs long as Zhao has a conqueror counter on him, nonbasic lands are Mountains. (They lose all other land types and abilities and have \"{T}: Add {R}.\")",
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "conqueror", amount: 1 },
      resolve: null,
      text: "{7}: Put a conqueror counter on Zhao.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "others-enter-battlefield", filter: NONBASIC_LAND, tapped: true },
      text: "Nonbasic lands enter tapped.",
    },
    {
      affects: { scope: "filter", filter: NONBASIC_LAND },
      condition: { kind: "self-counters", counter: "conqueror", compare: { op: "gte", n: 1 } },
      setSubtypes: ["Mountain"],
      text: "As long as Zhao has a conqueror counter on him, nonbasic lands are Mountains.",
    },
  ],
});
