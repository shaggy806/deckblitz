import { defineCard } from "../define.js";

// Party (rule 700.8): its power is a CDA over the party, counted in every
// zone (604.3) — and it counts itself, a Cleric, on the battlefield. "If you
// have a full party" is an intervening if (603.4).
export default defineCard({
  name: "Archpriest of Iona",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 0,
  toughness: 2,
  text: "Archpriest of Iona's power is equal to the number of creatures in your party. (Your party consists of up to one each of Cleric, Rogue, Warrior, and Wizard.)\nAt the beginning of combat on your turn, if you have a full party, target creature gets +1/+1 and gains flying until end of turn.",
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      condition: { kind: "full-party" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: "At the beginning of combat on your turn, if you have a full party, target creature gets +1/+1 and gains flying until end of turn.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      setBasePtFromCount: { countOf: { partySize: "you" }, plusPower: 0, plusToughness: 0, only: "power" },
      text: "Archpriest of Iona's power is equal to the number of creatures in your party.",
    },
  ],
});
