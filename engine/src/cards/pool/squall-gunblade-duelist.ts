import { defineCard } from "../define.js";

// EDHREC rank 16792.
//
// "Choose a number" has no upper bound (rule 107.1c), asked as a number
// (`chooseNumberOnEnter`). The attack trigger fires once for each opponent
// attacked (rule 508.3d), whoever's creatures attack them, "those creatures"
// being the ones attacking that player (`"trigger-batch"`); the
// intervening-if (rule 603.4) is asked of them as it triggers and again as it
// resolves, each read as it is then.

const CHOOSE_TEXT = "As Squall enters, choose a number.";
const TRIGGER_TEXT =
  "Whenever one or more creatures attack one of your opponents, if any of those creatures have power or toughness equal to the chosen number, Squall deals damage equal to its power to defending player.";

const CHOSEN = { op: "eq", n: { amount: { chosenNumber: true } } } as const;

export default defineCard({
  name: "Squall, Gunblade Duelist",
  manaCost: "{R}{W}{B}",
  colors: ["R", "W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Mercenary"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${CHOOSE_TEXT}\n${TRIGGER_TEXT}`,
  chooseNumberOnEnter: true,
  triggered: [
    {
      trigger: { on: "attacks-player", who: "any", defender: "opponent" },
      condition: {
        kind: "amounts",
        left: { aggregate: "count", filter: { anyOf: [{ power: CHOSEN }, { toughness: CHOSEN }] }, in: "trigger-batch" },
        op: "gte",
        right: 1,
      },
      targets: [],
      effect: { kind: "damage", who: "trigger-player", amount: { powerOf: "source" } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
