import { defineCard } from "../define.js";

// EDHREC rank 1106.
//
// The granted dies trigger returns the card, then creates the Wicked Role
// attached to "it" — the trigger object, which the ability's context still
// names once the return has moved it onto the battlefield. If the card has
// left the graveyard before the trigger resolves, it's a new object (rule
// 400.7): nothing returns and no Role is made (the first ruling). A Role that
// can't legally enchant what returned isn't created (the Role rulings).

const RETURN_TEXT =
  "When this creature dies, return it to the battlefield tapped under its owner's control, then create a Wicked Role token attached to it.";

export default defineCard({
  name: "Not Dead After All",
  manaCost: "{B}",
  colors: ["B"],
  types: ["instant"],
  text: `Until end of turn, target creature you control gains "${RETURN_TEXT}" (Enchanted creature gets +1/+1. When this token is put into a graveyard, each opponent loses 1 life.)`,
  targets: ["creature-you-control"],
  effect: {
    kind: "grant-triggered",
    target: 0,
    duration: "end-of-turn",
    ability: {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: "trigger-object", enterTapped: true },
          { kind: "create-token", token: "Wicked Role Token", count: 1, attachedTo: "trigger-object" },
        ],
      },
      resolve: null,
      text: RETURN_TEXT,
    },
  },
});
