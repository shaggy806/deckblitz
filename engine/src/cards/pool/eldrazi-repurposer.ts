import { defineCard } from "../define.js";

// EDHREC rank 9492. One ability with two trigger events, written as two
// entries: the cast trigger resolves before the spell does, and still makes
// its Spawn if the spell is countered in response (the ruling).
const TEXT =
  'When you cast this spell and when this creature dies, create a 0/1 colorless Eldrazi Spawn creature token with "Sacrifice this token: Add {C}."';

export default defineCard({
  name: "Eldrazi Repurposer",
  manaCost: "{2}{G}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Drone"],
  power: 3,
  toughness: 3,
  text: `Devoid (This card has no color.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
