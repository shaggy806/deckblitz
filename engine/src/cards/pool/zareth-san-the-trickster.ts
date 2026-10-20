import { defineCard } from "../define.js";

// Rulings: the cost needs an unblocked attacking Rogue, so the ability can be
// activated only once blockers are declared; Zareth San enters attacking a
// player or planeswalker of its controller's choice (not necessarily the one
// the returned Rogue attacked) and was never declared as an attacker. If it
// leaves the hand before the ability resolves, the ability does nothing.

const SNEAK =
  "{2}{U}{B}, Return an unblocked attacking Rogue you control to its owner's hand: Put this card from your hand onto the battlefield tapped and attacking.";
const HIT =
  "Whenever Zareth San deals combat damage to a player, you may put target permanent card from that player's graveyard onto the battlefield under your control.";

export default defineCard({
  name: "Zareth San, the Trickster",
  manaCost: "{3}{U}{B}",
  colors: ["U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Merfolk", "Rogue"],
  power: 4,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${SNEAK}\n${HIT}`,
  activated: [
    {
      cost: {
        mana: "{2}{U}{B}",
        tap: false,
        returnToHand: { count: 1, filter: { type: "creature", subtype: "Rogue", unblocked: true } },
      },
      zone: "hand",
      staysInZone: true,
      targets: [],
      effect: { kind: "put-onto-battlefield", target: "source", enterTapped: true, attacking: "choose" },
      resolve: null,
      text: SNEAK,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "trigger-player",
          filter: { typesAnyOf: ["artifact", "creature", "enchantment", "land", "planeswalker", "battle"] },
        },
      ],
      effect: {
        kind: "may",
        prompt: "Put target permanent card onto the battlefield under your control?",
        effect: { kind: "put-onto-battlefield", target: 0, underYourControl: true },
      },
      resolve: null,
      text: HIT,
    },
  ],
});
