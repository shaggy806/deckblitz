import { defineCard } from "../define.js";

// Edge of Eternities. EDHREC rank 23500. "Target exiled card with warp" is a
// `card-in-exile` of anyone's, the printed warp ability read in exile
// (`hasKeyword: "warp"`) — a card exiled face down has no abilities (rule
// 406.3a). Whether a warped permanent was exiled by its own delayed trigger or
// anything else doesn't matter. The mode is chosen as the trigger is put on
// the stack (rule 700.2b), its target with it.

const ETB_TEXT = "When this creature enters, choose one —";
const COUNTERS_MODE = "Put two +1/+1 counters on this creature.";
const TUCK_MODE = "Put target exiled card with warp on the bottom of its owner's library.";

export default defineCard({
  name: "Blade of the Swarm",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Insect", "Assassin"],
  power: 3,
  toughness: 1,
  text: `${ETB_TEXT}\n• ${COUNTERS_MODE}\n• ${TUCK_MODE}`,
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
            effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
          },
          {
            text: TUCK_MODE,
            targets: [{ kind: "card-in-exile", filter: { hasKeyword: "warp" } }],
            effect: { kind: "put-on-library", target: 0, position: "bottom" },
          },
        ],
      },
      resolve: null,
      text: `${ETB_TEXT} ${COUNTERS_MODE} ${TUCK_MODE}`,
    },
  ],
});
