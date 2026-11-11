import { defineCard } from "../define.js";

// EDHREC rank 6740.
//
// Rulings:
//   [2020-11-10] While Archon of Coronation's last ability applies, damage dealt to you still has
//     all effects other than causing you to lose life. For example, abilities that trigger on that
//     damage being dealt still trigger; if the source has lifelink, its controller still gains
//     life; and so on.
//   [2020-11-10] Combat damage dealt to you by a commander is still tracked, even if it didn't
//     cause you to lose life.
//   [2020-11-10] If combat damage dealt to the monarch causes that player to lose the game, the
//     triggered ability that causes the controller of the attacking creature to become the monarch
//     doesn't resolve. In most cases, the controller of the attacking creature will still become
//     the monarch as it is likely their turn.
//
// The last ability is a `lose-life` prohibition `from: "damage"`: rule 120.3a's result alone
// doesn't happen, and the damage is dealt in full (poison from infect, lifelink, commander damage
// and the monarch's own trigger all still see it).

export default defineCard({
  name: "Archon of Coronation",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, you become the monarch.\nAs long as you're the monarch, damage doesn't cause you to lose life. (When a creature deals combat damage to you, its controller still becomes the monarch.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: "When this creature enters, you become the monarch.",
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "monarch", who: "you" },
      prohibits: [{ act: "lose-life", who: "you", from: "damage" }],
      text: "As long as you're the monarch, damage doesn't cause you to lose life.",
    },
  ],
});
