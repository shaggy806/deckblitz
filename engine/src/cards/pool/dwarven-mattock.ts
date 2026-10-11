import { defineCard } from "../define.js";
import { equip, ward } from "../helpers.js";

// EDHREC rank 12930. The enters trigger is Maul of the Skyclaves' shape with
// the target narrowed to a Dwarf you control; the ward is Lavaspur Boots'.

const ENTER_TEXT = "When this Equipment enters, attach it to target Dwarf you control.";
const STATIC_TEXT = "Equipped creature gets +2/+2 and has ward {1}.";

export default defineCard({
  name: "Dwarven Mattock",
  manaCost: "{2}",
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    `${ENTER_TEXT}\n${STATIC_TEXT} (Whenever equipped creature becomes the target of a spell or ability an opponent controls, counter it unless that player pays {1}.)\n` +
    "Equip {3}",
  activated: [equip("{3}")],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "permanent", whose: "you", filter: { subtype: "Dwarf" } }],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantsTriggered: [ward({ mana: "{1}" })],
      text: STATIC_TEXT,
    },
  ],
});
