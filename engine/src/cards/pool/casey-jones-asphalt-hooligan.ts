import { defineCard } from "../define.js";

// "Double his power": he gets +X/+0, X his power as it resolves (the ruling).
const DOUBLE_TEXT = "{4}: Double Casey Jones's power until end of turn. Any player may activate this ability.";

export default defineCard({
  name: "Casey Jones, Asphalt Hooligan",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Berserker"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  text: `Double strike (This creature deals both first-strike and regular combat damage.)\n${DOUBLE_TEXT}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: { powerOf: "source" }, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: DOUBLE_TEXT,
      anyPlayer: true,
    },
  ],
});
