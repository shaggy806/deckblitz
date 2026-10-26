import { defineCard } from "../define.js";

// EDHREC rank 16364. X is the mana value of the card milled this way, read as
// the ability resolves (0 when the library was empty).

const TEXT =
  "{2}: Target player mills a card. This creature gets +X/+X until end of turn, where X is the milled card's mana value.";
const X = { thisWay: "milled", sumOf: "mana-value" } as const;

export default defineCard({
  name: "Mindshrieker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit", "Bird"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["player"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: 0, amount: 1 },
          { kind: "modify-pt", target: "source", power: X, toughness: X, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
