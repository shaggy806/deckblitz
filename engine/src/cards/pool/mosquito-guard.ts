import { defineCard } from "../define.js";

// EDHREC rank 27109. Morningtide.
//
// Reinforce (rule 702.77a) is an activated ability from the hand, paid by
// discarding the card.
const REINFORCE_TEXT =
  "Reinforce 1—{1}{W} ({1}{W}, Discard this card: Put a +1/+1 counter on target creature.)";

export default defineCard({
  name: "Mosquito Guard",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 1,
  toughness: 1,
  keywords: ["first-strike"],
  text: `First strike\n${REINFORCE_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      zone: "hand",
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: REINFORCE_TEXT,
    },
  ],
});
