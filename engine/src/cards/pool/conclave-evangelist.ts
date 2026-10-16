import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

// EDHREC rank 11595. Ravnica: Clue Edition (CLU).
//
// A myriad token that deals combat damage to a player makes a copy too, and
// that copy isn't exiled at end of combat (the ruling): only the tokens
// myriad made are.
const COPY_TEXT = "Whenever this creature deals combat damage to a player, create a token that's a copy of this creature.";

export default defineCard({
  name: "Conclave Evangelist",
  manaCost: "{3}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elephant", "Cleric"],
  power: 4,
  toughness: 4,
  text: `Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)\n${COPY_TEXT}`,
  triggered: [
    myriad(),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "create-token-copy", of: "source", count: 1 },
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
