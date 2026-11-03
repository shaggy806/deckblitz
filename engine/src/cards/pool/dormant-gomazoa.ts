import { defineCard } from "../define.js";

// Rise of the Eldrazi.
//
// "Whenever you become the target of a spell": a `becomes-target` trigger for its controller as a
// player alone (`player: "you"`, `playerOnly`), spells only (`spellOnly`), anyone's.

const UNTAP_TEXT = "This creature doesn't untap during your untap step.";
const TRIGGER_TEXT = "Whenever you become the target of a spell, you may untap this creature.";

export default defineCard({
  name: "Dormant Gomazoa",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Jellyfish"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\nThis creature enters tapped.\n${UNTAP_TEXT}\n${TRIGGER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
    { affects: { scope: "self" }, doesntUntap: true, text: UNTAP_TEXT },
  ],
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", player: "you", playerOnly: true, spellOnly: true },
      targets: [],
      effect: { kind: "may", prompt: "Untap Dormant Gomazoa?", effect: { kind: "untap", target: "source" } },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
