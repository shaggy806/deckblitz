import { defineCard } from "../define.js";

const LURE = "{1}: Target artifact creature blocks this creature this turn if able.";
const EVADE = "{1}: Target artifact creature can't block this creature this turn.";
const ARTIFACT_CREATURE = { kind: "permanent", filter: { types: ["artifact", "creature"] } } as const;

export default defineCard({
  name: "Auriok Siege Sled",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Juggernaut"],
  power: 3,
  toughness: 5,
  text: `${LURE}\n${EVADE}`,
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: [ARTIFACT_CREATURE],
      effect: { kind: "block-if-able", target: 0, attacker: "source" },
      resolve: null,
      text: LURE,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [ARTIFACT_CREATURE],
      effect: { kind: "restrict", target: 0, restrictions: [], cantBlockAttacker: "source" },
      resolve: null,
      text: EVADE,
    },
  ],
});
