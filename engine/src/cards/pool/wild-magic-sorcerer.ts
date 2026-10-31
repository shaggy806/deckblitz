import { defineCard } from "../define.js";

// "The first spell you cast from exile each turn has cascade": a
// `grantsToSpells` cascade with `firstEachTurn`, the spell's `castFrom`
// asked through the filter so that spells cast from elsewhere earlier this
// turn don't count against it (each record is read as it was cast).

const CASCADE = {
  trigger: { on: "this-cast" },
  targets: [],
  effect: { kind: "cascade" },
  resolve: null,
  text: "Cascade",
} as const;

const TEXT =
  "The first spell you cast from exile each turn has cascade. (When you cast your first spell from exile, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)";

export default defineCard({
  name: "Wild-Magic Sorcerer",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Orc", "Shaman", "Sorcerer"],
  power: 4,
  toughness: 3,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { castFrom: "exile" }, firstEachTurn: true, triggered: [CASCADE] },
      text: "The first spell you cast from exile each turn has cascade.",
    },
  ],
});
