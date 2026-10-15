import { defineCard } from "../define.js";

// EDHREC rank 18163.
//
// Rulings:
//   [2026-08-21] If the copied permanent has {X} in its mana cost, X is considered to be 0.
//   [2026-08-21] The tokens copy exactly what was printed on the original permanent and nothing
//     else (unless that permanent is copying something else or is a token).
//   [2026-08-21] The copies of the target spell are created on the stack, so they're not "cast."
//   [2026-08-21] If the spell that's copied is modal, the copies will have the same mode or modes.
//   [2026-08-21] The copies will have the same targets as the spell they're copying unless you
//     choose new ones. You may change any number of the targets, including all of them or none of
//     them.
//   [2026-08-21] If the spell that's copied has an X whose value was determined as it was cast,
//     the copies have the same value of X.
//
// A modal triggered ability: the mode is chosen as it's put on the stack
// (rule 700.2b), and with it the target. Orthion, Hero of Lavabrink's token
// shape for the second mode.
const ENTERS_TEXT = "When Venser enters, choose one —";
const COPY_SPELL_TEXT =
  "Copy target instant or sorcery spell an opponent controls twice. You may choose new targets for the copies.";
const COPY_PERMANENT_TEXT =
  "Create two tokens that are copies of target permanent an opponent controls. They gain haste. At the beginning of the next end step, sacrifice them.";

export default defineCard({
  name: "Venser, Fervent Forger",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Sorcerer"],
  power: 5,
  toughness: 3,
  keywords: ["flash"],
  text: `Flash\n${ENTERS_TEXT}\n• ${COPY_SPELL_TEXT}\n• ${COPY_PERMANENT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: COPY_SPELL_TEXT,
            targets: [{ kind: "spell", whose: "opponent", filter: { typesAnyOf: ["instant", "sorcery"] } }],
            effect: { kind: "copy-spell", target: 0, newTargets: true, count: 2 },
          },
          {
            text: COPY_PERMANENT_TEXT,
            targets: [{ kind: "permanent", whose: "opponent", filter: {} }],
            effect: {
              kind: "create-token-copy",
              of: 0,
              count: 2,
              gains: { keywords: ["haste"] },
              sacrificeAtEndStep: true,
              who: "you",

            },
          },
        ],
      },
      resolve: null,
      text: `${ENTERS_TEXT}\n• ${COPY_SPELL_TEXT}\n• ${COPY_PERMANENT_TEXT}`,
    },
  ],
});
