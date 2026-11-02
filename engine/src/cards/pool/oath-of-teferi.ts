import { defineCard } from "../define.js";

const ENTERS =
  "When Oath of Teferi enters, exile another target permanent you control. Return it to the battlefield under its owner's control at the beginning of the next end step.";
const TWICE = "You may activate the loyalty abilities of planeswalkers you control twice each turn rather than only once.";

export default defineCard({
  name: "Oath of Teferi",
  manaCost: "{3}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${ENTERS}\n${TWICE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: {} } }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  static: [{ affects: { scope: "self" }, loyaltyActivationsEachTurn: 2, text: TWICE }],
});
