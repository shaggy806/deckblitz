import { defineCard } from "../define.js";

// The +4 and the −3 exile cards linked to Karn (rule 607.2a — `exiledWith`,
// the stint each was activated in), and the −14 leaves those that are non-Aura
// permanent cards in exile as it restarts the game (rule 727), then puts them
// onto the battlefield under its controller, the new game's starting player.
// The +4's card is chosen by the player it targets. A card exiled with an
// earlier Karn, or this one before it left and came back, is a new object's.
const PLUS = "+4: Target player exiles a card from their hand.";
const MINUS = "−3: Exile target permanent.";
const ULTIMATE =
  "−14: Restart the game, leaving in exile all non-Aura permanent cards exiled with Karn. Then put those cards onto the battlefield under your control.";

export default defineCard({
  name: "Karn Liberated",
  manaCost: "{7}",
  colors: [],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Karn"],
  loyalty: 6,
  text: `${PLUS}\n${MINUS}\n${ULTIMATE}`,
  activated: [
    {
      loyaltyCost: 4,
      cost: { mana: null, tap: false },
      targets: ["player"],
      effect: {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          player: "that-player",
          zone: "hand",
          min: 1,
          max: 1,
          destination: "exile",
          leftover: "stay",
        },
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: ["permanent"],
      effect: { kind: "exile", target: 0, linked: true },
      resolve: null,
      text: MINUS,
    },
    {
      loyaltyCost: -14,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "restart-game",
        leaveInExile: {
          filter: {
            typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"],
            notSubtypes: ["Aura"],
          },
        },
        thenOntoBattlefield: true,
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
