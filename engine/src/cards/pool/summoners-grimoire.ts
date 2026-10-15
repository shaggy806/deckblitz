import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7854.
// Makes Hero → use "Hero Token (Black Mage's Rod)".
//
// Rulings (the job select cycle's):
//   [2025-06-06] The Hero token enters as a 1/1 creature, then the Equipment becomes attached to
//     it. Abilities that trigger when a creature enters the battlefield see that a 1/1 creature
//     entered the battlefield.
//   [2025-06-06] If the job select ability causes two Hero tokens to be created (due to an effect
//     such as that of Doubling Season), the Equipment becomes attached to only one of them.
//
// "You may put a creature card from your hand onto the battlefield. If that
// card is an enchantment card, it enters tapped and attacking": how it enters
// is part of the move (rule 614.12), decided by the card put. The choice is
// one of any creature card in the hand or none; it's asked as which kind of
// card, then which card of it — an enchantment creature card (tapped and
// attacking, Ilharg's `attacking: "choose"`, which asks what it attacks only
// when there's a choice) or any other creature card — each of which may be
// declined. The same cards are on offer either way, and the kind is fixed by
// the card picked, so no outcome differs from the printed single choice.

const JOB_TEXT =
  "Job select (When this Equipment enters, create a 1/1 colorless Hero creature token, then attach this to it.)";
const ATTACK_TEXT =
  "Whenever this creature attacks, you may put a creature card from your hand onto the battlefield. If that card is an enchantment card, it enters tapped and attacking.";
const EQUIPPED_TEXT = `Equipped creature is a Shaman in addition to its other types and has "${ATTACK_TEXT}"`;

const ATTACK: TriggeredAbility = {
  trigger: { on: "attacks", who: "self" },
  targets: [],
  effect: {
    kind: "modal",
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: "Put an enchantment creature card from your hand onto the battlefield tapped and attacking.",
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: 1,
          filter: { types: ["creature", "enchantment"] },
          destination: "battlefield",
          enterTapped: true,
          attacking: "choose",
          leftover: "stay",
        },
      },
      {
        text: "Put a non-enchantment creature card from your hand onto the battlefield.",
        effect: {
          kind: "look-and-choose",
          zone: "hand",
          min: 0,
          max: 1,
          filter: { type: "creature", notTypes: ["enchantment"] },
          destination: "battlefield",
          leftover: "stay",
        },
      },
    ],
  },
  resolve: null,
  text: ATTACK_TEXT,
};

export default defineCard({
  name: "Summoner's Grimoire",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["artifact"],
  subtypes: ["Book", "Equipment"],
  text: `${JOB_TEXT}\n${EQUIPPED_TEXT}\nAbraxas — Equip {3}`,
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
      addSubtypes: ["Shaman"],
      grantsTriggered: [ATTACK],
      text: EQUIPPED_TEXT,
    },
  ],
  // "Abraxas" is an ability word: the ability is plain equip {3}.
  activated: [{ ...equip("{3}"), text: "Abraxas — Equip {3}" }],
});
