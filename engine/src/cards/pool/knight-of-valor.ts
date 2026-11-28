import { defineCard } from "../define.js";

// EDHREC rank 28718. Baneblade Scoundrel's `modify-pt-all` over the creatures
// blocking this one, `notKeyword: "flanking"`, on an activation once each
// turn. Its ruling: the second ability isn't flanking, and an effect that
// removes flanking doesn't remove it.

const FLANKING = "Flanking (Whenever a creature without flanking blocks this creature, the blocking creature gets -1/-1 until end of turn.)";
const SHRINK = "{1}{W}: Each creature without flanking blocking this creature gets -1/-1 until end of turn. Activate only once each turn.";

export default defineCard({
  name: "Knight of Valor",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["flanking"],
  text: `${FLANKING}\n${SHRINK}`,
  triggered: [
    {
      trigger: { on: "blocked-by", who: "self", blocker: { notKeyword: "flanking" } },
      targets: [],
      effect: { kind: "modify-pt", target: "trigger-object", power: -1, toughness: -1, duration: "end-of-turn" },
      resolve: null,
      text: "Flanking",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{W}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", notKeyword: "flanking", blockingRelation: { relation: "blocking" } },
        power: -1,
        toughness: -1,
        duration: "end-of-turn",
      },
      oncePerTurn: true,
      resolve: null,
      text: SHRINK,
    },
  ],
});
