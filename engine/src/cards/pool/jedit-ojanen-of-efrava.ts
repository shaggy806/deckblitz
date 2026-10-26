import { defineCard } from "../define.js";

// Planar Chaos (PLC). "Attacks or blocks" is two triggers (Savvy Hunter's
// shape); the token comes too late to attack or block this combat (the
// ruling), which the engine does by itself.
const TEXT =
  "Whenever Jedit Ojanen attacks or blocks, create a 2/2 green Cat Warrior creature token with forestwalk.";
const CAT = { kind: "create-token", token: "Cat Warrior Token", count: 1 } as const;

export default defineCard({
  name: "Jedit Ojanen of Efrava",
  manaCost: "{3}{G}{G}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Cat", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["forestwalk"],
  text: `Forestwalk (This creature can't be blocked as long as defending player controls a Forest.)\n${TEXT}`,
  triggered: [
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: CAT, resolve: null, text: TEXT },
    { trigger: { on: "blocks", who: "self" }, targets: [], effect: CAT, resolve: null, text: TEXT },
  ],
});
