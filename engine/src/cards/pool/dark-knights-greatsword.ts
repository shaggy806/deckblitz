import { defineCard } from "../define.js";

// EDHREC rank 11869. Job select is Black Mage's Rod's shape.
// Makes Hero → "Hero Token (Black Mage's Rod)".
//
// Rulings:
//   [2025-06-06] You may pay the Equipment's equip cost as normal to move it from the Hero token
//     to another creature you control.
//   [2025-06-06] The Hero token enters as a 1/1 creature, then the Equipment becomes attached to
//     it. Abilities that trigger when a creature enters the battlefield see that a 1/1 creature
//     entered the battlefield.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//   [2025-06-06] If the Hero token is destroyed, the Equipment stays on the battlefield.
//
// "Equip—Pay 3 life" is equip with a life cost (Dissection Tools' non-mana
// equip shape), still only as a sorcery (rule 702.6a), and once each turn.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const EQUIPPED_TEXT = "Equipped creature gets +3/+0 and is a Knight in addition to its other types.";
const EQUIP_TEXT = "Chaosbringer — Equip—Pay 3 life. Activate only once each turn.";

export default defineCard({
  name: "Dark Knight's Greatsword",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\n${EQUIP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Hero Token (Black Mage's Rod)", count: 1 },
          { kind: "attach", target: "created", attachment: "source" },
        ],
      },
      resolve: null,
      text: JOB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 0],
      addSubtypes: ["Knight"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 3 },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: EQUIP_TEXT,
      sorcerySpeed: true,
      oncePerTurn: true,
    },
  ],
});
