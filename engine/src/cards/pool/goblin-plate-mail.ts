import { defineCard } from "../define.js";

const ENTERS =
  "When this Equipment enters, amass Goblins 1, then attach this Equipment to the amassed Army. (To amass Goblins 1, put a +1/+1 counter on an Army you control. It's also a Goblin. If you don't control an Army, create a 0/0 black Goblin Army creature token first.)";
const EQUIPPED = "Equipped creature gets +1/+0 and has menace.";

export default defineCard({
  name: "Goblin Plate Mail",
  manaCost: "{1}{B/R}",
  colors: ["B", "R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ENTERS}\n${EQUIPPED}\nEquip {4}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 0],
      grantKeywords: ["menace"],
      text: EQUIPPED,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "amass", amount: 1, creatureType: "Goblin" },
          { kind: "attach", target: "amassed" },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
});
