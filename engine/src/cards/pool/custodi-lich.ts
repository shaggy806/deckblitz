import { defineCard } from "../define.js";

const ENTERS_TEXT = "When this creature enters, you become the monarch.";
const MONARCH_TEXT = "Whenever you become the monarch, target player sacrifices a creature of their choice.";

// The generic `becomes-monarch` trigger (B278): only becoming it, not being
// it already (its ruling — `Game.setMonarch` announces no change).
export default defineCard({
  name: "Custodi Lich",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie", "Cleric"],
  power: 4,
  toughness: 2,
  text: `${ENTERS_TEXT}\n${MONARCH_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "become-monarch" },
      resolve: null,
      text: ENTERS_TEXT,
    },
    {
      trigger: { on: "event", event: "becomes-monarch", who: "you" },
      targets: ["player"],
      effect: { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      resolve: null,
      text: MONARCH_TEXT,
    },
  ],
});
