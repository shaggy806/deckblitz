import type { StaticCondition } from "../define.js";
import { defineCard } from "../define.js";

// Never both preventions at once (the ruling); neither reaches a
// planeswalker you control (the ruling) — `toFilter` is creatures only.
const LEVEL_1_4: StaticCondition = {
  kind: "all",
  of: [
    { kind: "self-counters", counter: "level", compare: { op: "gte", n: 1 } },
    { kind: "self-counters", counter: "level", compare: { op: "lte", n: 4 } },
  ],
};
const LEVEL_5: StaticCondition = { kind: "self-counters", counter: "level", compare: { op: "gte", n: 5 } };
const PREVENT_1 = "If a source would deal damage to you or a creature you control, prevent 1 of that damage.";
const PREVENT_2 = "If a source would deal damage to you or a creature you control, prevent 2 of that damage.";

export default defineCard({
  name: "Hedron-Field Purists",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 0,
  toughness: 3,
  text: `Level up {2}{W} ({2}{W}: Put a level counter on this. Level up only as a sorcery.)\nLEVEL 1-4\n1/4\n${PREVENT_1}\nLEVEL 5+\n2/5\n${PREVENT_2}`,
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "level", amount: 1 },
      resolve: null,
      sorcerySpeed: true,
      text: "Level up {2}{W} ({2}{W}: Put a level counter on this. Level up only as a sorcery.)",
    },
  ],
  static: [
    { affects: { scope: "self" }, condition: LEVEL_1_4, setBasePt: { power: 1, toughness: 4 }, text: "LEVEL 1-4\n1/4" },
    {
      affects: { scope: "self" },
      condition: LEVEL_1_4,
      replacement: { event: "would-deal-damage", to: "your-side", toFilter: { type: "creature" }, preventAmount: 1 },
      text: PREVENT_1,
    },
    { affects: { scope: "self" }, condition: LEVEL_5, setBasePt: { power: 2, toughness: 5 }, text: "LEVEL 5+\n2/5" },
    {
      affects: { scope: "self" },
      condition: LEVEL_5,
      replacement: { event: "would-deal-damage", to: "your-side", toFilter: { type: "creature" }, preventAmount: 2 },
      text: PREVENT_2,
    },
  ],
});
