import { defineCard } from "../define.js";

// "The first spell you cast each turn that mana from a Treasure was spent to
// cast has cascade": a `grantsToSpells` cascade with `firstEachTurn` over a
// `manaFrom` filter — the spells cast earlier this turn are each read as
// they were cast, so only one paid for with Treasure mana uses it up.

const CASCADE = {
  trigger: { on: "this-cast" },
  targets: [],
  effect: { kind: "cascade" },
  resolve: null,
  text: "Cascade",
} as const;

const GRANT_TEXT =
  "The first spell you cast each turn that mana from a Treasure was spent to cast has cascade. (When you cast the spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)";

export default defineCard({
  name: "Rain of Riches",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: `When this enchantment enters, create two Treasure tokens.\n${GRANT_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 2 },
      resolve: null,
      text: "When this enchantment enters, create two Treasure tokens.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { manaFrom: { subtype: "Treasure" } }, firstEachTurn: true, triggered: [CASCADE] },
      text: "The first spell you cast each turn that mana from a Treasure was spent to cast has cascade.",
    },
  ],
});
