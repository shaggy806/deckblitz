import { defineCard } from "../define.js";
import { extort } from "../helpers.js";

const EXTORT_TEXT =
  "Extort (Whenever you cast a spell, you may pay {W/B}. If you do, each opponent loses 1 life and you gain that much life.)";
const ENTERS_TEXT =
  "When this creature enters, pay any amount of life. Target opponent reveals that many cards from their hand. You choose one of them and exile it.";

export default defineCard({
  name: "Vizkopa Confessor",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 3,
  text: `${EXTORT_TEXT}\n${ENTERS_TEXT}`,
  triggered: [
    extort(),
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      // The life is chosen as it resolves, 0 allowed (its rulings): then
      // nothing is revealed or exiled. The opponent picks which cards to
      // reveal, as Blackmail's.
      effect: {
        kind: "players-pay-any-amount",
        resource: "life",
        who: "you",
        then: { kind: "discard-chosen", target: 0, reveals: "x", destination: "exile", unlinked: true },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
