import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 19904. Chandra's Pyrohelix's shape: the split
// is chosen as it's cast, at least 1 to each target (the ruling).

export default defineCard({
  name: "Flames of the Firebrand",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Flames of the Firebrand deals 3 damage divided as you choose among one, two, or three targets.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 3 }],
  divided: { total: 3, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
