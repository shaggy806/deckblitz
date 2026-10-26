import { defineCard } from "../define.js";

const TEXT = "Whenever a source deals damage to this creature, create a 2/2 black Phyrexian Zombie creature token.";

// Reaper of Sheoldred's trigger: once per source dealing damage to it (the
// ruling), infect damage included.
export default defineCard({
  name: "Nested Ghoul",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie", "Warrior"],
  power: 4,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "any", to: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Phyrexian Zombie Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
