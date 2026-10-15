import { defineCard } from "../define.js";

// EDHREC rank 12318.
//
// Rulings:
//   [2025-04-04] The second ability checks the number of attacking creatures you control only as
//     the ability resolves. If another attack trigger (such as from the mobilize ability) puts
//     creatures onto the battlefield attacking, you can choose to order the triggered abilities so
//     that those creatures enter before Stormbeacon Blade’s ability resolves.
//
// "Draw a card if you control three or more attacking creatures" isn't an
// intervening-if (it doesn't open the sentence): the count is a `conditional`
// read as the ability resolves, as the ruling says.

const ATTACK_TEXT =
  "Whenever equipped creature attacks, draw a card if you control three or more attacking creatures.";

export default defineCard({
  name: "Stormbeacon Blade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +3/+0.\n${ATTACK_TEXT}\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "controls", filter: { type: "creature", attacking: true }, atLeast: 3 },
        then: { kind: "draw", amount: 1 },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 0], text: "Equipped creature gets +3/+0." }],
});
