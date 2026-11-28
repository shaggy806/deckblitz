import { defineCard } from "../define.js";

const WALK = "Forestwalk (This creature can't be blocked as long as defending player controls a Forest.)";
const STEAL =
  "{2}{G}, {T}: Unless an opponent pays {2}, gain control of target artifact for as long as this creature remains on the battlefield.";

// "Unless an opponent pays": each opponent in turn may pay, the controller
// never (`{ anyOf: "each-opponent" }`), and the control ends as Bandits
// leaves (`whileSource`, rule 611.2b).
export default defineCard({
  name: "Scarwood Bandits",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 2,
  toughness: 2,
  keywords: ["forestwalk"],
  text: `${WALK}\n${STEAL}`,
  activated: [
    {
      cost: { mana: "{2}{G}", tap: true },
      targets: ["artifact"],
      effect: {
        kind: "unless",
        chooser: { anyOf: "each-opponent" },
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: { kind: "gain-control", target: 0, untilEndOfTurn: false, whileSource: true },
      },
      resolve: null,
      text: STEAL,
    },
  ],
});
