import { defineCard } from "../define.js";

// Every attacker is asked about at once, as the one question; staying is an answer.
const TEXT =
  "When this creature enters during the declare attackers step, for each attacking creature, you may reselect which player or permanent that creature is attacking. (It can't attack its controller or their permanents.)";

export default defineCard({
  name: "Windshaper Planetar",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel"],
  power: 4,
  toughness: 4,
  keywords: ["flash", "flying"],
  text: `Flash\nFlying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      whileCondition: { kind: "turn-structure", steps: ["declare-attackers"] },
      targets: [],
      effect: { kind: "reselect-attack", filter: { type: "creature", attacking: true } },
      resolve: null,
      text: TEXT,
    },
  ],
});
