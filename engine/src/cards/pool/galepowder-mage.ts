import { defineCard } from "../define.js";

// Roon of the Hidden Realm's flicker on an attack trigger; the return is a
// delayed trigger, so it happens even if the Mage has left (the ruling).
export default defineCard({
  name: "Galepowder Mage",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Wizard"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWhenever this creature attacks, exile another target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature" }],
      effect: {
        kind: "flicker",
        target: 0,
        returnAt: "next-end-step",
        returnText: "Return the exiled card to the battlefield under its owner's control.",
      },
      resolve: null,
      text: "Whenever this creature attacks, exile another target creature. Return that card to the battlefield under its owner's control at the beginning of the next end step.",
    },
  ],
});
