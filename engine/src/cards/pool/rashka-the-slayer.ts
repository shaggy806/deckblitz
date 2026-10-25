import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 30787. Woolly Spider's shape: a blocker
// blocks one attacker in this engine, so "one or more black creatures" fires
// once (the ruling), and the colour is a trigger condition, not an
// intervening "if".

const TEXT = "Whenever Rashka blocks one or more black creatures, Rashka gets +1/+2 until end of turn.";

export default defineCard({
  name: "Rashka the Slayer",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Archer"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach (This creature can block creatures with flying.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      whileCondition: { kind: "trigger-object", filter: { colors: ["B"] } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
