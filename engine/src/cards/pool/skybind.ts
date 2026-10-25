import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

const TEXT =
  "Constellation — Whenever this enchantment or another enchantment you control enters, exile target nonenchantment permanent. Return that card to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Skybind",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "enchantment" } },
      targets: [{ kind: "permanent", filter: { notTypes: ["enchantment"] } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
