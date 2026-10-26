import { defineCard } from "../define.js";

// Eventide (EVE). EDHREC rank 10471.

const PT_TEXT = "This creature gets +4/+4 as long as you have 25 or more life.";

export default defineCard({
  name: "Divinity of Pride",
  manaCost: "{W/B}{W/B}{W/B}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Spirit", "Avatar"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `Flying, lifelink\n${PT_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "life-total", atLeast: 25 },
      grantPt: [4, 4],
      text: PT_TEXT,
    },
  ],
});
