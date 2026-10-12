import { defineCard } from "../define.js";

export default defineCard({
  name: "Shivan Meteor",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  suspend: { n: 2, cost: "{1}{R}{R}" },
  text: "Shivan Meteor deals 13 damage to target creature.\nSuspend 2—{1}{R}{R} (Rather than cast this card from your hand, you may pay {1}{R}{R} and exile it with two time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["creature"],
  effect: { kind: "damage", amount: 13, target: 0 },
});
