import { defineCard } from "../define.js";

// EDHREC rank 16596.
//
// Rulings:
//   [2026-06-29] After each permanent returns to the battlefield, it will be a new object with no
//     connection to the permanent that was exiled. It won't be in combat or have any additional
//     abilities it may have had when it was exiled. Any counters on it cease to exist; Auras
//     attached to it are put into their owner's graveyards; and any Equipment will become
//     unattached.
//   [2026-06-29] If a token is exiled this way, it will cease to exist and will not return to the
//     battlefield.

const CHAPTER_TEXT =
  "I, II, III, IV — Exile up to one target creature or land you control. If you do, return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Roll-Roll-Roll-Roll",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_TEXT}`,
  chapters: [
    {
      at: [1, 2, 3, 4],
      targets: [
        { kind: "optional", of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["creature", "land"] } } },
      ],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: CHAPTER_TEXT,
    },
  ],
});
