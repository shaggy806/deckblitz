import { defineCard } from "../define.js";

// EDHREC rank 9325.
//
// "They gain trample" is every creature token you control as the ability
// resolves — the same set the counters went on, and still the set when a
// counter couldn't be put on one (the ruling).
const ENTERS_TEXT = "When this creature enters, create a 3/3 colorless Golem artifact creature token.";
const PUMP_TEXT = "{2}, {T}: Put a +1/+1 counter on each creature token you control. They gain trample until end of turn.";
const TOKENS = { type: "creature", token: true, controlledBy: "you" } as const;

export default defineCard({
  name: "Sandstorm Salvager",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 1,
  toughness: 1,
  text: `${ENTERS_TEXT}\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Golem Token", count: 1 },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: TOKENS, counter: "+1/+1", amount: 1 },
          { kind: "grant-keyword-all", filter: TOKENS, keyword: "trample", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
