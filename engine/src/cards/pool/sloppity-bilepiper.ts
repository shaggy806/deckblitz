import { defineCard } from "../define.js";

// "The next creature spell you cast this turn has cascade" — Dark Apostle's
// `next` grant, for creature spells.

const CASCADE = {
  trigger: { on: "this-cast" },
  targets: [],
  effect: { kind: "cascade" },
  resolve: null,
  text: "Cascade",
} as const;

const TEXT =
  "Jolly Gutpipes — {2}, {T}, Sacrifice a creature: The next creature spell you cast this turn has cascade. (When you next cast a creature spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)";

export default defineCard({
  name: "Sloppity Bilepiper",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true, sacrifice: { filter: { type: "creature" } } },
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        filter: { type: "creature" },
        triggered: [CASCADE],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
