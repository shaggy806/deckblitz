import { defineCard } from "../define.js";

// Reinforce (rule 702.77) is a hand ability that pays by
// discarding the card (`zone: "hand"`), its {X} Roaring Earth's.
const ENTERS_TEXT = "This creature enters with X +1/+1 counters on it.";
const REINFORCE_TEXT =
  "Reinforce X—{X}{G}{G} ({X}{G}{G}, Discard this card: Put X +1/+1 counters on target creature.)";

export default defineCard({
  name: "Wren's Run Hydra",
  manaCost: "{X}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hydra"],
  power: 0,
  toughness: 0,
  keywords: ["reach"],
  text: `Reach\n${ENTERS_TEXT}\n${REINFORCE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{X}{G}{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: "x" },
      resolve: null,
      text: REINFORCE_TEXT,
      zone: "hand",
    },
  ],
});
