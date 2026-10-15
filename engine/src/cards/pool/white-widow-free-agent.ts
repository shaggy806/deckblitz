import { defineCard } from "../define.js";

// EDHREC rank 18129.
//
// A modal triggered ability: the mode is announced as it goes on the stack,
// and each mode brings its own targets (Byrke's "up to two", Cavalier of
// Dawn's graveyard card).
const ETB_TEXT = "When White Widow enters, choose one —";
const COUNTERS_MODE = "Put a +1/+1 counter on each of up to two target creatures.";
const RETURN_MODE = "Return target artifact or enchantment card from your graveyard to your hand.";

export default defineCard({
  name: "White Widow, Free Agent",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Hero", "Villain"],
  power: 2,
  toughness: 3,
  text: `${ETB_TEXT}\n• ${COUNTERS_MODE}\n• ${RETURN_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: COUNTERS_MODE,
            targets: [
              { kind: "optional", of: "creature" },
              { kind: "optional", of: { kind: "other", of: "creature", than: { slots: [0] } } },
            ],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
                { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
              ],
            },
          },
          {
            text: RETURN_MODE,
            targets: [
              { kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["artifact", "enchantment"] } },
            ],
            effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
          },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${COUNTERS_MODE} ${RETURN_MODE}`,
    },
  ],
});
