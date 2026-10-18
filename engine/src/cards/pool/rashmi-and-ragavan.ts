import { defineCard } from "../define.js";

// EDHREC rank 10350.
//
// "Your first spell during each of your turns" counts spells cast before
// Rashmi and Ragavan arrived (the ruling: on the turn you cast it, it doesn't
// trigger). The card is exiled face up with a cast-this-turn permission at
// once, so "if you don't cast it this way, you may cast it this turn" holds
// whatever happens at the free offer: cast free as this resolves (timing
// ignored, X = 0) when it's a spell with mana value less than the artifacts
// you control as it resolves — the new Treasure counted (the ruling) — or
// later this turn by paying its costs at normal timing. "Cast" only: a land
// can't be played. Not cast at all, it stays exiled.
const TEXT =
  "Whenever you cast your first spell during each of your turns, exile the top card of target opponent's library and create a Treasure token. Then you may cast the exiled card without paying its mana cost if it's a spell with mana value less than the number of artifacts you control. If you don't cast it this way, you may cast it this turn.";

export default defineCard({
  name: "Rashmi and Ragavan",
  manaCost: "{1}{G}{U}{R}",
  colors: ["U", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Monkey"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", firstEachTurn: true },
      condition: { kind: "your-turn" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "impulse-exile", amount: 1, whose: 0, duration: "end-of-turn", castOnly: true },
          { kind: "create-token", token: "Treasure Token", count: 1 },
          {
            kind: "cast-now",
            from: "exiled-this-way",
            free: true,
            spell: {
              manaValue: { op: "lt", n: { amount: { countOf: { type: "artifact", controlledBy: "you" } } } },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
