import { defineCard } from "../define.js";

// EDHREC rank 19175. The creature exiled for the cost is exiled with the
// permanent this spell becomes (rule 607.2q), and the enters trigger's exile
// is linked too (607.2a): the leaves trigger hands back both. It isn't a
// sacrifice (701.21a), so a creature that can't be sacrificed still pays.
//
// Rulings:
//   If there are no exiled cards when Fear of Abduction's last ability resolves (most likely because
//     its third ability hasn't resolved yet), the ability won't do anything.
//   If Fear of Abduction leaves the battlefield before its third ability resolves, the ability still
//     exiles the target creature.

const ENTERS_TEXT = "When this creature enters, exile target creature an opponent controls.";
const LEAVES_TEXT = "When this creature leaves the battlefield, put each card exiled with it into its owner's hand.";

export default defineCard({
  name: "Fear of Abduction",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Nightmare"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  additionalCost: { sacrifice: { type: "creature" }, exilesSacrifice: true },
  text: `As an additional cost to cast this spell, exile a creature you control.\nFlying\n${ENTERS_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-an-opponent-controls"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
