import { defineCard } from "../define.js";

const TEXT = "{T}: Target creature you control gains protection from the color of your choice until end of turn.";

export default defineCard({
  name: "Mother of Runes",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: ["creature-you-control"],
      effect: { kind: "grant-protection", target: 0, from: { choose: "color" }, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
