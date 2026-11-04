import { defineCard } from "../define.js";

// Its own upkeep shield counter fires the second ability, as does any other
// counter you put on a creature you don't control.
const UPKEEP_TEXT = "At the beginning of your upkeep, put a shield counter on target creature an opponent controls.";
const COUNTERS_TEXT =
  "Whenever you put one or more counters on a creature you don't control, tap that creature and goad it. It gains trample until your next turn. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)";

export default defineCard({
  name: "Kros, Defense Contractor",
  manaCost: "{1}{G}{W}{U}",
  colors: ["G", "W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Advisor"],
  power: 2,
  toughness: 4,
  text: `${UPKEEP_TEXT}\n${COUNTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "counters-put", who: "any", filter: { type: "creature", controlledBy: "opponent" }, byYou: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: "trigger-object" },
          { kind: "goad", target: "trigger-object" },
          { kind: "grant-keyword", target: "trigger-object", keyword: "trample", duration: "until-your-next-turn" },
        ],
      },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
});
