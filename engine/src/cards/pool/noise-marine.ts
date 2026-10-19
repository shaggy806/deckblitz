import { defineCard } from "../define.js";

// EDHREC rank 7979.
//
// The spells you've cast this turn are counted as the trigger resolves — the
// cascaded spell resolved first, so it counts (the ruling), and Noise Marine
// itself does too.
const BLASTER_TEXT =
  "Sonic Blaster — When this creature enters, it deals damage equal to the number of spells you've cast this turn to any target.";

export default defineCard({
  name: "Noise Marine",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Astartes", "Warrior"],
  power: 3,
  toughness: 2,
  text: `Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)\n${BLASTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: { turnStat: "spells-cast" }, target: 0 },
      resolve: null,
      text: BLASTER_TEXT,
    },
  ],
});
