import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7929.
// Makes Hero → use "Hero Token (Black Mage's Rod)".
//
// Rulings (the job select cycle's):
//   [2025-06-06] The Hero token enters as a 1/1 creature, then the Equipment becomes attached to
//     it. Abilities that trigger when a creature enters the battlefield see that a 1/1 creature
//     entered the battlefield.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const LIFE_TEXT = "Whenever this creature attacks, you gain 1 life.";
const EQUIPPED_TEXT =
  'Equipped creature gets +1/+1, has "Whenever this creature attacks, you gain 1 life," and is a Cleric in addition to its other types.';

// The equipped creature's own ability (Medic's Kitesail's shape).
const LIFE: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: { kind: "gain-life", amount: 1 },
  resolve: null,
  text: LIFE_TEXT,
};

export default defineCard({
  name: "White Mage's Staff",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
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
      grantPt: [1, 1],
      grantsTriggered: [LIFE],
      addSubtypes: ["Cleric"],
      text: EQUIPPED_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
