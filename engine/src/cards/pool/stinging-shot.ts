import { defineCard } from "../define.js";

// EDHREC rank 22625.

export default defineCard({
  name: "Stinging Shot",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Put three -1/-1 counters on target creature with flying.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
  effect: { kind: "add-counter", target: 0, counter: "-1/-1", amount: 3 },
});
