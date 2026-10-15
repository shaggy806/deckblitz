import { defineCard } from "../define.js";

export default defineCard({
  name: "Thwip!",
  manaCost: "{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Target creature gets +2/+2 and gains flying until end of turn. If it's a Spider, you gain 2 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      // Read as it resolves.
      {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { subtype: "Spider" } },
        then: { kind: "gain-life", amount: 2 },
      },
    ],
  },
});
