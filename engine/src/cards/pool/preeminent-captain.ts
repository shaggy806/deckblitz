import { defineCard } from "../define.js";

// EDHREC rank 9648. Morningtide.
//
// Rulings:
//   [2014-07-18] You choose what the Soldier you put onto the battlefield is attacking. It doesn’t
//     have to attack the same player or planeswalker as Preeminent Captain.
//   [2014-07-18] Any abilities of the Soldier creature card that trigger “Whenever [this creature]
//     attacks” won’t trigger because the creature was never declared as an attacking creature.
//
// Ilharg, the Raze-Boar's shape: `attacking: "choose"` lets the controller pick
// what the Soldier attacks (the first ruling).
const ATTACK_TEXT =
  "Whenever this creature attacks, you may put a Soldier creature card from your hand onto the battlefield tapped and attacking.";

export default defineCard({
  name: "Preeminent Captain",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike (This creature deals combat damage before creatures without first strike.)\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", subtype: "Soldier" },
        enterTapped: true,
        attacking: "choose",
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
