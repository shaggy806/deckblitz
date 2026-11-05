import { defineCard } from "../define.js";

// Not targeted: `choose-permanents` puts every pick in the slots from 0 (`thenTogether`), and
// one `flicker` over `{ from: 0 }` exiles them together and returns them together.

const ENTER_TEXT =
  "When Yorion enters, exile any number of other nonland permanents you own and control. Return those cards to the battlefield at the beginning of the next end step.";
const YOURS = { notTypes: ["land"], controlledBy: "you", ownedBy: "you" } as const;

export default defineCard({
  name: "Yorion, Sky Nomad",
  manaCost: "{3}{W/U}{W/U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bird", "Serpent"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text:
    "Companion — Your starting deck contains at least twenty cards more than the minimum deck size. (If this card is your chosen companion, you may put it into your hand from outside the game for {3} as a sorcery.)\n" +
    `Flying\n${ENTER_TEXT}`,
  companion: { kind: "deck-size-over-minimum", atLeast: 20 },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: YOURS,
        exceptSource: true,
        upTo: { countOf: YOURS },
        thenTogether: true,
        then: {
          kind: "flicker",
          target: { from: 0 },
          returnAt: "next-end-step",
          returnText: "Return those cards to the battlefield.",
        },
        prompt: "Exile any number of other nonland permanents you own and control",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
