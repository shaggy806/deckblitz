import { defineCard } from "../define.js";

// "The next noncreature spell you cast this turn has cascade": a `next`
// `grant-spells-this-turn` — the first noncreature spell cast after it
// resolves uses it up as it becomes cast (rule 601.2i), and its cascade is
// that spell's own, so "costs less" reads that spell's mana value
// (rule 702.85a).

const CASCADE = {
  trigger: { on: "this-cast" },
  targets: [],
  effect: { kind: "cascade" },
  resolve: null,
  text: "Cascade",
} as const;

const TEXT =
  "Gift of Chaos — {3}, {T}: The next noncreature spell you cast this turn has cascade. (When you cast that spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)";

export default defineCard({
  name: "Dark Apostle",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Astartes", "Warlock"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "grant-spells-this-turn",
        next: true,
        filter: { notTypes: ["creature"] },
        triggered: [CASCADE],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
