import { defineCard } from "../define.js";

// EDHREC rank 15167.
//
// Rulings:
//   [2025-06-13] The damage dealt by Amarant Coral as a result of its last ability is not combat
//     damage and therefore doesn't cause the ability to trigger again.
//   [2025-06-13] If Amarant Coral can't attack for any reason (such as being tapped or having come
//     under your control that turn), then it doesn't attack. If there's a cost associated with having
//     it attack, you're not forced to pay that cost, so it doesn't have to attack in that case either.
//
// No Mercy is Hydra Omnivore's trigger ("No Mercy" is an ability word);
// "attacks each combat if able" is the `must-attack` restriction.
const ATTACK_TEXT = "Amarant Coral attacks each combat if able.";
const MERCY_TEXT =
  "No Mercy — Whenever Amarant Coral deals combat damage to an opponent, it deals that much damage to each other opponent.";

export default defineCard({
  name: "Amarant Coral",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${ATTACK_TEXT}\n${MERCY_TEXT}`,
  static: [{ affects: { scope: "self" }, restrictions: ["must-attack"], text: ATTACK_TEXT }],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self", toOpponent: true },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "each-other-opponent" },
      resolve: null,
      text: MERCY_TEXT,
    },
  ],
});
