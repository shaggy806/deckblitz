import { defineCard } from "../define.js";
import type { TriggeredAbility } from "../../abilities.js";

// EDHREC rank 11551.
//
// Rulings:
//   [2023-11-10] A creature attacks alone if it's the only creature declared as an attacker during
//     the declare attackers step (including creatures controlled by your teammates, if
//     applicable). For example, exalted won't trigger if you attack with multiple creatures and
//     all but one of them are removed from combat.
//   [2024-01-12] Tapping an untapped creature that's attacking or blocking to convoke a spell
//     won't cause that creature to stop attacking or blocking.
//   [2024-01-12] When calculating a spell's total cost, include any alternative costs, additional
//     costs, or anything else that increases or reduces the cost to cast the spell. Convoke
//     applies after the total cost is calculated. Convoke doesn't change a spell's mana cost or
//     mana value.
//   [2024-01-12] Because convoke isn't an alternative cost, it can be used in conjunction with
//     alternative costs.
//   [2024-01-12] You can tap any untapped creature you control to convoke a spell, even one you
//     haven't controlled continuously since the beginning of your most recent turn.
//   [2024-01-12] If a creature you control has a mana ability with {T} in the cost, activating
//     that ability while casting a spell with convoke will result in the creature being tapped
//     before you pay the spell's costs. You won't be able to tap it again for convoke. Similarly,
//     if you sacrifice a creature to activate a mana ability while casting a spell with convoke,
//     that creature won't be on the battlefield when you pay the spell's costs, so you won't be
//     able to tap it for convoke.
//   [2024-01-12] Tapping a multicolored creature using convoke will pay for {1} or one mana of
//     your choice of any of that creature's colors.

// Exalted is Qasali Pridemage's "attacks-alone" trigger (rule 702.83), and
// "Other Vampires you control have exalted" Merchant of Truth's grant of it:
// each instance triggers on its own (702.83b).
const EXALTED_TEXT =
  "Exalted (Whenever a creature you control attacks alone, that creature gets +1/+1 until end of turn.)";
const GRANT_TEXT = "Other Vampires you control have exalted.";
const EXALTED: TriggeredAbility = {
  trigger: { on: "attacks-alone", who: "you-control" },
  targets: [],
  effect: { kind: "modify-pt", target: "trigger-object", power: 1, toughness: 1, duration: "end-of-turn" },
  resolve: null,
  text: EXALTED_TEXT,
};

export default defineCard({
  name: "Order of Sacred Dusk",
  manaCost: "{6}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Vampire", "Knight"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "lifelink", "haste"],
  convoke: true,
  text: `Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nFlying, lifelink, haste\n${EXALTED_TEXT}\n${GRANT_TEXT}`,
  triggered: [EXALTED],
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Vampire", controlledBy: "you" }, excludeSelf: true },
      grantsTriggered: [EXALTED],
      text: GRANT_TEXT,
    },
  ],
});
