import { defineCard } from "../define.js";

// EDHREC rank 16636.
//
// Rulings:
//   [2012-10-01] Applying this redirection effect doesn’t change whether the damage is combat
//     damage.
//   [2012-10-01] If you control more than one Palisade Giant, you choose which redirection effect
//     to apply. You can’t divide damage dealt by one source. For example, if an attacking creature
//     would deal 8 damage to you and you control two Palisade Giants, you may have that damage
//     dealt to either of the Palisade Giants. You can’t have 4 damage dealt to each Giant or
//     choose to have the 8 damage dealt to you.

export default defineCard({
  name: "Palisade Giant",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 2,
  toughness: 7,
  text: "All damage that would be dealt to you and other permanents you control is dealt to this creature instead.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-deal-damage", to: "your-side", toOther: true, redirect: "self" },
      text: "All damage that would be dealt to you and other permanents you control is dealt to this creature instead.",
    },
  ],
});
