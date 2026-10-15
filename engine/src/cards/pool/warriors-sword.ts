import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 10826. Job select is Black Mage's Rod's shape.
// Makes Hero → "Hero Token (Black Mage's Rod)".
//
// Rulings:
//   [2025-06-06] The Hero token enters as a 1/1 creature, then the Equipment becomes attached to
//     it. Abilities that trigger when a creature enters the battlefield see that a 1/1 creature
//     entered the battlefield.
//   [2025-06-06] If the Hero token is destroyed, the Equipment stays on the battlefield.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//   [2025-06-06] You may pay the Equipment's equip cost as normal to move it from the Hero token
//     to another creature you control.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const EQUIPPED_TEXT = "Equipped creature gets +3/+2 and is a Warrior in addition to its other types.";

export default defineCard({
  name: "Warrior's Sword",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nEquip {5} ({5}: Attach to target creature you control. Equip only as a sorcery.)`,
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
      grantPt: [3, 2],
      addSubtypes: ["Warrior"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{5}")],
});
