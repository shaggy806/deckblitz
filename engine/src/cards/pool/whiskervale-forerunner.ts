import { defineCard } from "../define.js";
import type { ZoneChoiceFilter } from "../../effects.js";
import { valiant } from "../helpers.js";

// EDHREC rank 9688.
//
// Rulings:
//   [2024-07-26] If a spell or ability you control has one or more of its targets changed to a
//     creature you control with a valiant ability, that ability will trigger if that creature
//     hasn't yet been the target of a spell or ability you control this turn.
//   [2024-07-26] If you create a copy of a spell on the stack and target a creature you control
//     with a valiant ability, that ability will trigger as long as the creature hasn't yet been
//     the target of a spell or ability you control this turn.
//   [2024-07-26] Valiant abilities will resolve before the spell or ability that caused them to
//     trigger.

const VALIANT_TEXT =
  "Valiant — Whenever this creature becomes the target of a spell or ability you control for the first time each turn, look at the top five cards of your library. You may reveal a creature card with mana value 3 or less from among them. You may put it onto the battlefield if it's your turn. If you don't put it onto the battlefield, put it into your hand. Put the rest on the bottom of your library in a random order.";

const SMALL_CREATURE: ZoneChoiceFilter = { type: "creature", manaValue: { op: "lte", n: 3 } };

export default defineCard({
  name: "Whiskervale Forerunner",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Mouse", "Bard"],
  power: 3,
  toughness: 4,
  text: VALIANT_TEXT,
  triggered: [
    valiant(
      {
        kind: "conditional",
        // "If it's your turn", read as it resolves: it can trigger on an
        // opponent's turn (an instant or ability targeting it then).
        condition: { kind: "your-turn" },
        // On your turn the revealed creature goes onto the battlefield, or,
        // if you don't put one there, into your hand (Planar Genesis's
        // two-pick shape; whichever pick takes it reveals it).
        then: {
          kind: "look-and-choose",
          zone: "library",
          count: 5,
          reveal: "chosen",
          min: 0,
          max: 1,
          filter: SMALL_CREATURE,
          destination: "battlefield",
          secondPick: { filter: SMALL_CREATURE, min: 0, max: 1, destination: "hand", ifNoneChosen: true },
          leftover: "bottom-random",
        },
        else: {
          kind: "look-and-choose",
          zone: "library",
          count: 5,
          reveal: "chosen",
          min: 0,
          max: 1,
          filter: SMALL_CREATURE,
          destination: "hand",
          leftover: "bottom-random",
        },
      },
      VALIANT_TEXT,
    ),
  ],
});
