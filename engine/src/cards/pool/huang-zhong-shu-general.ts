import { defineCard } from "../define.js";

// EDHREC rank 29409.

const TEXT = "Huang Zhong can't be blocked by more than one creature.";

export default defineCard({
  name: "Huang Zhong, Shu General",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: TEXT }],
});
