import { defineCard } from "../define.js";

// EDHREC rank 12280. Fallout (PIP).
//
// "Enters or attacks" is two triggers. "A token you control leaves the
// battlefield" fires once per token (a token stack leaving counts each one).
const JUNK_TEXT =
  "Whenever this creature enters or attacks, you lose 1 life and create a Junk token. (It's an artifact with \"{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.\")";
const JUNK_ABILITY = "Whenever this creature enters or attacks, you lose 1 life and create a Junk token.";
const LEAVE_TEXT = "Whenever a token you control leaves the battlefield, put a +1/+1 counter on this creature.";
const JUNK = {
  kind: "sequence",
  effects: [
    { kind: "lose-life", amount: 1 },
    { kind: "create-token", token: "Junk Token", count: 1 },
  ],
} as const;

export default defineCard({
  name: "Boomer Scrapper",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 1,
  toughness: 1,
  text: `${JUNK_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: JUNK,
      resolve: null,
      text: JUNK_ABILITY,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: JUNK,
      resolve: null,
      text: JUNK_ABILITY,
    },
    {
      trigger: { on: "leaves-battlefield", who: "you-control", filter: { token: true } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
