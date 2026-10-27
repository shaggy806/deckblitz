import { defineCard } from "../define.js";

// EDHREC rank 28451.
//
// Rulings:
//   [2004-12-01] If you exile Hikari, it leaves the battlefield before the spell that triggered it
//     resolves its ability, so it will be unaffected by that spell.
//   [2004-12-01] You may choose not to exile Hikari.
//
// A "may" over Djinn of the Fountain's flicker: the return is set up only
// when the exile happened ("if you do").

const TEXT =
  "Whenever you cast a Spirit or Arcane spell, you may exile Hikari. If you do, return it to the battlefield under its owner's control at the beginning of the next end step.";

export default defineCard({
  name: "Hikari, Twilight Guardian",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { anyOf: [{ subtype: "Spirit" }, { subtype: "Arcane" }] } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Hikari, Twilight Guardian until the next end step?",
        effect: {
          kind: "flicker",
          target: "source",
          returnAt: "next-end-step",
          returnText: "Return Hikari, Twilight Guardian to the battlefield under its owner's control.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
