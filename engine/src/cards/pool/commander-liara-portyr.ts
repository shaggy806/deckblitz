import { defineCard } from "../define.js";

// EDHREC rank 7945.
//
// Rulings:
//   If you attack a planeswalker but not its controller, that player won't
//   count toward X.
//   The reduction applies to all spells you cast from exile this turn, even
//   under a different permission.
//   Liara needn't be among the attackers.
//
// X is the opponents attacked this combat (a planeswalker isn't its
// controller), read once as it resolves; the reduction reaches every spell
// cast from exile for the rest of the turn.

const TEXT =
  "Whenever you attack, spells you cast from exile this turn cost {X} less to cast, where X is the number of players being attacked. Exile the top X cards of your library. Until end of turn, you may cast spells from among those exiled cards.";

export default defineCard({
  name: "Commander Liara Portyr",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 5,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-spells-this-turn", castFrom: ["exile"], reduceGeneric: { opponentsAttacked: true } },
          { kind: "impulse-exile", amount: { opponentsAttacked: true }, duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
