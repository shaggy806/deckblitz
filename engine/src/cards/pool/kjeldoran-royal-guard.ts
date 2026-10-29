import { defineCard } from "../define.js";

// Ruling: with the Guard gone before combat damage, nothing is redirected —
// you take it as normal (rule 614.9).

const TEXT =
  "{T}: All combat damage that would be dealt to you by unblocked creatures this turn is dealt to this creature instead.";

export default defineCard({
  name: "Kjeldoran Royal Guard",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 5,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "damage-rule",
        to: { players: "you" },
        by: { filter: { type: "creature", unblocked: true } },
        combat: true,
        redirectTo: "source",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
