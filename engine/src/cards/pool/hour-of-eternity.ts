import { defineCard } from "../define.js";

// Exactly X targets, X chosen first (rule 601.2b–c — Curse of the Swine's
// `min`/`max: "x"`). Each legal one is exiled and copied, as one instruction:
// the cards leave the graveyard together and the tokens enter together. The
// copies are The Scarab God's "4/4 black Zombie" — Zombie instead of their other
// creature types — and keep their mana cost (its ruling). A card that's an
// illegal target by then isn't exiled and makes no token.
export default defineCard({
  name: "Hour of Eternity",
  manaCost: "{X}{X}{U}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Exile X target creature cards from your graveyard. For each card exiled this way, create a token that's a copy of that card, except it's a 4/4 black Zombie.",
  targets: [
    {
      kind: "any-number",
      of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } },
      min: "x",
      max: "x",
    },
  ],
  effect: {
    kind: "for-each-target",
    from: 0,
    simultaneous: true,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "exile", target: 0 },
        {
          kind: "create-token-copy",
          of: 0,
          count: 1,
          who: "you",
          exceptions: { basePt: [4, 4], setColors: ["B"], setSubtypes: ["Zombie"] },
        },
      ],
    },
  },
});
