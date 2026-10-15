import { defineCard } from "../define.js";

// EDHREC rank 13031. Auntie's Sentence's discard mode beside Earthbending
// Lesson's earthbend.

const DISCARD_MODE =
  "Target opponent reveals their hand. You choose a nonland permanent card from it. That player discards that card.";
const EARTHBEND_MODE = "Earthbend 2.";

export default defineCard({
  name: "Dai Li Indoctrination",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Lesson"],
  text:
    `Choose one —\n• ${DISCARD_MODE}\n• ${EARTHBEND_MODE} ` +
    "(Target land you control becomes a 0/0 creature with haste that's still a land. Put two +1/+1 counters on it. When it dies or is exiled, return it to the battlefield tapped.)",
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      {
        text: DISCARD_MODE,
        targets: ["opponent"],
        effect: {
          kind: "discard-chosen",
          target: 0,
          filter: { typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"], notTypes: ["land"] },
        },
      },
      {
        text: EARTHBEND_MODE,
        targets: ["land-you-control"],
        effect: { kind: "earthbend", target: 0, amount: 2 },
      },
    ],
  },
});
