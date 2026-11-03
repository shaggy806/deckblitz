import { defineCard } from "../define.js";

const COMBAT_TEXT =
  "At the beginning of combat on your turn, creatures you control with flying get +1/+1 and gain vigilance until end of turn.";
const RETURN_TEXT =
  "Whenever one or more attacking creatures you control die, you may return one of them to the battlefield tapped under its owner's control with a flying counter on it. Do this only once each turn.";
const FLIERS = { type: "creature", controlledBy: "you", keyword: "flying" } as const;

export default defineCard({
  name: "Rinoa, Angel Wing",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rebel", "Warlock"],
  power: 2,
  toughness: 4,
  text: `${COMBAT_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt-all", filter: FLIERS, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword-all", filter: FLIERS, keyword: "vigilance", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: COMBAT_TEXT,
    },
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", attacking: true }, batched: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return one of them to the battlefield tapped with a flying counter on it?",
        oncePerTurn: true,
        effect: {
          kind: "put-arrived-onto-battlefield",
          count: 1,
          enterTapped: true,
          underOwner: true,
          withCounters: { kind: "flying", amount: 1 },
        },
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
