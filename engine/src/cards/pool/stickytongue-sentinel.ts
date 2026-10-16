import { defineCard } from "../define.js";

// EDHREC rank 9374. Bloomburrow. Exosuit Savior's bounce.
const TEXT = "When this creature enters, return up to one other target permanent you control to its owner's hand.";

export default defineCard({
  name: "Stickytongue Sentinel",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Frog", "Warrior"],
  power: 3,
  toughness: 3,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: { kind: "permanent", whose: "you", filter: {} } } }],
      effect: { kind: "return-to-hand", target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
