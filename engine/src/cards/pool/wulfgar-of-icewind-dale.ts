import { defineCard } from "../define.js";

const DOUBLE =
  "If a creature you control attacking causes a triggered ability of a permanent you control to trigger, that ability triggers an additional time.";

export default defineCard({
  name: "Wulfgar of Icewind Dale",
  manaCost: "{3}{R}{G}",
  colors: ["R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 4,
  toughness: 4,
  text: `Melee (Whenever this creature attacks, it gets +1/+1 until end of turn for each opponent you attacked this combat.)\n${DOUBLE}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { opponentsAttacked: true },
        toughness: { opponentsAttacked: true },
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Melee",
    },
  ],
  static: [{ affects: { scope: "self" }, doubleTriggers: { cause: "attacks", filter: { controlledBy: "you" } }, text: DOUBLE }],
});
