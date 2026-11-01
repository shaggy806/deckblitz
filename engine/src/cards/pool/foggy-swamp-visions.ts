import { defineCard } from "../define.js";

// Only the cards this resolution actually exiled are copied, each entering under
// the caster's control whoever's graveyard it came from; those tokens are
// sacrificed at the caster's own next end step, whoever's turn this is cast on.
const TEXT =
  "Exile X target creature cards from graveyards. For each creature card exiled this way, create a token that's a copy of it. At the beginning of your next end step, sacrifice those tokens.";

export default defineCard({
  name: "Foggy Swamp Visions",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "As an additional cost to cast this spell, waterbend {X}. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)\n" +
    TEXT,
  additionalCost: { waterbend: "x" },
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "for-each-target",
        from: 0,
        simultaneous: true,
        effect: { kind: "exile", target: 0 },
      },
      {
        kind: "create-token-copy",
        of: "exiled-this-way",
        count: 1,
        sacrificeAtEndStep: true,
        atYourNextEndStep: true,
      },
    ],
  },
});
