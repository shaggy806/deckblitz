import { defineCard } from "../define.js";

// EDHREC rank 17790. The enters trigger sets up a delayed "whenever" for the
// rest of the turn (rule 603.7c); it belongs to no permanent, so it keeps
// working if the Seaweed leaves, the damage then dealt by the Seaweed as it
// last existed.
const ENTER_TEXT =
  "When this creature enters, until end of turn, whenever another creature dies, this creature deals 1 damage to each non-Wall creature.";
const PING_TEXT = "{T}: This creature deals 1 damage to any target.";

export default defineCard({
  name: "Electric Seaweed",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Plant", "Wall"],
  power: 0,
  toughness: 4,
  keywords: ["defender", "haste"],
  text: `Defender, haste\n${ENTER_TEXT}\n${PING_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "dies", who: "any", filter: { type: "creature" }, otherOnly: true },
          until: "end-of-turn",
        },
        effect: { kind: "damage-all", filter: { type: "creature", notSubtypes: ["Wall"] }, amount: 1 },
        text: "Whenever another creature dies this turn, this creature deals 1 damage to each non-Wall creature.",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING_TEXT,
    },
  ],
});
