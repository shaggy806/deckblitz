import { defineCard } from "../define.js";

// EDHREC rank 22429.

export default defineCard({
  name: "Armored Transport",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Construct"],
  power: 2,
  toughness: 1,
  text: "Prevent all combat damage that would be dealt to this creature by creatures blocking it.",
  // A blocking creature deals combat damage only to the attackers it blocks,
  // so combat damage to this creature from a creature that is blocking is
  // damage from a creature blocking it.
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        combat: true,
        prevent: true,
        to: "self",
        source: { type: "creature", blocking: true },
      },
      text: "Prevent all combat damage that would be dealt to this creature by creatures blocking it.",
    },
  ],
});
