import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 29140. Reaper of Sheoldred's trigger
// (`trigger-controller` is the damage source's controller) with Contested War
// Zone's change of control, indefinitely.

const TEXT =
  "Whenever a source deals damage to this creature, that source's controller gains control of this creature.";

export default defineCard({
  name: "Crag Saurian",
  manaCost: "{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "self" },
      targets: [],
      effect: { kind: "gain-control", target: "source", untilEndOfTurn: false, who: "trigger-controller" },
      resolve: null,
      text: TEXT,
    },
  ],
});
