import { defineCard } from "../define.js";

// EDHREC rank 6818.
//
// Summon: Primal Odin's Saga-creature shape. Chapter I's 4 damage is dealt by
// this creature (as it last existed, should it have left by then); chapters
// II and III each target another creature you control.

const AERIAL_BLAST = "I — Aerial Blast — This creature deals 4 damage to target tapped creature an opponent controls.";
const SLIPSTREAM = "II, III — Slipstream — Another target creature you control gets +1/+0 and gains flying until end of turn.";

export default defineCard({
  name: "Summon: Primal Garuda",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Harpy"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${AERIAL_BLAST}\n${SLIPSTREAM}\nFlying`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", tapped: true } }],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: AERIAL_BLAST,
    },
    {
      at: [2, 3],
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: SLIPSTREAM,
    },
  ],
});
