import { defineCard } from "../define.js";

// Phyrexia: All Will Be One (ONE). EDHREC rank 11983.
//
// A mana ability that reads what its own cost sacrificed (`{ paid:
// "sacrificed" }`, the artifact as it last existed — Priest of Yawgmoth's), its
// mana spendable only on artifact spells and artifacts' abilities.

const TEXT =
  "{T}, Sacrifice an artifact: Add an amount of {R} equal to the sacrificed artifact's mana value. Spend this mana only to cast artifact spells or activate abilities of artifacts.";

export default defineCard({
  name: "Slobad, Iron Goblin",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Goblin", "Artificer"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: { filter: { type: "artifact" } } },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "R",
        amount: { manaValueOf: { paid: "sacrificed" } },
        spendOnly: {
          spell: { type: "artifact" },
          abilityOf: { type: "artifact" },
          text: "Spend this mana only to cast artifact spells or activate abilities of artifacts.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
