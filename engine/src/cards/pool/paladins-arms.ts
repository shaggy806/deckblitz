import { defineCard } from "../define.js";
import { equip, ward } from "../helpers.js";

// EDHREC rank 8631.
// Makes Hero → use "Hero Token (Black Mage's Rod)".
//
// Rulings (the job select cycle's):
//   [2025-06-06] The Hero token enters as a 1/1 creature, then the Equipment becomes attached to
//     it. Abilities that trigger when a creature enters the battlefield see that a 1/1 creature
//     entered the battlefield.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//
// Ward {1} on the equipped creature is Dwarven Mattock's granted `ward` trigger.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const EQUIPPED_TEXT = "Equipped creature gets +2/+1, has ward {1}, and is a Knight in addition to its other types.";

export default defineCard({
  name: "Paladin's Arms",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nLightbringer and Hero's Shield — Equip {4} ({4}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      // Job select — Black Mage's Rod's shape.
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
      grantPt: [2, 1],
      addSubtypes: ["Knight"],
      grantsTriggered: [ward({ mana: "{1}" })],
      text: EQUIPPED_TEXT,
    },
  ],
  // "Lightbringer and Hero's Shield" is an ability word: the ability is plain equip {4}.
  activated: [{ ...equip("{4}"), text: "Lightbringer and Hero's Shield — Equip {4}" }],
});
