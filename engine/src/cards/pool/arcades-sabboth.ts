import { defineCard } from "../define.js";

// Legends. EDHREC rank 24176.
//
// Rulings:
//   As long as Arcades Sabboth is untapped and isn't attacking, it gets +0/+2 from its own
//   third ability.
const UPKEEP_TEXT = "At the beginning of your upkeep, sacrifice Arcades Sabboth unless you pay {G}{W}{U}.";
const ANTHEM_TEXT = "Each untapped creature you control gets +0/+2 as long as it's not attacking.";
const PUMP_TEXT = "{W}: Arcades Sabboth gets +0/+1 until end of turn.";

export default defineCard({
  name: "Arcades Sabboth",
  manaCost: "{2}{G}{G}{W}{W}{U}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: `Flying\n${UPKEEP_TEXT}\n${ANTHEM_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", tapped: false, attacking: false },
      },
      grantPt: [0, 2],
      text: ANTHEM_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 0, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "you",
        options: [{ pay: "{G}{W}{U}", text: "Pay {G}{W}{U}" }],
        otherwise: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
