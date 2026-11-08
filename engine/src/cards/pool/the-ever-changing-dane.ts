import { defineCard } from "../define.js";

// As the sacrificed creature last existed (rule 608.2h): a token's original values,
// though this doesn't become a token, and no counters (the rulings). Copiable, the
// ability goes with the copy (rule 707.9a), so it can do it again.
const TEXT = "{1}, Sacrifice another creature: The Ever-Changing 'Dane becomes a copy of the sacrificed creature, except it has this ability.";

export default defineCard({
  name: "The Ever-Changing 'Dane",
  manaCost: "{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}", tap: false, sacrifice: { filter: { type: "creature", isSource: false } } },
      targets: [],
      effect: {
        kind: "become-copy",
        target: "source",
        of: { paid: "sacrificed" },
        exceptions: { thisAbility: { card: "The Ever-Changing 'Dane", activated: 0 } },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
