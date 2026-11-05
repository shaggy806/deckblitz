import { defineCard } from "../define.js";

const ENTER_TEXT =
  "Whenever this creature enters or transforms into Huntmaster of the Fells, create a 2/2 green Wolf creature token and you gain 2 life.";
const UPKEEP_TEXT = "At the beginning of each upkeep, if no spells were cast last turn, transform this creature.";
const effect = {
  kind: "sequence",
  effects: [
    { kind: "create-token", token: "Wolf Token", count: 1 },
    { kind: "gain-life", amount: 2 },
  ],
} as const;

export default defineCard({
  name: "Huntmaster of the Fells",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Human", "Werewolf"],
  power: 2,
  toughness: 2,
  text: `${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect, resolve: null, text: ENTER_TEXT },
    {
      trigger: { on: "transforms", who: "self", intoFront: true },
      sameAbilityAs: 0,
      targets: [],
      effect,
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      condition: { kind: "spells-cast-last-turn", none: true },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  faces: ["Huntmaster of the Fells", "Ravager of the Fells"],
  transform: true,
});
