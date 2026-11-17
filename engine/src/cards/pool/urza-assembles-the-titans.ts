import { defineCard } from "../define.js";

// EDHREC rank 12140.
//
// Rulings:
//   After this Saga's third chapter ability resolves, you may activate the same ability of a
//     planeswalker twice that turn, or you may activate two different abilities of that
//     planeswalker that turn.
//   If more than one effect allows you to activate loyalty abilities of planeswalkers your control
//     twice rather than only once, those effects don't continue to increase the number of
//     activations.
//
// Chapter III is a rule for the turn (rule 611.2c: it changes no object's
// characteristics), so a planeswalker that arrives later is reached too, and
// one activated before it resolved may be activated once more. A timed static
// on its controller, read by `loyaltyActivationsBase` beside Oath of Teferi's,
// and twice is still twice with both.
const READ_AHEAD =
  "Read ahead (Choose a chapter and start with that many lore counters. Add one after your draw step. Skipped chapters don't trigger. Sacrifice after III.)";
const CHAPTER_I =
  "I — Scry 4, then you may reveal the top card of your library. If a planeswalker card is revealed this way, put it into your hand.";
const CHAPTER_II = "II — You may put a planeswalker card with mana value 6 or less from your hand onto the battlefield.";
const TWICE = "You may activate the loyalty abilities of planeswalkers you control twice this turn rather than only once.";
const CHAPTER_III = `III — ${TWICE}`;

export default defineCard({
  name: "Urza Assembles the Titans",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `${READ_AHEAD}\n${CHAPTER_I}\n${CHAPTER_II}\n${CHAPTER_III}`,
  readAhead: true,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "scry",
        amount: 4,
        then: {
          kind: "may",
          prompt: "Reveal the top card of your library?",
          effect: {
            kind: "reveal-top",
            then: {
              kind: "conditional",
              condition: { kind: "target", index: 0, filter: { type: "planeswalker" } },
              then: { kind: "return-to-hand", target: 0, from: "library" },
            },
          },
        },
      },
      resolve: null,
      text: CHAPTER_I,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        filter: { type: "planeswalker", manaValue: { op: "lte", n: 6 } },
        destination: "battlefield",
        leftover: "stay",
      },
      resolve: null,
      text: CHAPTER_II,
    },
    {
      at: [3],
      targets: [],
      effect: {
        kind: "timed-static",
        duration: "end-of-turn",
        static: [{ affects: { scope: "self" }, loyaltyActivationsEachTurn: 2, text: TWICE }],
        text: TWICE,
      },
      resolve: null,
      text: CHAPTER_III,
    },
  ],
});
