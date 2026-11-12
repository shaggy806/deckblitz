import { defineCard } from "../define.js";

// EDHREC rank 10320. The mana ability's counter rides on `also` (Vulshok
// Factory); the big ability's reduction counts the pressure counters as it's
// activated.

const MANA_TEXT = "{T}: Add one mana of any color. Put a pressure counter on this artifact.";
const BLAST_TEXT =
  "{8}, {T}, Sacrifice this artifact: It deals 20 damage to target creature. This ability costs {1} less to activate for each pressure counter on this artifact. Activate only as a sorcery.";

export default defineCard({
  name: "Exploding Barrel",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${MANA_TEXT}\n${BLAST_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "add-mana",
        mana: "any-color",
        amount: 1,
        also: { kind: "add-counter", target: "source", counter: "pressure", amount: 1 },
      },
      resolve: null,
      text: MANA_TEXT,
    },
    {
      cost: { mana: "{8}", tap: true, sacrifice: "self" },
      costReduction: { reduceGeneric: { countersOn: "source", counter: "pressure" } },
      targets: ["creature"],
      effect: { kind: "damage", amount: 20, target: 0 },
      resolve: null,
      text: BLAST_TEXT,
      sorcerySpeed: true,
    },
  ],
});
