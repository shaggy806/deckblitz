import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 29220.

export default defineCard({
  name: "Forge Armor",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "As an additional cost to cast this spell, sacrifice an artifact.\nPut X +1/+1 counters on target creature, where X is the sacrificed artifact's mana value.",
  additionalCost: { sacrifice: { type: "artifact", controlledBy: "you" } },
  targets: ["creature"],
  effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: { manaValueOf: "sacrificed" } },
});
