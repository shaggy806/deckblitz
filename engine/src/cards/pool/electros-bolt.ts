import { defineCard } from "../define.js";

export default defineCard({
  name: "Electro's Bolt",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  mayhem: { cost: "{1}{R}" },
  text: "Electro's Bolt deals 4 damage to target creature.\nMayhem {1}{R} (You may cast this card from your graveyard for {1}{R} if you discarded it this turn. Timing rules still apply.)",
  targets: ["creature"],
  effect: { kind: "damage", amount: 4, target: 0 },
});
