import { defineCard } from "../define.js";

const CONVOKE =
  "The first historic spell you cast each turn has convoke. (Your creatures can help cast it. Each creature you tap while casting it pays for {1} or one mana of that creature's color.)";

export default defineCard({
  name: "Peri Brown",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human"],
  power: 2,
  toughness: 3,
  pairing: { kind: "doctors-companion" },
  text: `${CONVOKE}\nDoctor's companion (You can have two commanders if the other is the Doctor.)`,
  static: [
    {
      affects: { scope: "self" },
      // Historic: artifact, legendary, or Saga (rule 700.6).
      grantsToSpells: {
        firstEachTurn: true,
        filter: { anyOf: [{ type: "artifact" }, { supertype: "legendary" }, { subtype: "Saga" }] },
        convoke: true,
      },
      text: CONVOKE,
    },
  ],
});
