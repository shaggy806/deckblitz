import { defineCard } from "../define.js";

const BASIC_SPHERE_LOCUS = [{ supertype: "basic" }, { subtype: "Sphere" }, { subtype: "Locus" }] as const;
const SEARCH =
  "{3}, {T}: Search your library for a basic, Sphere, or Locus land card, reveal it, put it into your hand, then shuffle.";
const BECOME =
  "{3}: This artifact becomes a 9/9 Phyrexian Construct artifact creature, loses all abilities, and gains indestructible and toxic 9. Activate only if there are nine or more lands with different names among the basic, Sphere, and Locus lands you control.";

export default defineCard({
  name: "Monument to Perfection",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${SEARCH}\n${BECOME}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", anyOf: BASIC_SPHERE_LOCUS },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: SEARCH,
    },
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "become",
            target: "source",
            power: 9,
            toughness: 9,
            setTypes: ["artifact", "creature"],
            setSubtypes: ["Phyrexian", "Construct"],
            loseAbilities: true,
            keywords: ["indestructible"],
            duration: "permanent",
          },
          {
            kind: "grant-static",
            target: "source",
            ability: { affects: { scope: "self" }, grantToxic: 9, text: "Toxic 9" },
            duration: "permanent",
          },
        ],
      },
      resolve: null,
      text: BECOME,
      condition: {
        kind: "controls",
        filter: { type: "land", anyOf: BASIC_SPHERE_LOCUS },
        atLeast: 9,
        distinctNames: true,
      },
    },
  ],
});
