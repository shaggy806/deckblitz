import { defineCard } from "../define.js";

// Its own cascade is a `this-cast` trigger (Bloodbraid Elf's shape); the
// granted one is Wildsear, Scouring Maw's — a `this-cast` trigger on each
// instant or sorcery spell cast from the hand, so it fires as the spell is
// cast and Quandrix leaving afterwards doesn't stop it.
const CASCADE = {
  trigger: { on: "this-cast" },
  targets: [],
  effect: { kind: "cascade" },
  resolve: null,
  text: "Cascade",
} as const;
const CASCADE_TEXT =
  "Cascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)";
const GRANT_TEXT = "Instant and sorcery spells you cast from your hand have cascade.";

export default defineCard({
  name: "Quandrix, the Proof",
  manaCost: "{4}{G}{U}",
  colors: ["G", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${CASCADE_TEXT}\n${GRANT_TEXT}`,
  triggered: [CASCADE],
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: {
        filter: { typesAnyOf: ["instant", "sorcery"] },
        castFrom: ["hand"],
        triggered: [CASCADE],
      },
      text: GRANT_TEXT,
    },
  ],
});
