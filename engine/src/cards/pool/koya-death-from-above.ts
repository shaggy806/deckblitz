import { defineCard } from "../define.js";

// EDHREC rank 20371.
//
// The exile, then a delayed triggered ability (rule 603.7) about the card it
// exiled (`about: "exiled"`, Satya's shape) — set up only when something was
// exiled, so with no target chosen nothing is asked at the end step. At the
// beginning of the next end step Koya's controller may pay {3}{B}; if they
// don't, that card returns under its owner's control. The delayed ability
// resolves even if Koya has left the battlefield (the ruling), and a token
// exiled this way has ceased to exist and doesn't return.

const TEXT =
  "When Koya enters, exile up to one other target creature. At the beginning of the next end step, you may pay {3}{B}. If you don't, return that card to the battlefield under its owner's control.";

export default defineCard({
  name: "Koya, Death from Above",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Bird"],
  power: 2,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "exiled",
            effect: {
              kind: "unless",
              chooser: "you",
              options: [{ pay: "{3}{B}", text: "Pay {3}{B}" }],
              otherwise: { kind: "put-onto-battlefield", target: 0 },
            },
            text: "You may pay {3}{B}. If you don't, return that card to the battlefield under its owner's control.",
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
