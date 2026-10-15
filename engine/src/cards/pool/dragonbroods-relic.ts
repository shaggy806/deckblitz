import { defineCard } from "../define.js";

// EDHREC rank 20554.
// Makes Reliquary Dragon → "Reliquary Dragon" (a 4/4 Dragon token that's all
// colors, keyed by its name like Cadet).
//
// The mana ability's "tap an untapped creature you control" is Holdout
// Settlement's `tapOthers` cost (activated by hand; AUTHORING §15).

const MANA_TEXT = "{T}, Tap an untapped creature you control: Add one mana of any color.";
const DRAGON_TEXT =
  "{3}{W}{U}{B}{R}{G}, Sacrifice this artifact: Create a 4/4 Dragon creature token named Reliquary Dragon that's all colors. It has flying, lifelink, and \"When this token enters, it deals 3 damage to any target.\" Activate only as a sorcery.";

export default defineCard({
  name: "Dragonbroods' Relic",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${DRAGON_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, tapOthers: { count: 1, filter: { type: "creature", controlledBy: "you" } } },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{3}{W}{U}{B}{R}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Reliquary Dragon", count: 1 },
      resolve: null,
      text: DRAGON_TEXT,
      sorcerySpeed: true,
    },
  ],
});
