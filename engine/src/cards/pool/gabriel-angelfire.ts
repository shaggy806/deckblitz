import type { ModeOption } from "../../effects.js";
import { defineCard } from "../define.js";

// The choice is made as the ability resolves (no "choose one" bullets), and a
// new upkeep's choice comes after the last one has ended.
const TEXT =
  "At the beginning of your upkeep, choose flying, first strike, trample, or rampage 3. Gabriel Angelfire gains that ability until your next upkeep. (Whenever a creature with rampage 3 becomes blocked, it gets +3/+3 until end of turn for each creature blocking it beyond the first.)";

const beyondTheFirst = { product: [3, { difference: [{ blockersOf: "source" }, 1] }] } as const;

const MODES: readonly ModeOption[] = [
  {
    text: "Flying",
    effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "until-your-next-upkeep" },
  },
  {
    text: "First strike",
    effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "until-your-next-upkeep" },
  },
  {
    text: "Trample",
    effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "until-your-next-upkeep" },
  },
  {
    text: "Rampage 3",
    effect: {
      kind: "grant-triggered",
      target: "source",
      duration: "until-your-next-upkeep",
      ability: {
        trigger: { on: "becomes-blocked", who: "self" },
        targets: [],
        effect: { kind: "modify-pt", target: "source", power: beyondTheFirst, toughness: beyondTheFirst, duration: "end-of-turn" },
        resolve: null,
        text: "Rampage 3",
      },
    },
  },
];

export default defineCard({
  name: "Gabriel Angelfire",
  manaCost: "{3}{G}{G}{W}{W}",
  colors: ["G", "W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "modal", minModes: 1, maxModes: 1, modes: MODES },
      resolve: null,
      text: TEXT,
    },
  ],
});
