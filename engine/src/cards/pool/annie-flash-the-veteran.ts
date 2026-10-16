import { defineCard } from "../define.js";

// EDHREC rank 17813.
//
// Rulings:
//   [2024-04-12] Annie Flash's second ability triggers if you cast it from any zone. It doesn't
//     trigger if you put Annie Flash onto the battlefield without casting it.
//   [2024-04-12] A permanent card is an artifact, battle, creature, enchantment, land, or
//     planeswalker card.
//   [2024-04-12] If the mana cost of a card in your graveyard includes {X}, X is 0 for the purpose
//     of determining its mana value.
//   [2024-04-12] If you return an Aura this way, you choose what the Aura will enchant just before
//     it enters the battlefield. An Aura returning to the battlefield this way doesn't target the
//     player or permanent it will enchant, so players or permanents with hexproof may be chosen;
//     however, the chosen recipient must be able to legally be enchanted by the Aura, so a player
//     or permanent with protection from one of the Aura's qualities can't be chosen this way. If
//     there's nothing legal for the Aura to enchant, it stays in the graveyard.
//   [2024-04-12] You pay all costs and follow all normal timing rules for cards played from exile
//     with Annie Flash's last ability. For example, if the exiled card is a land card, you may
//     play it only during your main phase while the stack is empty.

const ENTER_TEXT =
  "When Annie Flash enters, if you cast it, return target permanent card with mana value 3 or less from your graveyard to the battlefield tapped.";
const TAP_TEXT =
  "Whenever Annie Flash becomes tapped, exile the top two cards of your library. You may play those cards this turn.";

export default defineCard({
  name: "Annie Flash, the Veteran",
  manaCost: "{3}{R}{G}{W}",
  colors: ["W", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 4,
  toughness: 5,
  keywords: ["flash"],
  text: `Flash\n${ENTER_TEXT}\n${TAP_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // "If you cast it", from any zone (the ruling) — an intervening if.
      condition: { kind: "source", filter: { cast: true, castBy: "you" } },
      // A permanent card: not an instant or sorcery (a kindred instant
      // included). An {X} in its cost counts as 0 (the ruling).
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { notTypes: ["instant", "sorcery"], manaValue: { op: "lte", n: 3 } },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0, enterTapped: true },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "becomes-tapped", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 2, duration: "end-of-turn" },
      resolve: null,
      text: TAP_TEXT,
    },
  ],
});
