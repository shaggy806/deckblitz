import { defineCard } from "../define.js";

// Betrayers of Kamigawa. The counter, then the spell's controller (as it last
// existed on the stack, 608.2h) reveals their hand and discards every card
// named like one spliced onto it (`sameNameAsSplicedOnto`, read off the
// spell's `lastOnStack`, 702.47) — the spliced cards themselves, still in
// that hand, among them. A spell that can't be countered still has its
// controller reveal and discard.

export default defineCard({
  name: "Minamo's Meddling",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. That spell's controller reveals their hand, then discards each card with the same name as a card spliced onto that spell.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      { kind: "discard-hand", who: { controllerOf: 0 }, filter: { sameNameAsSplicedOnto: 0 }, reveal: true },
    ],
  },
});
