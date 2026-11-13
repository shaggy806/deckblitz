import { defineCard } from "../define.js";

// EDHREC rank 4676.
// Rulings:
//   When the card returns to the battlefield, it will be a new object with no connection to the
//     card that was exiled. Auras attached to it go to their owners' graveyards, Equipment stays
//     on the battlefield unattached, and counters on it cease to exist.
//   If a token is exiled this way, it will cease to exist and won't return to the battlefield.
//
// The flicker sets up the end-step return with both keyword counters, put on
// as it enters (rule 122.6); returning it now (`reflicker` with `exileAgain:
// false`) makes it a new object, so that delayed return then finds nothing.

const TEXT =
  "{2}, {T}: Exile another target creature you control. You may return that card to the battlefield under its owner's control. If you don't, at the beginning of the next end step, return that card to the battlefield under its owner's control with a vigilance counter and a lifelink counter on it.";

export default defineCard({
  name: "Gilraen, Dúnedain Protector",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Noble"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "flicker",
            target: 0,
            returnAt: { step: "end" },
            thenCounters: { kind: "vigilance", amount: 1, entering: true, and: { kind: "lifelink", amount: 1, entering: true } },
            returnText:
              "Return that card to the battlefield under its owner's control with a vigilance counter and a lifelink counter on it.",
          },
          {
            kind: "may",
            prompt: "Return the exiled card to the battlefield now?",
            effect: { kind: "reflicker", exileAgain: false },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
