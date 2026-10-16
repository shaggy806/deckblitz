import { defineCard } from "../define.js";

// EDHREC rank 9764. The discount reads the quest counters as the cost is
// determined (rule 601.2f, via 602.2b), before this enchantment is
// sacrificed to pay it. The creature card may come from any graveyard.
const LANDFALL_TEXT = "Landfall — Whenever a land you control enters, put a quest counter on this enchantment.";
const REANIMATE_TEXT =
  "{5}{B}, Sacrifice this enchantment: Put target creature card from a graveyard onto the battlefield under your control. This ability costs {1} less to activate for each quest counter on this enchantment. Activate only as a sorcery.";

export default defineCard({
  name: "Quest for the Necropolis",
  manaCost: "{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: `${LANDFALL_TEXT}\n${REANIMATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "quest", amount: 1 },
      resolve: null,
      text: LANDFALL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{5}{B}", tap: false, sacrifice: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "any", filter: { type: "creature" } }],
      effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      costReduction: { reduceGeneric: { countersOnSource: "quest" } },
      sorcerySpeed: true,
      resolve: null,
      text: REANIMATE_TEXT,
    },
  ],
});
