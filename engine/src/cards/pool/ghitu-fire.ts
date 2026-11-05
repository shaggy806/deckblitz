import { defineCard } from "../define.js";

// EDHREC rank 22897.

export default defineCard({
  name: "Ghitu Fire",
  manaCost: "{X}{R}",
  colors: ["R"],
  types: ["sorcery"],
  kicker: { cost: "{2}", keyword: "flash", flash: true },
  text: "You may cast this spell as though it had flash if you pay {2} more to cast it. (You may cast it any time you could cast an instant.)\nGhitu Fire deals X damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: "x", target: 0 },
});
