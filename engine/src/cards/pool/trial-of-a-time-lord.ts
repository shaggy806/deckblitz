import { defineCard } from "../define.js";

// Doctor Who (WHO). EDHREC rank 10882.
//
// I–III each exile until the Saga leaves (rule 610.3); IV is a will-of-the-council vote whose
// "guilty" (option 1) must get more votes than "innocent" — a tie isn't more. The cards it sends
// to the bottom of their owners' libraries are every card exiled with it, the until-it-leaves
// ones included, each owner arranging their own (rule 401.4).
//
// Rulings:
//   The cards that didn't get put on the bottom of their owners' libraries will return to the
//     battlefield as Trial of a Time Lord leaves the battlefield.

const I_III_TEXT =
  "I, II, III — Exile target nontoken creature an opponent controls until this Saga leaves the battlefield.";
const IV_TEXT =
  "IV — Starting with you, each player votes for innocent or guilty. If guilty gets more votes, the owner of each card exiled with this Saga puts that card on the bottom of their library.";

export default defineCard({
  name: "Trial of a Time Lord",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${I_III_TEXT}\n${IV_TEXT}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", token: false } }],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: I_III_TEXT,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "vote", for: { options: ["innocent", "guilty"] } },
          {
            kind: "conditional",
            condition: { kind: "vote-won", option: 1 },
            then: { kind: "put-on-libraries", what: { exiledWithSource: true }, position: "bottom" },
          },
        ],
      },
      resolve: null,
      text: IV_TEXT,
    },
  ],
});
