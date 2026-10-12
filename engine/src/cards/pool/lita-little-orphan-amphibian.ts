import { defineCard } from "../define.js";

// EDHREC rank 8143. Gala Greeters' shape: the mode is announced as each
// instance goes on the stack (rule 603.3c), so creatures entering together
// each take a different one, and past the third in a turn there's nothing
// left to choose (the rulings).
const TRIGGER_TEXT =
  "Alliance — Whenever another creature you control enters, choose one that hasn't been chosen this turn.";
const COUNTER_MODE = "Put a +1/+1 counter on Lita.";
const FOOD_MODE = "Create a Food token.";
const FOOD_REMINDER = "(It's an artifact with \"{2}, {T}, Sacrifice this token: You gain 3 life.\")";
const SCRY_MODE = "Scry 1.";

export default defineCard({
  name: "Lita, Little Orphan Amphibian",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Ninja", "Turtle"],
  power: 2,
  toughness: 1,
  text: `${TRIGGER_TEXT}\n• ${COUNTER_MODE}\n• ${FOOD_MODE} ${FOOD_REMINDER}\n• ${SCRY_MODE}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        notChosenThisTurn: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: COUNTER_MODE, effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
          { text: FOOD_MODE, effect: { kind: "create-token", token: "Food Token", count: 1 } },
          { text: SCRY_MODE, effect: { kind: "scry", amount: 1 } },
        ],
      },
      resolve: null,
      text: `${TRIGGER_TEXT} ${COUNTER_MODE} ${FOOD_MODE} ${SCRY_MODE}`,
    },
  ],
});
