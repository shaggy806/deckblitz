import type { TriggeredAbility } from "../../abilities.js";
import { defineCard } from "../define.js";

// Ordeal of Erebos's shape. The sacrifice trigger fires however this Aura is
// sacrificed (the ruling).
const ATTACK = "Whenever enchanted creature attacks, put a +1/+1 counter on it. Then if it has three or more +1/+1 counters on it, sacrifice this Aura.";
const SACRIFICED =
  "When you sacrifice this Aura, search your library for up to two basic land cards, put them onto the battlefield tapped, then shuffle.";

const attack: TriggeredAbility = {
  trigger: { on: "attacks", who: "attached" },
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "add-counter", target: "trigger-object", counter: "+1/+1", amount: 1 },
      {
        kind: "conditional",
        condition: { kind: "trigger-object", filter: { counters: { kind: "+1/+1", compare: { op: "gte", n: 3 } } } },
        then: { kind: "sacrifice-source" },
      },
    ],
  },
  resolve: null,
  text: ATTACK,
};

export default defineCard({
  name: "Ordeal of Nylea",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ATTACK}\n${SACRIFICED}`,
  targets: ["creature"],
  triggered: [
    attack,
    {
      trigger: { on: "sacrifice", who: "you", selfOnly: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        min: 0,
        max: 2,
        destination: "battlefield",
        enterTapped: true,
      },
      resolve: null,
      text: SACRIFICED,
    },
  ],
});
