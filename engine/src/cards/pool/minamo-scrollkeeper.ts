import { defineCard } from "../define.js";

const HAND_TEXT = "Your maximum hand size is increased by one.";

export default defineCard({
  name: "Minamo Scrollkeeper",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  keywords: ["defender"],
  text: `Defender\n${HAND_TEXT}`,
  static: [{ affects: { scope: "self" }, maxHandSize: { who: "you", adjust: 1 }, text: HAND_TEXT }],
});
