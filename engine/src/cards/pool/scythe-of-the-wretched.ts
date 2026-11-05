import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Rulings: it triggers whatever killed the creature, as long as the Scythe
// equips the creature that dealt it damage as it dies; it isn't moved onto a
// returned card that isn't a creature (the attach's legality check). "That
// creature" is the card put onto the battlefield (`"put-this-way"`).

const DIES_TEXT =
  "Whenever a creature dealt damage by equipped creature this turn dies, return that card to the battlefield under your control. Attach this Equipment to that creature.";

export default defineCard({
  name: "Scythe of the Wretched",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +2/+2.\n${DIES_TEXT}\nEquip {4}`,
  static: [{ affects: { scope: "attached" }, grantPt: [2, 2], text: "Equipped creature gets +2/+2." }],
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", damagedThisTurnBy: { source: "host" } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "trigger-object", underYourControl: true },
          { kind: "attach", target: "put-this-way" },
        ],
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
  activated: [equip("{4}")],
});
