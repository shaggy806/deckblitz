import { defineCard } from "../define.js";

// EDHREC rank 15384.
//
// I–III: the legendary card found stays in exile (`keepFound`), playable for
// as long as the Saga remains on the battlefield as the same object (rule
// 611.2b — `"while-source"`), the rest going to the bottom. IV: the Doctors
// are chosen, not targeted, as one set ("chosen" this way), then "all other
// creatures" are every creature not chosen; you may exile them even with no
// Doctor chosen (the ruling), and only if you do does the Saga deal you 13.

const I_III_TEXT =
  "I, II, III — Exile cards from the top of your library until you exile a legendary card. You may play that card for as long as this Saga remains on the battlefield. Put the rest of those exiled cards on the bottom of your library in a random order.";
const IV_TEXT =
  "IV — Choose up to three Doctors. You may exile all other creatures. If you do, this Saga deals 13 damage to you.";

export default defineCard({
  name: "The Day of the Doctor",
  manaCost: "{3}{R}{W}",
  colors: ["R", "W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${I_III_TEXT}\n${IV_TEXT}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { supertype: "legendary" },
        exile: true,
        keepFound: true,
        rest: "bottom-random",
        then: { kind: "grant-play", cards: 0, duration: "while-source", play: true },
      },
      resolve: null,
      text: I_III_TEXT,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "choose-permanents",
            filter: { subtype: "Doctor" },
            upTo: 3,
            thenTogether: true,
            then: { kind: "sequence", effects: [] },
            prompt: "Choose up to three Doctors",
          },
          {
            kind: "may",
            prompt: "Exile all other creatures? If you do, The Day of the Doctor deals 13 damage to you.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "exile-all", filter: { type: "creature", notThisWay: "chosen" } },
                { kind: "damage", amount: 13, who: "you" },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: IV_TEXT,
    },
  ],
});
