import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11128. Job select is Black Mage's Rod's shape.
// Makes Hero → "Hero Token (Black Mage's Rod)".
//
// Rulings:
//   [2025-06-06] You may pay the Equipment's equip cost as normal to move it from the Hero token
//     to another creature you control.
//   [2025-06-06] If the Hero token is destroyed, the Equipment stays on the battlefield.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//   [2025-06-06] The Hero token enters as a 1/1 creature, then the Equipment becomes attached to
//     it. Abilities that trigger when a creature enters the battlefield see that a 1/1 creature
//     entered the battlefield.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const UNTAP_TEXT = "Whenever this creature attacks, untap target attacking creature.";
const EQUIPPED_TEXT = `Equipped creature gets +1/+0, has "Whenever this creature attacks, untap target attacking creature," and is a Cleric in addition to its other types.`;

// The equipped creature's own ability: any attacking creature, itself included.
const UNTAP: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [{ kind: "permanent", filter: { type: "creature", attacking: true } }],
  effect: { kind: "untap", target: 0 },
  resolve: null,
  text: UNTAP_TEXT,
};

export default defineCard({
  name: "Sage's Nouliths",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nHagneia — Equip {3}`,
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
      grantPt: [1, 0],
      grantsTriggered: [UNTAP],
      addSubtypes: ["Cleric"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [{ ...equip("{3}"), text: "Hagneia — Equip {3}" }],
});
