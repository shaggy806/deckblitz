import { defineCard } from "../define.js";

export default defineCard({
  name: "Reality Strobe",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  suspend: { n: 3, cost: "{2}{U}" },
  text: "Return target permanent to its owner's hand. Exile Reality Strobe with three time counters on it.\nSuspend 3—{2}{U} (Rather than cast this card from your hand, you may pay {2}{U} and exile it with three time counters on it. At the beginning of your upkeep, remove a time counter. When the last is removed, you may cast it without paying its mana cost.)",
  targets: ["permanent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      // Venture Forth's shape: the resolving spell itself, exiled suspended.
      { kind: "give-suspend", target: "source", timeCounters: 3 },
    ],
  },
});
