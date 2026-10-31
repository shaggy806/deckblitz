import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

const DAMAGE_TEXT =
  "Whenever one or more creatures you control deal combat damage to a player, create a Treasure token and manifest the top card of that player's library. (Put it onto the battlefield face down as a 2/2 creature. Turn it face up any time for its mana cost if it's a creature card.)";

// "Manifest the top card of that player's library": you manifest it (rule
// 701.40a), from the damaged player's library (`from: "trigger-player"`),
// so it enters under your control (110.2a) and its owner can't look at it
// (708.5). You may turn it face up for its mana cost if it's a creature card
// (701.40b).

export default defineCard({
  name: "Orochi Soul-Reaver",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Snake", "Ninja", "Rogue"],
  power: 5,
  toughness: 4,
  text: `${ninjutsuText("{3}{B}")}\n${DAMAGE_TEXT}`,
  activated: [ninjutsu("{3}{B}")],
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { type: "creature" }, combat: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Treasure Token", count: 1 },
          { kind: "manifest", who: "you", from: "trigger-player" },
        ],
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
