import { defineCard } from "../define.js";

const TEXT = "Room abilities of dungeons you own trigger an additional time.";

export default defineCard({
  name: "Hama Pashar, Ruin Seeker",
  manaCost: "{1}{W}{U}",
  colors: ["W", "U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, doubleTriggers: { cause: "room" }, text: TEXT }],
});
