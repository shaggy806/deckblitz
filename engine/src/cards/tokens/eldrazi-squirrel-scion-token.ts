import { defineCard } from "../define.js";

/** 1/1 green Eldrazi Squirrel Scion with "Sacrifice this creature: Add {G} or
 * {B}" — Emrakul and Chatterfang's tokens (no token printing). */
export default defineCard({
  name: "Eldrazi Squirrel Scion Token",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Squirrel", "Scion"],
  power: 1,
  toughness: 1,
  text: "Sacrifice this creature: Add {G} or {B}.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "add-mana", mana: { oneOf: ["G", "B"] }, amount: 1 },
      resolve: null,
      text: "Sacrifice this creature: Add {G} or {B}.",
    },
  ],
});
