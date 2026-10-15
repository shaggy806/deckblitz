import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8510.
// Makes Hero → use "Hero Token (Black Mage's Rod)".
//
// Rulings:
//   [2025-06-06] The ability granted by Red Mage's Rapier resolves before the spell that caused it
//     to trigger. It resolves even if that spell is countered or otherwise leaves the stack.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const PUMP_TEXT = "Whenever you cast a noncreature spell, this creature gets +2/+0 until end of turn";
const EQUIPPED_TEXT = `Equipped creature has "${PUMP_TEXT}" and is a Wizard in addition to its other types.`;

// The equipped creature's own ability, so "this creature" is it.
const PUMP: TriggeredAbility = {
  trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
  targets: [],
  effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
  resolve: null,
  text: `${PUMP_TEXT}.`,
};

export default defineCard({
  name: "Red Mage's Rapier",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nEquip {3}`,
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
      grantsTriggered: [PUMP],
      addSubtypes: ["Wizard"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
