import { defineCard } from "../define.js";

// EDHREC rank 22493.
// Diamond Pick-Axe's shape: the equipped creature *has* the trigger, so "you"
// is the creature's controller (Idolized's granted `attacks-alone`).

const GRANTED_TEXT = "Whenever this creature attacks alone, you draw a card and lose 1 life.";
const STATIC_TEXT = `Equipped creature gets +2/+0 and has "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Voltaic Whip",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
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
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 0],
      grantsTriggered: [
        {
          trigger: { on: "attacks-alone", who: "self" },
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "lose-life", amount: 1 },
            ],
          },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
