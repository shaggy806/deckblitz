import { defineCard } from "../define.js";

// Apocalypse (APC). "Whenever this deals damage", with no recipient named,
// fires once per simultaneous damage event (rule 603.2c), any kind of damage.
const TEXT = "Whenever this creature deals damage, choose one —\n• Each player loses 1 life.\n• Each player gains 1 life.";

export default defineCard({
  name: "Putrid Warrior",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Zombie", "Soldier", "Warrior"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Each player loses 1 life.", effect: { kind: "lose-life", amount: 1, who: "each-player" } },
          { text: "Each player gains 1 life.", effect: { kind: "gain-life", amount: 1, who: "each-player" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
