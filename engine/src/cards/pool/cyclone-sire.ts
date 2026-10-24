import { defineCard } from "../define.js";

// Rulings:
//   [2016-01-22] If you target a land that's already a creature with Cyclone Sire's triggered
//     ability, that land creature's base power and toughness will become 0/0, overwriting its
//     previous base power and toughness. Other effects that modify its power and/or toughness
//     (including the new and any previously-existing +1/+1 counters) will continue to apply.

const DIES_TEXT =
  "When this creature dies, you may put three +1/+1 counters on target land you control. If you do, that land becomes a 0/0 Elemental creature with haste that's still a land.";

export default defineCard({
  name: "Cyclone Sire",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: ["land-you-control"],
      effect: {
        kind: "may",
        prompt:
          "Put three +1/+1 counters on the target land? If you do, it becomes a 0/0 Elemental creature with haste that's still a land.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
            {
              kind: "animate",
              target: 0,
              power: 0,
              toughness: 0,
              addTypes: ["creature"],
              addSubtypes: ["Elemental"],
              keywords: ["haste"],
              duration: "permanent",
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
