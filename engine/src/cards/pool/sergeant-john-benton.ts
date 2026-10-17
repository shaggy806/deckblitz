import { defineCard } from "../define.js";

// EDHREC rank 8601. Share Intelligence is Xyris, the Writhing Storm's trigger.
const SHARE_TEXT =
  "Share Intelligence — Whenever Sergeant John Benton deals combat damage to a player, you and that player each draw that many cards.";

export default defineCard({
  name: "Sergeant John Benton",
  manaCost: "{1}{G}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 4,
  keywords: ["trample", "haste"],
  text: `Trample, haste\n${SHARE_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: { triggerValue: true } },
          { kind: "draw", amount: { triggerValue: true }, who: "trigger-player" },
        ],
      },
      resolve: null,
      text: SHARE_TEXT,
    },
  ],
});
