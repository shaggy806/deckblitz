import { defineCard } from "../define.js";

// Doctor Who (WHO). "For each lore counter on Genesis of the Daleks" is read
// as each chapter ability resolves (as the Saga last existed if it has left,
// rule 608.2h). Chapter IV's villainous choice (rule 701.56) is the target
// opponent's to make, and either option is the Saga's controller's effect:
// "each of **your** opponents" are the controller's. "The total power of
// Daleks that died this turn" is a sum over the journal's `died` set — every
// Dalek creature that died this turn, whoever controlled it, each with its
// power as it last existed (rule 603.10a) — read after the destroy, so the
// ones it just destroyed count too.
//
// Rulings:
//   A player facing a villainous choice can always choose either option, even if one or both of
//     the options are impossible.

const CHAPTER_I_III =
  "I, II, III — Create a 3/3 black Dalek artifact creature token with menace for each lore counter on Genesis of the Daleks.";
const CHAPTER_IV =
  "IV — Target opponent faces a villainous choice — Destroy all Dalek creatures and each of your opponents loses life equal to the total power of Daleks that died this turn, or destroy all non-Dalek creatures.";

export default defineCard({
  name: "Genesis of the Daleks",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_I_III}\n${CHAPTER_IV}`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: {
        kind: "create-token",
        token: "Dalek Token",
        count: { countersOn: "source", counter: "lore" },
      },
      resolve: null,
      text: CHAPTER_I_III,
    },
    {
      at: [4],
      targets: ["opponent"],
      effect: {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        choices: [
          {
            text: "Destroy all Dalek creatures and each of your opponents loses life equal to the total power of Daleks that died this turn.",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "destroy-all", filter: { type: "creature", subtype: "Dalek" } },
                {
                  kind: "lose-life",
                  who: "each-opponent",
                  amount: {
                    aggregate: "sum",
                    of: "power",
                    filter: { subtype: "Dalek" },
                    in: { turnHistory: "died", who: "each-player" },
                  },
                },
              ],
            },
          },
          {
            text: "Destroy all non-Dalek creatures.",
            effect: { kind: "destroy-all", filter: { type: "creature", notSubtypes: ["Dalek"] } },
          },
        ],
      },
      resolve: null,
      text: CHAPTER_IV,
    },
  ],
});
