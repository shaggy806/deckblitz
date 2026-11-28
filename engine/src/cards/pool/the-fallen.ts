import { defineCard } from "../define.js";

// EDHREC rank 29328. One damage event (Kumano Faces Kakkazan's
// simultaneous sequence): the opponents and the planeswalkers this object
// has dealt damage to this game, each in the stint it was dealt it (rule
// 400.7 — the journal's whole-game record).

const UPKEEP_TEXT =
  "At the beginning of your upkeep, this creature deals 1 damage to each opponent and planeswalker it has dealt damage to this game.";

export default defineCard({
  name: "The Fallen",
  manaCost: "{1}{B}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  text: UPKEEP_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "damage", amount: 1, who: "opponents-dealt-damage-by-source-this-game" },
          { kind: "damage-all", filter: { type: "planeswalker", damagedThisGameBySource: true }, amount: 1 },
        ],
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
