import { defineCard } from "../define.js";
import { addManaAbility } from "../helpers.js";

// −2 is `animate` with `setTypes`/`setSubtypes` (rule 205.1a: her ruling's
// "only a Treasure artifact", its supertypes kept) and `loseAbilities`, then
// the mana ability granted after the loss, so that it stays (rule 613.7).
// Its colors, name and mana cost stay too.
//
// −9 reads the target's poison counters as it resolves; "the difference" is
// 0 from nine up, so it needs no separate check. A replacement can still
// change what they actually get (her ruling).
const COMPLEATED_TEXT =
  "Compleated ({B/P} can be paid with {B} or 2 life. If life was paid, this planeswalker enters with two fewer loyalty counters.)";
const ZERO_TEXT = "0: You draw a card and lose 1 life. Proliferate.";
const MINUS_TWO_TEXT =
  '−2: Target creature becomes a Treasure artifact with "{T}, Sacrifice this artifact: Add one mana of any color" and loses all other card types and abilities.';
const MINUS_NINE_TEXT =
  "−9: If target player has fewer than nine poison counters, they get a number of poison counters equal to the difference.";

export default defineCard({
  name: "Vraska, Betrayal's Sting",
  manaCost: "{4}{B}{B/P}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Vraska"],
  loyalty: 6,
  compleated: true,
  text: `${COMPLEATED_TEXT}\n${ZERO_TEXT}\n${MINUS_TWO_TEXT}\n${MINUS_NINE_TEXT}`,
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "lose-life", amount: 1 }, { kind: "proliferate" }],
      },
      resolve: null,
      text: ZERO_TEXT,
    },
    {
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: 0,
            addTypes: [],
            setTypes: ["artifact"],
            addSubtypes: [],
            setSubtypes: ["Treasure"],
            loseAbilities: true,
            duration: "permanent",
          },
          {
            kind: "grant-activated",
            target: 0,
            ability: addManaAbility({
              mana: "any-color",
              sacrifice: "self",
              text: "{T}, Sacrifice this artifact: Add one mana of any color.",
            }),
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: MINUS_TWO_TEXT,
    },
    {
      loyaltyCost: -9,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "add-player-counters",
        counter: "poison",
        amount: { difference: [9, { playerCounters: "poison", forTarget: 0 }] },
        target: 0,
      },
      resolve: null,
      text: MINUS_NINE_TEXT,
    },
  ],
});
