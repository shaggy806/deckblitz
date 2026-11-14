import { defineCard } from "../define.js";

// EDHREC rank 9411.
//
// The hone counters are counted from target opponent's side (`forTarget`);
// each gives the equipped creature +1/+0 (rule 122.1j, `honeBonus`).

const ENTER_TEXT =
  "When Sting enters, put a hone counter on Sting for each creature target opponent controls. Attach Sting to up to one target creature you control.";

export default defineCard({
  name: "Sting, Bilbo's Sword",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT} (Each hone counter on an Equipment grants +1/+0 to equipped creature.)\nEquip {3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent", { kind: "optional", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "add-counter",
            target: "source",
            counter: "hone",
            amount: { countOf: { type: "creature", controlledBy: "you" }, forTarget: 0 },
          },
          { kind: "attach", target: 1, attachment: "source" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
});
