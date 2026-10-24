import { defineCard } from "../define.js";

// EDHREC rank 18885.
//
// Rulings:
//   If you don't control any creatures or can't put any -1/-1 counters on any creature you
//     control, you can't cast Lethal Sting.
//
// Blight 1 under another name (rule 701.68a): a mandatory additional cost
// (601.2f), so the one option. Offered only with a creature the counter can
// go on (701.68b) — not under Melira or Solemnity — and which one is chosen
// as it's paid.
export default defineCard({
  name: "Lethal Sting",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "As an additional cost to cast this spell, put a -1/-1 counter on a creature you control.\nDestroy target creature.",
  additionalCost: {
    options: [{ text: "Put a -1/-1 counter on a creature you control", blight: 1 }],
  },
  targets: ["creature"],
  effect: { kind: "destroy", target: 0 },
});
