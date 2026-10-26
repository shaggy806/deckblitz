import { defineCard } from "../define.js";

// Magic 2013 (M13). EDHREC rank 9966. Ring of Xathrid's shape: "if it's
// white" is checked as the upkeep ability resolves, of the creature equipped
// then.
const UPKEEP = "At the beginning of your upkeep, put a +1/+1 counter on equipped creature if it's white.";

export default defineCard({
  name: "Ring of Thune",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has vigilance. (Attacking doesn't cause it to tap.)\n${UPKEEP}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
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
        condition: { kind: "source", filter: { attachedTo: { colors: ["W"] } } },
        then: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["vigilance"],
      text: "Equipped creature has vigilance.",
    },
  ],
});
