import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). The token is 0/0 (the errata ruling).

const TEXT =
  'When The Bear Force Pilot enters the battlefield, create a 0/0 colorless artifact Vehicle token with flying, "This creature gets +1/+1 for each Bear you control," and crew 2.';

export default defineCard({
  name: "The Bear Force Pilot",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bear", "Pilot"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "0/0 Flying Bear Vehicle Token", count: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
