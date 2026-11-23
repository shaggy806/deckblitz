import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Devoid: no colors. "Protection from
// non-Squirrels": from everything that isn't a Squirrel (rule 702.16).

const CAST_TEXT =
  'When you cast Emrakul and Chatterfang, create 15 1/1 green Eldrazi Squirrel Scion creature tokens with "Sacrifice this creature: Add {G} or {B}".';

export default defineCard({
  name: "Emrakul and Chatterfang",
  manaCost: "{8}{G}{G}{G}",
  colors: [],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Eldrazi", "Squirrel"],
  power: 15,
  toughness: 15,
  keywords: ["flying", "trample", "forestwalk"],
  text: `Devoid (This card has no color.)\nFlying, Trample, Forestwalk, protection from non-Squirrels\n${CAST_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { notSubtypes: ["Squirrel"] } },
      text: "protection from non-Squirrels",
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "create-token", token: "Eldrazi Squirrel Scion Token", count: 15 },
      resolve: null,
      text: CAST_TEXT,
    },
  ],
});
