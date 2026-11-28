import { defineCard } from "../define.js";

// Eldritch Moon. "Sacrifice it" is the equipped creature, not the Axe. The
// intervening if (rule 603.4) reads the creature the Axe is attached to: one
// with no `dealt-combat-damage-to-creature` entry this turn, in its stint (a
// journaled clause — combat damage to a permanent that was a creature as it
// was dealt). Unattached, it doesn't trigger.

const END =
  "At the beginning of your end step, if equipped creature didn't deal combat damage to a creature this turn, sacrifice it.";

export default defineCard({
  name: "Thirsting Axe",
  manaCost: "{3}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +4/+0.\n${END}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [4, 0],
      text: "Equipped creature gets +4/+0.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "source",
        filter: {
          attachedTo: { type: "creature", not: { journaled: { what: "dealt-combat-damage-to-creature" } } },
        },
      },
      targets: [],
      effect: { kind: "sacrifice-target", target: "attached" },
      resolve: null,
      text: END,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
});
