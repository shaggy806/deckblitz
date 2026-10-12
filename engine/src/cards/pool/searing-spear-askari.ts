import { defineCard } from "../define.js";

export default defineCard({
  name: "Searing Spear Askari",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n{1}{R}: This creature gains menace until end of turn. (It can't be blocked except by two or more creatures.)",
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "menace", duration: "end-of-turn" },
      resolve: null,
      text: "{1}{R}: This creature gains menace until end of turn.",
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
