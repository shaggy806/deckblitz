import { defineCard } from "../define.js";

// EDHREC rank 23961.
//
// "Return a land you control" isn't targeted: chosen as it resolves, one if
// you control any (Guildless Commons' shape).

const DAMAGE_TEXT =
  "Whenever this creature deals combat damage to a player, return a land you control to its owner's hand.";

export default defineCard({
  name: "Wayward Guide-Beast",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 2,
  toughness: 2,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${DAMAGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return a land you control to its owner's hand",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
