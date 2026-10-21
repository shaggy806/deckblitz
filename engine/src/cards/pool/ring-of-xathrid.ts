import { defineCard } from "../define.js";

// "If it's black" is checked as the upkeep ability resolves (not an
// intervening "if" — it ends the sentence), of the creature equipped then.
const REGEN =
  "{2}: Regenerate equipped creature. (The next time that creature would be destroyed this turn, instead tap it, remove it from combat, and heal all damage on it.)";
const UPKEEP = "At the beginning of your upkeep, put a +1/+1 counter on equipped creature if it's black.";

export default defineCard({
  name: "Ring of Xathrid",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${REGEN}\n${UPKEEP}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "attached" },
      resolve: null,
      text: "{2}: Regenerate equipped creature.",
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source", filter: { attachedTo: { colors: ["B"] } } },
        then: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
});
