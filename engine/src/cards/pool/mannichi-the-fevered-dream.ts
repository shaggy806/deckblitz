import { defineCard } from "../define.js";

const TEXT = "{1}{R}: Switch each creature's power and toughness until end of turn.";

export default defineCard({
  name: "Mannichi, the Fevered Dream",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "switch-pt", all: { type: "creature" }, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
