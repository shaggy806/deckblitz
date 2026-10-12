import { defineCard } from "../define.js";

// EDHREC rank 8438.
//
// Rulings: airbend's — its owner may cast the card from exile for {2} (an
// alternative cost: X is 0, additional costs still paid), a token exiled is
// gone, a land can't be played from there.
const ETB_TEXT = "When this Equipment enters, airbend up to one target creature.";
const STATIC_TEXT = "Equipped creature gets +1/+1 and has flying.";

export default defineCard({
  name: "Glider Staff",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    `${ETB_TEXT} (Exile it. While it's exiled, its owner may cast it for {2} rather than its mana cost.)\n` +
    `${STATIC_TEXT}\nEquip {2}`,
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
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: "creature" }],
      effect: { kind: "exile", target: 0, airbend: true },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      grantKeywords: ["flying"],
      text: STATIC_TEXT,
    },
  ],
});
