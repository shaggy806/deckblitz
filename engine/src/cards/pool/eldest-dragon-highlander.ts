import { defineCard } from "../define.js";

const RAMPAGE_TEXT =
  "Rampage 2 (Whenever this creature becomes blocked, it gets +2/+2 until end of turn for each creature blocking it beyond the first.)";
const PUMP_TEXT = "{W}{U}{B}{R}{G}: Elder Dragons you control get +7/+7 until end of turn.";
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice Eldest Dragon Highlander unless you pay {W}{U}{B}{R}{G}.";

export default defineCard({
  name: "Eldest Dragon Highlander",
  manaCost: "{W}{W}{U}{U}{B}{B}{R}{R}{G}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying", "trample"],
  text: `Flying, trample, rampage 2\n${PUMP_TEXT}\n${UPKEEP_TEXT}`,
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        // An Elder Dragon: both creature types.
        filter: { type: "creature", subtype: "Elder", subtypes: ["Dragon"], controlledBy: "you" },
        power: 7,
        toughness: 7,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { product: [2, { difference: [{ blockersOf: "source" }, 1] }] },
        toughness: { product: [2, { difference: [{ blockersOf: "source" }, 1] }] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: RAMPAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{W}{U}{B}{R}{G}", text: "Pay {W}{U}{B}{R}{G}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
