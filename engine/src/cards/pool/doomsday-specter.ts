import { defineCard } from "../define.js";

// EDHREC rank 23320.

// The creature is chosen on resolution, not targeted, and the Specter itself
// qualifies (as Cavern Harpy's).
const GATE = "When this creature enters, return a blue or black creature you control to its owner's hand.";
const HIT =
  "Whenever this creature deals combat damage to a player, look at that player's hand and choose a card from it. The player discards that card.";

export default defineCard({
  name: "Doomsday Specter",
  manaCost: "{2}{U}{B}",
  colors: ["U", "B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${GATE}\n${HIT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you", anyOf: [{ colors: ["U"] }, { colors: ["B"] }] },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a blue or black creature you control to its owner's hand",
      },
      resolve: null,
      text: GATE,
    },
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard-chosen", target: "trigger-player", lookOnly: true },
      resolve: null,
      text: HIT,
    },
  ],
});
