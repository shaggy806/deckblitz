import { defineCard } from "../define.js";
import { valiant } from "../helpers.js";

// EDHREC rank 9135.
//
// Rulings:
//   [2024-07-26] If a spell or ability you control has one or more of its targets changed to a
//     creature you control with a valiant ability, that ability will trigger if that creature
//     hasn't yet been the target of a spell or ability you control this turn.
//   [2024-07-26] Valiant abilities will resolve before the spell or ability that caused them to
//     trigger.
//   [2024-07-26] If you create a copy of a spell on the stack and target a creature you control
//     with a valiant ability, that ability will trigger as long as the creature hasn't yet been
//     the target of a spell or ability you control this turn.
//   [2024-07-26] You pay all costs and follow all timing rules for cards played this way. For
//     example, if the exiled card is a land card, you may play it only during your main phase
//     while the stack is empty.

const PROWESS_TEXT = "Prowess (Whenever you cast a noncreature spell, this creature gets +1/+1 until end of turn.)";
const VALIANT_TEXT =
  "Valiant — Whenever this creature becomes the target of a spell or ability you control for the first time each turn, exile the top card of your library. Until end of turn, you may play that card.";

export default defineCard({
  name: "Emberheart Challenger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Mouse", "Warrior"],
  power: 2,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${PROWESS_TEXT}\n${VALIANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PROWESS_TEXT,
    },
    valiant({ kind: "impulse-exile", amount: 1, duration: "end-of-turn" }, VALIANT_TEXT),
  ],
});
