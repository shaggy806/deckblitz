import { defineCard } from "../define.js";

const TEXT =
  "Artifact spells you cast have replicate {2}{U}. (Whenever you cast an artifact spell, copy it for each time you paid its replicate cost. Each copy becomes a token.)";

export default defineCard({
  name: "Hugh, First of Many",
  manaCost: "{1}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 3,
  toughness: 4,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { type: "artifact" }, keywordValues: [{ keyword: "replicate", cost: "{2}{U}" }] },
      text: TEXT,
    },
  ],
});
