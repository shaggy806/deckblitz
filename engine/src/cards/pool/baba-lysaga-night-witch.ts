import { defineCard } from "../define.js";

// EDHREC rank 9676.
//
// Rulings:
//   [2022-06-10] You may sacrifice permanents that aren't different card types to pay the cost of
//     Baba Lysaga's activated ability, but if you do, it will have no effect.
//   [2022-06-10] Check the types of those permanents as they last existed on the battlefield to
//     see if there were three or more card types among the sacrificed permanents.
//
// "Up to three" is how many, 0 to 3 (`count: "x"` with `maxX: 3`), announced
// as it's activated and that many chosen as the cost is paid (601.2h) — Baba
// Lysaga herself among the permanents that may go. The card types are read
// off the sacrificed set as each last existed on the battlefield.

const TEXT =
  "{T}, Sacrifice up to three permanents: If there were three or more card types among the sacrificed permanents, each opponent loses 3 life, you gain 3 life, and you draw three cards.";

export default defineCard({
  name: "Baba Lysaga, Night Witch",
  manaCost: "{1}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: {}, count: "x" } },
      maxX: 3,
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "amounts", left: { cardTypesAmong: { paid: "sacrificed" } }, op: "gte", right: 3 },
        then: {
          kind: "sequence",
          effects: [
            { kind: "lose-life", who: "each-opponent", amount: 3 },
            { kind: "gain-life", amount: 3 },
            { kind: "draw", amount: 3 },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
