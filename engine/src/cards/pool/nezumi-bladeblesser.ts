import { defineCard } from "../define.js";

const DEATHTOUCH_TEXT = "This creature has deathtouch as long as you control an artifact.";
const MENACE_TEXT = "This creature has menace as long as you control an enchantment.";

export default defineCard({
  name: "Nezumi Bladeblesser",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Rat", "Samurai"],
  power: 3,
  toughness: 2,
  text: `${DEATHTOUCH_TEXT}\n${MENACE_TEXT} (It can't be blocked except by two or more creatures.)`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "artifact" }, atLeast: 1 },
      grantKeywords: ["deathtouch"],
      text: DEATHTOUCH_TEXT,
    },
    {
      affects: { scope: "self" },
      condition: { kind: "controls", filter: { type: "enchantment" }, atLeast: 1 },
      grantKeywords: ["menace"],
      text: MENACE_TEXT,
    },
  ],
});
