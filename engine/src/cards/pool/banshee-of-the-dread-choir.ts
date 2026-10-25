import { defineCard } from "../define.js";
import { myriad } from "../helpers.js";

const MYRIAD_TEXT =
  "Myriad (Whenever this creature attacks, for each opponent other than defending player, you may create a token copy that's tapped and attacking that player or a planeswalker they control. Exile the tokens at end of combat.)";
const DISCARD_TEXT = "Whenever this creature deals combat damage to a player, that player discards a card.";

export default defineCard({
  name: "Banshee of the Dread Choir",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  text: `${MYRIAD_TEXT}\n${DISCARD_TEXT}`,
  triggered: [
    myriad(),
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "discard", target: "trigger-player", amount: 1 },
      resolve: null,
      text: DISCARD_TEXT,
    },
  ],
});
