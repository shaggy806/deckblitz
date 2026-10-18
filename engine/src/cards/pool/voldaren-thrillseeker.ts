import type { ActivatedAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 12662.
//
// Rulings:
//   [2023-04-14] Use the creature's power as it last existed on the battlefield to determine how
//     much damage it deals to the target.
//   [2023-04-14] Backup confers only abilities that are actually printed below it.
//   [2023-04-14] If a backup ability targets the creature with backup, that creature will get
//     +1/+1 counters, but it won't gain additional abilities.
//   [2023-04-14] If a backup ability causes another creature to gain abilities, the creature with
//     backup will still have those abilities.
//   [2023-04-14] The abilities that backup grants to the target creature are determined only
//     once, at the time the ability triggers.
//
// The sacrifice ability is Blazing Bomb's: "it" is the sacrificed creature,
// its power read as it last existed (the ruling). Granted by backup, "this
// creature" is the creature that gained it.

const SAC_TEXT = "{1}, Sacrifice this creature: It deals damage equal to its power to any target.";

const SAC: ActivatedAbility = {
  cost: { mana: "{1}", tap: false, sacrifice: "self" },
  targets: ["any-target"],
  effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
  resolve: null,
  text: SAC_TEXT,
};

export default defineCard({
  name: "Voldaren Thrillseeker",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Vampire", "Warrior"],
  power: 1,
  toughness: 1,
  text: `Backup 2 (When this creature enters, put two +1/+1 counters on target creature. If that's another creature, it gains the following ability until end of turn.)\n${SAC_TEXT}`,
  triggered: [backup(2, { activated: [SAC] })],
  activated: [SAC],
});
