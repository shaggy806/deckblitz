import { defineCard } from "../define.js";

// EDHREC rank 27676. Ravnica: City of Guilds.

const TEXT = "Sacrifice three lands: This creature loses defender until end of turn.";

export default defineCard({
  name: "Torpid Moloch",
  manaCost: "{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 3,
  toughness: 2,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { type: "land" }, count: 3 } },
      targets: [],
      effect: { kind: "lose-keywords", target: "source", keywords: ["defender"], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
