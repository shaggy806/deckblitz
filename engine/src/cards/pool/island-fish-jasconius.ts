import { defineCard } from "../define.js";

const DOESNT_UNTAP = "This creature doesn't untap during your untap step.";
const UPKEEP = "At the beginning of your upkeep, you may pay {U}{U}{U}. If you do, untap this creature.";
const ATTACK = "This creature can't attack unless defending player controls an Island.";
const SACRIFICE = "When you control no Islands, sacrifice this creature.";

export default defineCard({
  name: "Island Fish Jasconius",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Fish"],
  power: 6,
  toughness: 8,
  text: `${DOESNT_UNTAP}\n${UPKEEP}\n${ATTACK}\n${SACRIFICE}`,
  static: [
    { affects: { scope: "self" }, doesntUntap: true, text: DOESNT_UNTAP },
    { affects: { scope: "self" }, restrictions: [{ kind: "cant-attack", unlessDefender: { controls: { subtype: "Island" } } }], text: ATTACK },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {U}{U}{U} to untap Island Fish Jasconius?",
        cost: "{U}{U}{U}",
        effect: { kind: "untap", target: "source" },
      },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "state", state: { kind: "not", of: { kind: "controls", filter: { subtype: "Island" }, atLeast: 1 } } },
      targets: [],
      effect: { kind: "sacrifice-source" },
      resolve: null,
      text: SACRIFICE,
    },
  ],
});
