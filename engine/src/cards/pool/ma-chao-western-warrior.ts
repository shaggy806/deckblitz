import { defineCard } from "../define.js";

// Portal Three Kingdoms. "This combat": a second combat that turn doesn't bind.
const TEXT = "Whenever Ma Chao attacks alone, it can't be blocked this combat.";

export default defineCard({
  name: "Ma Chao, Western Warrior",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["horsemanship"],
  text: `Horsemanship (This creature can't be blocked except by creatures with horsemanship.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks-alone", who: "self" },
      targets: [],
      effect: { kind: "restrict", target: "source", restrictions: ["cant-be-blocked"], duration: "until-end-of-combat" },
      resolve: null,
      text: TEXT,
    },
  ],
});
