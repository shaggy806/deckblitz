import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 24267.
//
// A prevention replacement on damage to this creature whose source is a
// spell on the stack targeting it (`source: { targets: { source: true } }`,
// read with this creature as the filter's source), active while you control
// another creature.

const TEXT =
  "As long as you control another creature, prevent all damage that would be dealt to this creature by spells that target it.";

export default defineCard({
  name: "Bronze Horse",
  manaCost: "{7}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Horse"],
  power: 4,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "creature" }, atLeast: 1, excludeSelf: true },
      replacement: { event: "would-deal-damage", prevent: true, to: "self", source: { targets: { source: true } } },
      text: TEXT,
    },
  ],
});
