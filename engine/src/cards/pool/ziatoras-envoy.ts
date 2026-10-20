import { defineCard } from "../define.js";

// The top card is looked at, then played (a land, on your turn with a land
// play left — this trigger usually resolves in combat on your turn) or cast
// free if its mana value is at most the damage dealt (`triggerValue`); if
// neither, it goes to your hand — put there, not drawn.
const TRIGGER_TEXT =
  "Whenever this creature deals combat damage to a player, look at the top card of your library. You may play a land from the top of your library or cast a spell with mana value less than or equal to the damage dealt from the top of your library without paying its mana cost. If you don't, put that card into your hand.";
const BLITZ_TEXT =
  'Blitz {2}{B}{R}{G} (If you cast this spell for its blitz cost, it gains haste and "When this creature dies, draw a card." Sacrifice it at the beginning of the next end step.)';

export default defineCard({
  name: "Ziatora's Envoy",
  manaCost: "{1}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 5,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample\n${TRIGGER_TEXT}\n${BLITZ_TEXT}`,
  blitz: { cost: "{2}{B}{R}{G}" },
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "cast-now",
        from: { libraryTop: 1 },
        play: true,
        free: true,
        spell: { manaValue: { op: "lte", n: { amount: { triggerValue: true } } } },
        else: {
          kind: "look-and-choose",
          zone: "library",
          count: 1,
          min: 1,
          max: 1,
          destination: "hand",
          leftover: "stay",
        },
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
