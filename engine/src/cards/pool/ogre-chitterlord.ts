import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// "Each Rat you control gets +2/+0" affects the Rats there as it resolves, the two just made
// included (rule 611.2c); "if you control five or more Rats" is read then too, counting this
// creature if it's a Rat.
const TEXT =
  "Whenever this creature enters or attacks, create two 1/1 black Rat creature tokens with \"This token can't block.\" Then if you control five or more Rats, each Rat you control gets +2/+0 until end of turn.";

const RATS: EffectSpec = {
  kind: "sequence",
  effects: [
    { kind: "create-token", token: "Rat Token (Can't Block)", count: 2 },
    {
      kind: "conditional",
      condition: { kind: "controls", filter: { subtype: "Rat" }, atLeast: 5 },
      then: {
        kind: "modify-pt-all",
        filter: { subtype: "Rat", controlledBy: "you" },
        power: 2,
        toughness: 0,
        duration: "end-of-turn",
      },
    },
  ],
};

export default defineCard({
  name: "Ogre Chitterlord",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 6,
  toughness: 5,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    { trigger: { on: "enters-battlefield", who: "self" }, targets: [], effect: RATS, resolve: null, text: TEXT },
    { trigger: { on: "attacks", who: "self" }, targets: [], effect: RATS, resolve: null, text: TEXT },
  ],
});
