import { defineCard } from "../define.js";

// "Put into your graveyard": only its owner's graveyard is "yours", so under
// another player's control it goes to its owner's and doesn't trigger (the
// ruling) — `ownedBy: "you"`, read for the ability's controller. Removed from
// the graveyard in response, it stays where it went (rule 400.7); with fewer
// than three cards in the library it goes to the bottom.
const LIBRARY_TEXT =
  "When this creature is put into your graveyard from the battlefield, put it into your library third from the top.";

export default defineCard({
  name: "Enigma Sphinx",
  manaCost: "{4}{W}{U}{B}",
  colors: ["W", "U", "B"],
  types: ["artifact", "creature"],
  subtypes: ["Sphinx"],
  power: 5,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${LIBRARY_TEXT}\nCascade (When you cast this spell, exile cards from the top of your library until you exile a nonland card that costs less. You may cast it without paying its mana cost. Put the exiled cards on the bottom in a random order.)`,
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self", to: ["graveyard"], filter: { ownedBy: "you" } },
      targets: [],
      effect: { kind: "put-on-library", target: "trigger-object", position: { fromTop: 3 } },
      resolve: null,
      text: LIBRARY_TEXT,
    },
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "cascade" },
      resolve: null,
      text: "Cascade",
    },
  ],
});
