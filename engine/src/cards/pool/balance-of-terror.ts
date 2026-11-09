import { defineCard } from "../define.js";

const I_TEXT = "I — Destroy up to one other target artifact or enchantment.";
const II_III_TEXT =
  "II, III — Exile up to one other target permanent you control. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Balance of Terror",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "optional", of: { kind: "other", of: "artifact-or-enchantment" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2, 3],
      targets: [{ kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: {} } } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: { step: "end" },
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: II_III_TEXT,
    },
  ],
});
