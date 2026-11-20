import { defineCard } from "../define.js";

// EDHREC rank 17039. "If a land enters this way, it enters tapped" is the
// return's `tapped` filter, judged on each card as it comes back (rule
// 614.1c): the other cards return untapped.

const ENTER_TEXT =
  "When Silver Surfer enters, exile any number of other target permanents you control. Return those cards to the battlefield under their owner's control at the beginning of the next end step. If a land enters this way, it enters tapped.";

export default defineCard({
  name: "Silver Surfer, Cosmic Voyager",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Alien", "Hero"],
  power: 5,
  toughness: 5,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: {} } } }],
      effect: {
        kind: "flicker",
        target: { from: 0 },
        returnAt: { step: "end" },
        tapped: { type: "land" },
        returnText:
          "Return those cards to the battlefield under their owner's control. If a land enters this way, it enters tapped.",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
