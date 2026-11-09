import { defineCard } from "../define.js";

const SCIENCE =
  "Science Teacher \u2014 Each Saga spell you cast has replicate. The replicate cost is equal to its mana cost. (When you cast that Saga, copy it for each time you paid its replicate cost. Copies of Saga spells become tokens.)";

export default defineCard({
  name: "Ian Chesterton",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Scientist"],
  power: 2,
  toughness: 3,
  pairing: { kind: "doctors-companion" },
  text: `${SCIENCE}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { subtype: "Saga" }, keywordValues: [{ keyword: "replicate", cost: "mana-cost" }] },
      text: SCIENCE,
    },
  ],
});
