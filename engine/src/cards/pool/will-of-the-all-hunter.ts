import { defineCard } from "../define.js";

// EDHREC rank 25272. Ikoria: Lair of Behemoths.
//
// "If it's blocking" is read as the spell resolves: a creature that blocked
// stays a blocking creature through the end of combat step (its ruling).

export default defineCard({
  name: "Will of the All-Hunter",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Target creature gets +2/+2 until end of turn. If it's blocking, instead put two +1/+1 counters on it.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["creature"],
  effect: {
    kind: "conditional",
    condition: { kind: "target", index: 0, filter: { blocking: true } },
    then: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
    else: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
  },
});
