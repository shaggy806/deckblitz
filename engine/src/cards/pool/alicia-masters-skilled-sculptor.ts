import { defineCard } from "../define.js";

// EDHREC rank 14186. Marvel Super Heroes Commander.

const TREASURE_TEXT =
  "At the beginning of combat on your turn, if you've cast a noncreature spell this turn, create a Treasure token.";
const SENSE_TEXT =
  "Sense the Good — At the beginning of your end step, each player gains control of all creatures they own.";

export default defineCard({
  name: "Alicia Masters, Skilled Sculptor",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 0,
  toughness: 4,
  text: `${TREASURE_TEXT}\n${SENSE_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "cast-this-turn", filter: { notTypes: ["creature"] } },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
      resolve: null,
      text: TREASURE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      effect: { kind: "gain-control-all", filter: { type: "creature" }, untilEndOfTurn: false, who: "owner" },
      resolve: null,
      text: SENSE_TEXT,
    },
  ],
});
