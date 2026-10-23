import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 13572. Pyrotechnics' shape over one or two targets:
// the division is chosen as it's cast, at least 1 to each (the ruling), and
// a target that becomes illegal just isn't dealt its share.
export default defineCard({
  name: "Chandra's Pyrohelix",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Chandra's Pyrohelix deals 2 damage divided as you choose among one or two targets.",
  targets: [{ kind: "any-number", of: "any-target", min: 1, max: 2 }],
  divided: { total: 2, slot: 0 },
  effect: { kind: "damage-divided", from: 0 },
});
