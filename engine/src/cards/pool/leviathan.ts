import { defineCard } from "../define.js";

const UNTAP_STEP_TEXT = "This creature enters tapped and doesn't untap during your untap step.";
const UPKEEP_TEXT = "At the beginning of your upkeep, you may sacrifice two Islands. If you do, untap this creature.";
const ATTACK_TEXT = "This creature can't attack unless you sacrifice two Islands. (This cost is paid as attackers are declared.)";

export default defineCard({
  name: "Leviathan",
  manaCost: "{5}{U}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leviathan"],
  power: 10,
  toughness: 10,
  keywords: ["trample"],
  text: `Trample\n${UNTAP_STEP_TEXT}\n${UPKEEP_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { subtype: "Island" }, count: 2, text: "Sacrifice two Islands" }],
        ifDid: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    { affects: { scope: "self" }, replacement: { event: "enters-battlefield", tapped: true }, text: UNTAP_STEP_TEXT },
    { affects: { scope: "self" }, doesntUntap: true, text: UNTAP_STEP_TEXT },
    {
      affects: { scope: "self" },
      combatTax: { on: ["attack"], permanents: { do: "sacrifice", filter: { subtype: "Island" }, count: 2, noun: "Island" } },
      text: ATTACK_TEXT,
    },
  ],
});
