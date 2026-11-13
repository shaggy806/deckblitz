import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// The bonus counts the lands of the player it's attacking (the one defending
// the planeswalker or battle it attacks), read live; each myriad copy counts
// its own defending player's.
const ATTACKING =
  "As long as this creature is attacking, it gets +X/+0, where X is the number of lands defending player controls.";

export default defineCard({
  name: "Elturel Survivors",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Tiefling", "Peasant"],
  power: 0,
  toughness: 4,
  keywords: ["trample"],
  text: `Trample, myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)\n${ATTACKING}`,
  triggered: [myriad()],
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "source", filter: { attacking: true } },
      grantPtPerCount: { filter: { type: "land", controlledBy: "you" }, forDefendingPlayer: true, pt: [1, 0] },
      text: ATTACKING,
    },
  ],
});
