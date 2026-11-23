import { defineCard } from "../define.js";

// Playtest card. "Ready to run" is a partner-family ability (rule 702.124,
// the `partner-group` pairing): two commanders that both have it.

const ETB =
  'When The Bear Force Pilot Runner enters, create a 0/0 colorless Vehicle artifact token with flying, "This creature gets +1/+1 for each Bear you control," and crew 2.';

export default defineCard({
  name: "The Bear Force Pilot Runner",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Bear", "Pilot", "Gamer"],
  power: 2,
  toughness: 2,
  text: `${ETB}\nReady to run (You can have two commanders if both have ready to run.)`,
  pairing: { kind: "partner-group", group: "Ready to run" },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "0/0 Flying Bear Vehicle Token", count: 1 },
      resolve: null,
      text: ETB,
    },
  ],
});
