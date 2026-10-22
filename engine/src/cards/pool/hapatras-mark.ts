import { defineCard } from "../define.js";

// Amonkhet. Hexproof, then every -1/-1 counter off it (Ammit Eternal's
// "remove all": the count it has as this resolves).
export default defineCard({
  name: "Hapatra's Mark",
  manaCost: "{G}",
  colors: ["G"],
  types: ["instant"],
  text: "Target creature you control gains hexproof until end of turn. Remove all -1/-1 counters from it. (A creature with hexproof can't be the target of spells or abilities your opponents control.)",
  targets: ["creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "end-of-turn" },
      { kind: "remove-counter", target: 0, counter: "-1/-1", amount: { countersOn: 0, counter: "-1/-1" } },
    ],
  },
});
