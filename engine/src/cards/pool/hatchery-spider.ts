import { defineCard } from "../define.js";

// EDHREC rank 11797.
//
// A cast trigger: it resolves before the spell, even if the spell is
// countered (the ruling). X — the creature cards in your graveyard (tokens
// aren't cards) — is read as it resolves. "Green permanent card": a land
// that makes green mana is colourless, so it never qualifies.
const UNDERGROWTH_TEXT =
  "Undergrowth — When you cast this spell, reveal the top X cards of your library, where X is the number of creature cards in your graveyard. You may put a green permanent card with mana value X or less from among them onto the battlefield. Put the rest on the bottom of your library in a random order.";

const X = { countInGraveyard: { type: "creature", ownedBy: "you" } } as const;

export default defineCard({
  name: "Hatchery Spider",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spider"],
  power: 5,
  toughness: 7,
  keywords: ["reach"],
  text: `Reach\n${UNDERGROWTH_TEXT}`,
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: X,
        reveal: true,
        min: 0,
        max: 1,
        filter: {
          colors: ["G"],
          typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"],
          manaValue: { op: "lte", n: { amount: X } },
        },
        destination: "battlefield",
        leftover: "bottom-random",
      },
      resolve: null,
      text: UNDERGROWTH_TEXT,
    },
  ],
});
