import { defineCard } from "../define.js";

// EDHREC rank 9659. Only the player is targeted (the ruling): a hexproof
// creature that player controls is tapped too — `tap-all` read from the target
// opponent's side (`controlledByTarget`), as Naya Charm and Assassin Gauntlet.

const TEXT = "When this creature enters, tap all creatures target opponent controls.";

export default defineCard({
  name: "Tempest Caller",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "tap-all", filter: { type: "creature", controlledBy: "you" }, controlledByTarget: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
