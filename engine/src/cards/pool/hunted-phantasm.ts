import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). EDHREC rank 12527. The targeted opponent
// creates the tokens (Phelddagrif's `who: "target-controller"`).
const ETB_TEXT = "When this creature enters, target opponent creates five 1/1 red Goblin creature tokens.";

export default defineCard({
  name: "Hunted Phantasm",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 6,
  text: `This creature can't be blocked.\n${ETB_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: { kind: "create-token", token: "Goblin Token", count: 5, who: "target-controller" },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      grantKeywords: ["unblockable"],
      text: "This creature can't be blocked.",
    },
  ],
});
