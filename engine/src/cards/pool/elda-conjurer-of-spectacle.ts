import { defineCard } from "../define.js";
import { demonstrate } from "../helpers.js";

// Mystery Booster Commander. The Twelfth Doctor's granted demonstrate, its
// filter "nonlegendary creature spell": `firstEachTurn` counts only the spells
// that match it, so a legendary creature or a noncreature spell cast first
// doesn't use the grant up.
const TEXT =
  "The first nonlegendary creature spell you cast each turn has demonstrate. (When you cast that spell, you may copy it. If you do, choose an opponent to also copy it. Each copy becomes a token.)";

export default defineCard({
  name: "Elda, Conjurer of Spectacle",
  manaCost: "{2}{G}{W}",
  colors: ["G", "W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: {
        filter: { type: "creature", notSupertype: "legendary" },
        firstEachTurn: true,
        triggered: [demonstrate()],
      },
      text: TEXT,
    },
  ],
});
