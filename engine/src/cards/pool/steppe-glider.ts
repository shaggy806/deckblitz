import { defineCard } from "../define.js";

const TEXT = "{1}{W}: Target creature with a +1/+1 counter on it gains flying and vigilance until end of turn.";

export default defineCard({
  name: "Steppe Glider",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 2,
  toughness: 4,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [
        {
          kind: "permanent",
          filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
