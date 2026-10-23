import { defineCard } from "../define.js";

const TEXT = "Whenever this creature attacks or blocks, sacrifice another creature or land.";
// Its ruling: with no other creature or land, nothing happens.
const SACRIFICE = {
  kind: "sacrifice",
  who: "you",
  filter: { typesAnyOf: ["creature", "land"] },
  count: 1,
  exceptSource: true,
} as const;

export default defineCard({
  name: "Morkrut Necropod",
  manaCost: "{5}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Slug", "Horror"],
  power: 7,
  toughness: 7,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${TEXT}`,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: SACRIFICE, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: SACRIFICE, resolve: null, text: TEXT },
  ],
});
