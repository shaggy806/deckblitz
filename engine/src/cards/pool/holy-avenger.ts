import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9975. An Aura that can't enchant it stays in the hand (rule
// 303.4i, the ruling).
const TEXT =
  "Whenever equipped creature deals combat damage, you may put an Aura card from your hand onto the battlefield attached to it.";

export default defineCard({
  name: "Holy Avenger",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has double strike.\n${TEXT}\nEquip {2}{W}`,
  static: [
    { affects: { scope: "attached" }, grantKeywords: ["double-strike"], text: "Equipped creature has double strike." },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "attached", combat: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { subtype: "Aura" },
        attachedTo: "attached",
      },
      resolve: null,
      text: TEXT,
    },
  ],
  activated: [equip("{2}{W}")],
});
