import { defineCard } from "../define.js";

// An intervening "if" (rule 603.4): not enchanted as it attacks, no trigger;
// not enchanted as it resolves, nothing happens (the ruling).
const ATTACK_TEXT = "Whenever Krond attacks, if it's enchanted, exile target permanent.";

export default defineCard({
  name: "Krond the Dawn-Clad",
  manaCost: "{G}{G}{G}{W}{W}{W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Archon"],
  power: 6,
  toughness: 6,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "source", filter: { enchanted: true } },
      targets: ["permanent"],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
