import { defineCard } from "../define.js";

// Aetherdrift Commander. "Then you may pay one or more {E}": the `may`'s `costEnergyX:
// "one-or-more"`, not offered with no energy. "When you do" is a reflexive
// trigger (rule 603.12) carrying the amount paid as its X; players may
// respond to it (the ruling).
const ENTERS_TEXT =
  "When this creature enters, you get {E}{E} (two energy counters). Then you may pay one or more {E}. When you do, this creature deals that much damage to each other creature.";

export default defineCard({
  name: "Territorial Aetherkite",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Cat", "Dragon"],
  power: 6,
  toughness: 5,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "get-energy", amount: 2 },
          {
            kind: "may",
            prompt: "Pay one or more {E} to have Territorial Aetherkite deal that much damage to each other creature?",
            costEnergyX: "one-or-more",
            effect: {
              kind: "reflexive-trigger",
              targets: [],
              effect: { kind: "damage-all", filter: { type: "creature" }, amount: "x", exceptSource: true },
              text: "When you do, this creature deals that much damage to each other creature.",
            },
          },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
