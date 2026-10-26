import { defineCard } from "../define.js";

export default defineCard({
  name: "Zhalfirin Commander",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n{1}{W}{W}: Target Knight creature gets +1/+1 until end of turn.",
  activated: [
    {
      cost: { mana: "{1}{W}{W}", tap: false },
      targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", subtype: "Knight" } }],
      effect: { kind: "modify-pt", target: 0, power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: "{1}{W}{W}: Target Knight creature gets +1/+1 until end of turn.",
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
