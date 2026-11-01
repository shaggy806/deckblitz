import { defineCard } from "../define.js";

// The second target shares artifact or creature with the first (`shares`
// with `among`), checked as it's cast and again as it resolves: no longer
// sharing one, both are illegal and the exchange doesn't happen (the ruling;
// rule 608.2b). Either illegal, nothing changes hands (701.12a).
export default defineCard({
  name: "Legerdemain",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exchange control of target artifact or creature and another target permanent that shares one of those types with it. (This effect lasts indefinitely.)",
  targets: [
    "artifact-or-creature",
    {
      kind: "other",
      of: "permanent",
      than: { slot: 0 },
      shares: { kind: "card", among: ["artifact", "creature"] },
    },
  ],
  effect: { kind: "exchange-control", objects: [0, 1] },
});
