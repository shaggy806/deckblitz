import { defineCard } from "../define.js";

// EDHREC rank 5344. Tato Farmer's milled-this-turn target (a card milled, not
// one put there from a library some other way — the ruling), put onto the
// battlefield as a green Mutant with base power and toughness 3/3 (`enterAs`:
// green instead of its colours, Mutant instead of its creature types, its
// other types kept; base 3/3 over a characteristic-defining ability — the
// ruling), counters and other P/T effects still applying over it.
//
// Rulings:
//   If a player is instructed to put a card into their graveyard from their library without using
//     the word "mill," that card isn't a legal target for The Master's last ability.
//   The Master's last ability will override any characteristic-defining abilities the creature has
//     that set its power and/or toughness.

const ENTERS_TEXT = "When The Master enters, target player gets two rad counters.";
const TAP_TEXT =
  "{T}: Put target creature card in a graveyard that was milled this turn onto the battlefield under your control. It's a green Mutant with base power and toughness 3/3. (It loses its other colors and creature types.)";

export default defineCard({
  name: "The Master, Transcendent",
  manaCost: "{1}{B}{G}{U}",
  colors: ["U", "B", "G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Mutant"],
  power: 2,
  toughness: 4,
  text: `${ENTERS_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: { kind: "add-player-counters", counter: "rad", amount: 2, target: 0 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature", milledThisTurn: true } }],
      effect: {
        kind: "put-onto-battlefield",
        target: 0,
        underYourControl: true,
        enterAs: { setColors: ["G"], setSubtypes: ["Mutant"], basePt: [3, 3] },
      },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
