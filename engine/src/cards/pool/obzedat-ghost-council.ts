import { defineCard } from "../define.js";

// EDHREC rank 10667.
//
// The return is a delayed trigger, and "it gains haste" is part of it, for as
// long as that object lasts (rule 400.7): a `returnThen` reading what the return
// put onto the battlefield.
const ENTERS = "When Obzedat enters, target opponent loses 2 life and you gain 2 life.";
const END_STEP =
  "At the beginning of your end step, you may exile Obzedat. If you do, return it to the battlefield under its owner's control at the beginning of your next upkeep. It gains haste.";

export default defineCard({
  name: "Obzedat, Ghost Council",
  manaCost: "{1}{W}{W}{B}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Advisor"],
  power: 5,
  toughness: 5,
  text: `${ENTERS}\n${END_STEP}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 2, target: 0 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Exile Obzedat, returning it at the beginning of your next upkeep?",
        effect: {
          kind: "flicker",
          target: "source",
          returnAt: "your-next-upkeep",
          returnThen: {
            kind: "grant-keyword-all",
            filter: { thisWay: "put-onto-battlefield" },
            keyword: "haste",
            duration: "permanent",
          },
          returnText: "Return Obzedat to the battlefield under its owner's control. It gains haste.",
        },
      },
      resolve: null,
      text: END_STEP,
    },
  ],
});
