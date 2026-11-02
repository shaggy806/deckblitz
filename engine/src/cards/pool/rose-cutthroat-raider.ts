import { defineCard } from "../define.js";

const RAID =
  "Raid — At end of combat on your turn, if you attacked this turn, create a Junk token for each opponent you attacked. (It's an artifact with \"{T}, Sacrifice this token: Exile the top card of your library. You may play that card this turn. Activate only as a sorcery.\")";
const JUNK = "Whenever you sacrifice a Junk, add {R}.";

export default defineCard({
  name: "Rose, Cutthroat Raider",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["artifact", "creature"],
  supertypes: ["legendary"],
  subtypes: ["Robot"],
  power: 3,
  toughness: 2,
  keywords: ["first-strike"],
  text: `First strike\n${RAID}\n${JUNK}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end-combat", who: "you" },
      condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "create-token", token: "Junk Token", count: { turnStat: "opponents-attacked" } },
      resolve: null,
      text: RAID,
    },
    {
      trigger: { on: "sacrifice", who: "you", filter: { subtype: "Junk" } },
      targets: [],
      effect: { kind: "add-mana", mana: "R", amount: 1 },
      resolve: null,
      text: JUNK,
    },
  ],
});
