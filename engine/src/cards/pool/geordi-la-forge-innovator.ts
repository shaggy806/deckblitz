import { defineCard } from "../define.js";

// Star Trek Commander (TRC).

const UNBLOCKABLE_TEXT = "Geordi La Forge can't be blocked if you control a Spacecraft.";
const DAMAGE_TEXT = "Whenever Geordi La Forge deals combat damage to a player, draw a card.";

export default defineCard({
  name: "Geordi La Forge, Innovator",
  manaCost: "{2}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: `${UNBLOCKABLE_TEXT}\n${DAMAGE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { subtype: "Spacecraft" }, atLeast: 1 },
      grantKeywords: ["unblockable"],
      text: UNBLOCKABLE_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
