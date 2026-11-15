import { defineCard } from "../define.js";

// EDHREC rank 24158.

const TEXT =
  "{T}: Target opponent whose turn it is may cast a spell from their hand without paying its mana cost. If they do, you copy that spell. You may choose new targets for the copy. If they don't, you draw a card.";

// The opponent casts it, from their own hand, as this resolves; the copy is
// yours (rule 707.10), whoever's the spell is.
export default defineCard({
  name: "Cmdr. Troi, Outgoing Empath",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Betazoid", "Human", "Advisor"],
  power: 3,
  toughness: 3,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["opponent-whose-turn-it-is"],
      effect: {
        kind: "cast-now",
        by: { target: 0 },
        from: { handOf: { target: 0 } },
        free: true,
        then: { kind: "copy-all", what: "spells", of: { thisWay: "cast" }, newTargets: true },
        else: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
