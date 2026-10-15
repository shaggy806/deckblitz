import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8000.
// Makes Hero → use "Hero Token (Black Mage's Rod)".
//
// Rulings:
//   [2025-06-06] If the discarded card has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//
// The granted trigger is the equipped creature's own; "that player" is the
// player it dealt combat damage to (`"trigger-player"`), and the discarded
// card's mana value is the discard's this-way record read where it went (the
// graveyard, public — The Ancient One's `{ thisWay: "discarded", sumOf:
// "mana-value" }`). With nothing discarded it's 0.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const HIT_TEXT =
  "Whenever this creature deals combat damage to a player, draw a card, then discard a card. That player loses life equal to the discarded card's mana value.";
const EQUIPPED_TEXT = `Equipped creature gets +1/+1, is a Ninja in addition to its other types, and has "${HIT_TEXT}"`;

const HIT: TriggeredAbility = {
  trigger: { on: "deals-combat-damage-to-player", who: "self" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 1 },
      { kind: "discard", target: "you", amount: 1 },
      { kind: "lose-life", who: "trigger-player", amount: { thisWay: "discarded", sumOf: "mana-value" } },
    ],
  },
  resolve: null,
  text: HIT_TEXT,
};

export default defineCard({
  name: "Ninja's Blades",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nMutsunokami — Equip {2}`,
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
      addSubtypes: ["Ninja"],
      grantsTriggered: [HIT],
      text: EQUIPPED_TEXT,
    },
  ],
  // "Mutsunokami" is an ability word: the ability is plain equip {2}.
  activated: [{ ...equip("{2}"), text: "Mutsunokami — Equip {2}" }],
});
