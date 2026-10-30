import { defineCard } from "../define.js";

// Core Set 2021. "At least 7 life more than your starting life total": 27
// in a 20-life game, 47 in Commander (rule 103.4).

const ABILITY =
  "{T}: Create a 4/4 white Angel creature token with flying. Activate only if you have at least 7 life more than your starting life total and only as a sorcery.";

export default defineCard({
  name: "Speaker of the Heavens",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  keywords: ["vigilance", "lifelink"],
  text:
    "Vigilance, lifelink (Attacking doesn't cause this creature to tap. Damage dealt by this creature also causes you to gain that much life.)\n" +
    ABILITY,
  activated: [
    {
      cost: { mana: null, tap: true },
      condition: { kind: "life-total", atLeast: { startingPlus: 7 } },
      sorcerySpeed: true,
      targets: [],
      effect: { kind: "create-token", token: "4/4 Angel Token", count: 1 },
      resolve: null,
      text: ABILITY,
    },
  ],
});
