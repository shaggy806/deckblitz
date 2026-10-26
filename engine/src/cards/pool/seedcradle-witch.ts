import { defineCard } from "../define.js";

const TEXT = "{2}{G}{W}: Target creature gets +3/+3 until end of turn. Untap that creature.";

export default defineCard({
  name: "Seedcradle Witch",
  manaCost: "{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Shaman"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}{G}{W}", tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: 0, power: 3, toughness: 3, duration: "end-of-turn" },
          { kind: "untap", target: 0 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
