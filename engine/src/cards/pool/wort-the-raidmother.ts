import { defineCard } from "../define.js";

// A spell with conspire of its own gets a second instance from Wort, each
// asked and copying separately (the ruling; rule 702.78b).
const CONSPIRE_TEXT =
  "Each red or green instant or sorcery spell you cast has conspire. (As you cast the spell, you may tap two " +
  "untapped creatures you control that share a color with it. When you do, copy it and you may choose new " +
  "targets for the copy.)";

export default defineCard({
  name: "Wort, the Raidmother",
  manaCost: "{4}{R/G}{R/G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Shaman"],
  power: 3,
  toughness: 3,
  text: `When Wort enters, create two 1/1 red and green Goblin Warrior creature tokens.\n${CONSPIRE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Goblin Warrior Token", count: 2 },
      resolve: null,
      text: "When Wort enters, create two 1/1 red and green Goblin Warrior creature tokens.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: {
        filter: { typesAnyOf: ["instant", "sorcery"], anyOf: [{ colors: ["R"] }, { colors: ["G"] }] },
        conspire: true,
      },
      text: CONSPIRE_TEXT,
    },
  ],
});
