import { defineCard } from "../define.js";

// EDHREC rank 13791.
// "Up to one target Room you control": with a Room chosen, one of its locked
// doors is unlocked (its controller choosing when both are); with none, or a
// Room with no locked door, nothing happens (the Room rulings).
const TEXT = "Whenever this creature deals combat damage to a player, unlock a locked door of up to one target Room you control.";

export default defineCard({
  name: "Ghostly Keybearer",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "you", filter: { subtype: "Room" } } }],
      effect: { kind: "unlock-door", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
