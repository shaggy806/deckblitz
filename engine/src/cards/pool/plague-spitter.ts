import { defineCard } from "../define.js";

const UPKEEP_TEXT = "At the beginning of your upkeep, this creature deals 1 damage to each creature and each player.";
const DIES_TEXT = "When this creature dies, it deals 1 damage to each creature and each player.";

const PING = {
  kind: "sequence",
  simultaneous: true,
  effects: [
    { kind: "damage-all", filter: { type: "creature" }, amount: 1 },
    { kind: "damage", amount: 1, who: "each-player" },
  ],
} as const;

export default defineCard({
  name: "Plague Spitter",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 2,
  toughness: 2,
  text: `${UPKEEP_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: PING,
      resolve: null,
      text: UPKEEP_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: PING,
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
