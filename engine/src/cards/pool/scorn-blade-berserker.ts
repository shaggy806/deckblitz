import type { ActivatedAbility } from "../../abilities.js";
import { defineCard } from "../define.js";
import { backup } from "../helpers.js";

// EDHREC rank 9389. March of the Machine.
//
// Backup grants only what's printed below it, fixed as it triggers; on the
// Berserker itself it's just the counter (the rulings). The granted "{1},
// Sacrifice this creature" sacrifices the creature that has it.

const DRAW: ActivatedAbility = {
  cost: { mana: "{1}", tap: false, sacrifice: "self" },
  targets: [],
  effect: { kind: "draw", amount: 1 },
  resolve: null,
  text: "{1}, Sacrifice this creature: Draw a card.",
};

export default defineCard({
  name: "Scorn-Blade Berserker",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 0,
  toughness: 1,
  text: "Backup 1 (When this creature enters, put a +1/+1 counter on target creature. If that's another creature, it gains the following ability until end of turn.)\n{1}, Sacrifice this creature: Draw a card.",
  activated: [DRAW],
  triggered: [backup(1, { activated: [DRAW] })],
});
