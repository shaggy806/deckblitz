import { defineCard } from "../define.js";

// EDHREC rank 29404.

const ENTER_TEXT =
  "Strange new worlds — When this creature enters, create X 1/1 red Officer creature tokens, where X is the number of differently named lands you control.";
const DIES_TEXT =
  "Whenever this creature or another creature you control dies, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Excalbian Gamemaster",
  manaCost: "{5}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Excalbian"],
  power: 6,
  toughness: 6,
  text: `${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Officer Token",
        count: { aggregate: "distinct", of: "name", filter: { type: "land", controlledBy: "you" } },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature" }, otherOnly: true },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
