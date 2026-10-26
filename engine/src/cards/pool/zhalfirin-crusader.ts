import { defineCard } from "../define.js";

// EDHREC rank 29050.

export default defineCard({
  name: "Zhalfirin Crusader",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)\n{1}{W}: The next 1 damage that would be dealt to this creature this turn is dealt to any target instead.",
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: ["any-target"],
      // Rule 614.9: a redirection.
      effect: { kind: "prevent-damage", target: "source", amount: 1, redirectTo: 0 },
      resolve: null,
      text: "{1}{W}: The next 1 damage that would be dealt to this creature this turn is dealt to any target instead.",
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
