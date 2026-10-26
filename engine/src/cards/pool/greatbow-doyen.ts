import { defineCard } from "../define.js";

// Rulings:
//   [2008-04-01] The ability will trigger whether the damage is combat damage or not.
//   [2008-04-01] The second ability triggers only when an Archer permanent you control deals
//     damage to a creature. It won't trigger when an Archer spell you control deals damage.
//     (A non-permanent Archer source can only be a Kindred instant or sorcery spell, which the
//     trigger's filter leaves out.)

const ANTHEM_TEXT = "Other Archer creatures you control get +1/+1.";
const TRIGGER_TEXT =
  "Whenever an Archer you control deals damage to a creature, that Archer deals that much damage to that creature's controller.";

export default defineCard({
  name: "Greatbow Doyen",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer"],
  power: 2,
  toughness: 4,
  text: `${ANTHEM_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Archer" },
      grantPt: [1, 1],
      text: ANTHEM_TEXT,
    },
  ],
  triggered: [
    {
      trigger: {
        on: "deals-damage",
        who: "you-control",
        filter: { subtype: "Archer", notTypes: ["instant", "sorcery"] },
        to: "creature",
      },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "trigger-player", from: "trigger-object" },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
