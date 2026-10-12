import { defineCard } from "../define.js";

// EDHREC rank 18458.
//
// "Behold a Kithkin and exile it" is a mandatory additional cost (rule
// 701.4a): a Kithkin card from the hand or a Kithkin you control, exiled as
// the spell is cast — at flash speed too. The exiled card is linked to the
// permanent the spell becomes (rule 607.2q), so it stays exiled for good if
// the spell is countered (the ruling), and a token exiled this way ceases to
// exist (111.7).

const LORD_TEXT = "Other Kithkin you control get +1/+1.";
const LEAVES_TEXT = "When this creature leaves the battlefield, return the exiled card to its owner's hand.";

export default defineCard({
  name: "Champion of the Clachan",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Knight"],
  power: 4,
  toughness: 5,
  keywords: ["flash"],
  additionalCost: { behold: { filter: { subtype: "Kithkin" }, text: "a Kithkin", exile: true } },
  text: `Flash\nAs an additional cost to cast this spell, behold a Kithkin and exile it. (Exile a Kithkin you control or a Kithkin card from your hand.)\n${LORD_TEXT}\n${LEAVES_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Kithkin" },
      grantPt: [1, 1],
      text: LORD_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "return-exiled-by-source", linked: "hand" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
