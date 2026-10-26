import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 21328.

const TEXT = "{W}, Sacrifice a creature: Target creature can't attack this turn.";

export default defineCard({
  name: "Martyred Rusalka",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: false, sacrifice: "creature-you-control" },
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-attack"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
