import { defineCard } from "../define.js";

// Marvel: Darkhold Destiny Commander (preview).
const ENTERS = "Gargantos enters with three +1/+1 counters on him.";
const UPKEEP = "At the beginning of your upkeep, double the number of +1/+1 counters on Gargantos.";
const DAMAGE = "Whenever Gargantos deals combat damage to an opponent, he deals that much damage to each other opponent.";

export default defineCard({
  name: "Gargantos, the Endbringer",
  manaCost: "{2}{B}{G}",
  colors: ["B", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elder", "God", "Horror"],
  power: 0,
  toughness: 0,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTERS}\n${UPKEEP}\n${DAMAGE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: ENTERS,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "double-counters", target: "source", counter: "+1/+1" },
      resolve: null,
      text: UPKEEP,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "each-other-opponent" },
      resolve: null,
      text: DAMAGE,
    },
  ],
});
