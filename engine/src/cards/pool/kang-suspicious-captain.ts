import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When Kang enters, choose target creature an opponent controls. Kang and that creature are goaded for as long as you control Kang. (They attack each combat if able and attack a player other than you if able.)";
const ATTACK_TEXT = "Whenever one or more goaded creatures attack, put a +1/+1 counter on target creature you control.";

export default defineCard({
  name: "Kang, Suspicious Captain",
  manaCost: "{3}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Klingon", "Warrior", "Officer"],
  power: 4,
  toughness: 4,
  text: `${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "goad", target: "source", duration: "while-you-control-source" },
          { kind: "goad", target: 0, duration: "while-you-control-source" },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attacks-batch", who: "any", filter: { type: "creature", goaded: true } },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
