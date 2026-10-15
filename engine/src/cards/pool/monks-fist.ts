import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 13475.
// Rulings:
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//   [2025-06-06] The Hero token enters as a 1/1 creature, then the Equipment becomes attached to
//     it. Abilities that trigger when a creature enters the battlefield see that a 1/1 creature
//     entered the battlefield.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const EQUIPPED_TEXT = "Equipped creature gets +1/+0 and is a Monk in addition to its other types.";

export default defineCard({
  name: "Monk's Fist",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  triggered: [
    {
      // Job select — Black Mage's Rod's shape: the Hero enters, then the
      // Equipment is attached to it (one of them, with two made).
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
      grantPt: [1, 0],
      addSubtypes: ["Monk"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
