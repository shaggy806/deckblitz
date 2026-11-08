import { defineCard } from "../define.js";

// Rulings:
//   [2008-05-01] If the source of the damage is a permanent, Swans of Bryn Argoll checks who that
//     permanent's controller is at the time that damage is prevented. If the permanent has left the
//     battlefield by then, its last known information is used. If the source of the damage is a
//     spell, its controller is obvious. If the source of the damage is a card from some other zone,
//     Swans of Bryn Argoll checks its owner rather than its controller.

const TEXT =
  "If a source would deal damage to this creature, prevent that damage. The source's controller draws cards equal to the damage prevented this way.";

export default defineCard({
  name: "Swans of Bryn Argoll",
  manaCost: "{2}{W/U}{W/U}",
  colors: ["W", "U"],
  types: ["creature"],
  subtypes: ["Bird", "Spirit"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-deal-damage",
        to: "self",
        instead: { prevent: true, then: { kind: "draw", amount: "x", who: "trigger-controller" } },
      },
      text: TEXT,
    },
  ],
});
