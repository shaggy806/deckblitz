import { defineCard } from "../define.js";
import { ninjutsu, ninjutsuText } from "../helpers.js";

const COMBAT_TEXT =
  "Whenever Nashi deals combat damage to a player, exile the top card of each player's library. Until end of turn, you may play one of those cards. If you cast a spell this way, pay life equal to its mana value rather than paying its mana cost.";

export default defineCard({
  name: "Nashi, Moon Sage's Scion",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Rat", "Ninja"],
  power: 3,
  toughness: 2,
  text: `${ninjutsuText("{3}{B}")}\n${COMBAT_TEXT}`,
  activated: [ninjutsu("{3}{B}")],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "impulse-exile",
        amount: 1,
        whose: "each-player",
        duration: "end-of-turn",
        play: true,
        upTo: 1,
        byPayingLife: true,
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
  ],
});
