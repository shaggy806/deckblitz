import { defineCard } from "../define.js";

// EDHREC rank 23242.

const DISGUISE =
  "Disguise {R/W}{R/W} (You may cast this card face down for {3} as a 2/2 creature with ward {2}. Turn it face up any time for its disguise cost.)";
const FACE_UP_TEXT = "When this creature is turned face up, create two tapped 1/1 white Dog creature tokens.";

export default defineCard({
  name: "Dog Walker",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 1,
  keywords: ["vigilance"],
  text: `Vigilance\n${DISGUISE}\n${FACE_UP_TEXT}`,
  morph: { keyword: "disguise", cost: "{R/W}{R/W}" },
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "1/1 White Dog Token", count: 2, tapped: true },
      resolve: null,
      text: FACE_UP_TEXT,
    },
  ],
});
