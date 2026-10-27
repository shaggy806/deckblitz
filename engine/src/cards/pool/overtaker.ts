import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 22886. Threaten as a Spellshaper's
// ability.

const TEXT =
  "{3}{U}, {T}, Discard a card: Untap target creature and gain control of it until end of turn. That creature gains haste until end of turn.";

export default defineCard({
  name: "Overtaker",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Spellshaper"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}{U}", tap: true, discard: { count: 1 } },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: true },
          { kind: "untap", target: 0 },
          { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
