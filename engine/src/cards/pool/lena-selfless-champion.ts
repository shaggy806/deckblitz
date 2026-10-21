import { defineCard } from "../define.js";

// EDHREC rank 8656.
//
// Rulings:
//   The nontoken creatures are counted as the first ability resolves (Lena
//   counts herself if she's still there). The last ability uses Lena's power
//   as she last existed on the battlefield, and affects only the creatures
//   you control with lesser power as it resolves.

const ETB_TEXT = "When Lena enters, create a 1/1 white Soldier creature token for each nontoken creature you control.";
const SAC_TEXT = "Sacrifice Lena: Creatures you control with power less than Lena's power gain indestructible until end of turn.";

export default defineCard({
  name: "Lena, Selfless Champion",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 3,
  toughness: 3,
  text: `${ETB_TEXT}\n${SAC_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "create-token",
        token: "Soldier Token",
        count: { countOf: { type: "creature", controlledBy: "you", token: false } },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", power: { op: "lt", n: { amount: { powerOf: "source" } } } },
        keyword: "indestructible",
        duration: "end-of-turn",
      },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
