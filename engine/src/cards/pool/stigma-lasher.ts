import { defineCard } from "../define.js";

const TEXT = "Whenever this creature deals damage to a player, that player can't gain life for the rest of the game.";

// EDHREC rank 12208.
export default defineCard({
  name: "Stigma Lasher",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Elemental", "Shaman"],
  power: 2,
  toughness: 2,
  keywords: ["wither"],
  text: `Wither (This deals damage to creatures in the form of -1/-1 counters.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player" },
      targets: [],
      effect: { kind: "prohibit", prohibits: [{ act: "gain-life", who: "trigger-player" }], duration: "permanent" },
      resolve: null,
      text: TEXT,
    },
  ],
});
