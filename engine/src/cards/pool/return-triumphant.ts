import { defineCard } from "../define.js";

// "It" is the card returned: target 0 follows it onto the battlefield. Not
// returned (it left the graveyard in response), there's nothing to attach to.
export default defineCard({
  name: "Return Triumphant",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target creature card with mana value 3 or less from your graveyard to the battlefield. Create a Young Hero Role token attached to it. (Enchanted creature has \"Whenever this creature attacks, if its toughness is 3 or less, put a +1/+1 counter on it.\")",
  targets: [
    { kind: "card-in-graveyard", whose: "you", filter: { type: "creature", manaValue: { op: "lte", n: 3 } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "create-token", token: "Young Hero Role Token", count: 1, attachedTo: 0 },
    ],
  },
});
