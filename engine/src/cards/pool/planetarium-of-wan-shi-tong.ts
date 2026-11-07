import { defineCard } from "../define.js";

// EDHREC rank 3240.
//
// Rulings:
//   You cannot choose to pay the mana cost or any alternate costs for the card if you choose to
//     cast it, and if it has {X} in its mana cost, you must choose 0 as the value of {X}.
//   Once you choose to cast the top card of your library, Planetarium of Wan Shi Tong's ability
//     won't trigger again that turn.
//   You must pay any mandatory additional costs (such as sacrificing a creature) and you may pay
//     any optional additional costs (such as kicker) for the card you cast.
//   Planetarium of Wan Shi Tong's triggered ability allows you to cast the top card of your
//     library during the resolution of the ability. It doesn't allow you to wait and cast the
//     card later.
//
// "Do this only once each turn" is spent only by casting (the second ruling):
// the cast marks the ability done this turn (`marksAbilityDone`), and the
// `this-ability-did-this-turn` condition keeps it from triggering again —
// asked as it triggers and again as it resolves, so a second trigger already
// waiting does nothing once the first has cast.

const TRIGGER_TEXT =
  "Whenever you scry or surveil, look at the top card of your library. You may cast that card without paying its mana cost. Do this only once each turn. (Look at the card after you scry or surveil.)";

export default defineCard({
  name: "Planetarium of Wan Shi Tong",
  manaCost: "{6}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: "{1}, {T}: Scry 2.\n" + TRIGGER_TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "scry", amount: 2 },
      resolve: null,
      text: "{1}, {T}: Scry 2.",
    },
  ],
  triggered: [
    {
      trigger: { on: "scries", who: "you", orSurveil: true },
      condition: { kind: "not", of: { kind: "this-ability-did-this-turn" } },
      targets: [],
      effect: { kind: "cast-now", from: { libraryTop: 1 }, free: true, marksAbilityDone: true },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
