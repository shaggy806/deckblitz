import { defineCard } from "../define.js";

// Sacrificed as it resolves, not as a cost — zero is fine, and a sacrificed
// artifact or enchantment creature may come back (the rulings). Malevolent
// Witchkite's sacrifice, then that many creature cards.

const SACRIFICEABLE = {
  controlledBy: "you",
  anyOf: [{ type: "artifact" }, { type: "enchantment" }, { token: true }],
} as const;

export default defineCard({
  name: "Lich-Knights' Conquest",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Sacrifice any number of artifacts, enchantments, and/or tokens. Return that many creature cards from your graveyard to the battlefield.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "choose-permanents",
        filter: SACRIFICEABLE,
        upTo: { countOf: SACRIFICEABLE },
        then: { kind: "sacrifice-target", target: 0 },
        prompt: "Sacrifice any number of artifacts, enchantments, and/or tokens",
      },
      {
        kind: "return-from-graveyard",
        filter: { type: "creature" },
        destination: "battlefield",
        count: { thisWay: "sacrificed" },
      },
    ],
  },
});
