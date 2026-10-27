import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 10903.
//
// "Target opponent creates" — Hunted Bonebrute's shape: the tokens go to the
// targeted opponent (`who: "target-controller"`).

const ETB_TEXT = "When this creature enters, target opponent creates four 1/1 blue Faerie creature tokens with flying.";
const REGEN_TEXT = "{G}: Regenerate this creature.";

export default defineCard({
  name: "Hunted Troll",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Warrior"],
  power: 8,
  toughness: 4,
  text: `${ETB_TEXT}\n${REGEN_TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: REGEN_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Faerie Token", count: 4, who: "target-controller" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
