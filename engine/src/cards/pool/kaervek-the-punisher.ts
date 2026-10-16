import { defineCard } from "../define.js";

const CRIME_TEXT =
  "Whenever you commit a crime, exile up to one target black card from your graveyard and copy it. You may cast the copy. If you do, you lose 2 life.";

// Narset, Enlightened Exile's shape, but the copy is cast paying its costs
// (X chosen as normal — the ruling), during the resolution and not later. The
// copy is created in exile and cast from there (Aven Interrupter's tax, the
// ruling); one not cast ceases to exist, and a permanent spell's copy becomes
// a token.
export default defineCard({
  name: "Kaervek, the Punisher",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warlock"],
  power: 3,
  toughness: 3,
  text: `${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime. Copies of permanent spells become tokens.)`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { colors: ["B"] } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "cast-now",
            from: "exiled-this-way",
            copies: 1,
            then: { kind: "lose-life", amount: 2 },
          },
        ],
      },
      resolve: null,
      text: CRIME_TEXT,
    },
  ],
});
