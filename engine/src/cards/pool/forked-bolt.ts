import { defineCard } from "../define.js";

// EDHREC rank 12308. Twin Bolt's divided damage: divided as it's cast, at
// least 1 to each target (the ruling).

export default defineCard({
  name: "Forked Bolt",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Forked Bolt deals 2 damage divided as you choose among one or two targets.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
  divided: { total: 2, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
