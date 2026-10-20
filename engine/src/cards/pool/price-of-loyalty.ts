import { defineCard } from "../define.js";

// EDHREC rank 14177. Act of Treason, plus "if mana from a Treasure was spent
// to cast this spell", read off the spell itself as it resolves.

export default defineCard({
  name: "Price of Loyalty",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Gain control of target creature until end of turn. Untap that creature. It gains haste until end of turn. If mana from a Treasure was spent to cast this spell, that creature gets +2/+0 until end of turn.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-control", target: 0, untilEndOfTurn: true },
      { kind: "untap", target: 0 },
      { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaFrom: { subtype: "Treasure" } } },
        then: { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
      },
    ],
  },
});
