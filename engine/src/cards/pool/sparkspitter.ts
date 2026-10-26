import { defineCard } from "../define.js";

// EDHREC rank 25968.

const MAKE_TEXT =
  '{R}, {T}, Discard a card: Create a 3/1 red Elemental creature token named Spark Elemental. It has trample, haste, and "At the beginning of the end step, sacrifice this token."';

export default defineCard({
  name: "Sparkspitter",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Spellshaper"],
  power: 1,
  toughness: 3,
  text: MAKE_TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "create-token", token: "Spark Elemental Token", count: 1 },
      resolve: null,
      text: MAKE_TEXT,
    },
  ],
});
