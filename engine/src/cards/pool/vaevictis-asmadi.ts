import { defineCard } from "../define.js";

// EDHREC rank 24103.

export default defineCard({
  name: "Vaevictis Asmadi",
  manaCost: "{2}{B}{B}{R}{R}{G}{G}",
  colors: ["B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "Dragon"],
  power: 7,
  toughness: 7,
  keywords: ["flying"],
  text: "Flying\nAt the beginning of your upkeep, sacrifice Vaevictis Asmadi unless you pay {B}{R}{G}.\n{B}: Vaevictis Asmadi gets +1/+0 until end of turn.\n{R}: Vaevictis Asmadi gets +1/+0 until end of turn.\n{G}: Vaevictis Asmadi gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{B}: Vaevictis Asmadi gets +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: Vaevictis Asmadi gets +1/+0 until end of turn.",
    },
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{G}: Vaevictis Asmadi gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "unless", chooser: "you", options: [{ pay: "{B}{R}{G}", text: "Pay {B}{R}{G}" }], otherwise: { kind: "sacrifice-source" } },
      resolve: null,
      text: "At the beginning of your upkeep, sacrifice Vaevictis Asmadi unless you pay {B}{R}{G}.",
    },
  ],
});
