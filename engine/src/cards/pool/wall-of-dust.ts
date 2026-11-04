import { defineCard } from "../define.js";

// "That creature" is the one it blocks (`blocks`'s `object: "blocked"`); it's
// bound only during the next turn of whoever controls it as this resolves.
const TEXT = "Whenever this creature blocks a creature, that creature can't attack during its controller's next turn.";

export default defineCard({
  name: "Wall of Dust",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 1,
  toughness: 4,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: { kind: "restrict", target: "trigger-object", restrictions: ["cant-attack"], duration: "its-controllers-next-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
