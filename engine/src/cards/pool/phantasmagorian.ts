import { defineCard } from "../define.js";

// EDHREC rank 22346.
//
// Rulings:
//   [2007-02-01] When this spell is cast, its "when you cast" ability triggers and goes on the
//     stack on top of it.
//   [2007-02-01] As the triggered ability resolves, the active player gets the option to perform
//     the action. If that player declines, the next player in turn order gets the option. As soon
//     as any player performs the action, the spell is countered, but the remaining players still
//     get the option. If all players decline, the spell remains on the stack.
//   [2013-07-01] A player can't choose to discard unless they actually have three cards in their
//     hand.

const CAST_TEXT =
  "When you cast this spell, any player may discard three cards. If a player does, counter Phantasmagorian.";
const RETURN_TEXT = "Discard three cards: Return this card from your graveyard to your hand.";

// Every player is asked in turn from the active player (an option is offered
// only to a player with three cards in hand); the spell is countered once
// for whoever did — nothing can happen between the answers, so countering
// after the last answer is the same as countering at the first.
export default defineCard({
  name: "Phantasmagorian",
  manaCost: "{5}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 6,
  toughness: 6,
  text: `${CAST_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ discard: 3, text: "Discard three cards to counter Phantasmagorian" }],
        ifDid: { kind: "counter", target: "source" },
      },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 3 } },
      zone: "graveyard",
      staysInZone: true,
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
