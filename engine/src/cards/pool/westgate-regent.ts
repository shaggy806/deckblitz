import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 13971.
const DAMAGE = "Whenever this creature deals combat damage to a player, put that many +1/+1 counters on it.";

export default defineCard({
  name: "Westgate Regent",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\nWard—Discard a card. (Whenever this creature becomes the target of a spell or ability an opponent controls, counter it unless that player discards a card.)\n${DAMAGE}`,
  triggered: [
    ward({ discard: 1 }),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE,
    },
  ],
});
