import { defineCard } from "../define.js";

// EDHREC rank 8830. The life is counted as the attack trigger resolves, every
// attacking creature (Wingmate Roc itself included while it's still there —
// the ruling).

const RAID_TEXT =
  "Raid — When this creature enters, if you attacked this turn, create a 3/4 white Bird creature token with flying.";
const ATTACK_TEXT = "Whenever this creature attacks, you gain 1 life for each attacking creature.";

export default defineCard({
  name: "Wingmate Roc",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${RAID_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Bird Token (White 3/4)", count: 1 },
      resolve: null,
      text: RAID_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", attacking: true } } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
