import { defineCard } from "../define.js";

export default defineCard({
  name: "Zhalfirin Knight",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n{W}{W}: This creature gains first strike until end of turn.",
  activated: [
    {
      cost: { mana: "{W}{W}", tap: false },
      targets: [],
      effect: {
        kind: "grant-keyword",
        target: "source",
        keyword: "first-strike",
        duration: "end-of-turn",
      },
      resolve: null,
      text: "{W}{W}: This creature gains first strike until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "trigger-object",
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      resolve: null,
      text: "Flanking",
    },
  ],
});
