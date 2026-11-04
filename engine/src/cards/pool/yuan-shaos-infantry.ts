import { defineCard } from "../define.js";

// Portal Three Kingdoms. "This combat": a second combat that turn doesn't bind.
const TEXT = "Whenever this creature attacks alone, this creature can't be blocked this combat.";

export default defineCard({
  name: "Yuan Shao's Infantry",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: TEXT,
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
