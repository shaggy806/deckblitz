import { defineCard } from "../define.js";

// EDHREC rank 26820.

const TEXT =
  "Whenever this creature blocks a creature, if at least one other Wall creature is blocking that creature and no non-Wall creatures are blocking that creature, this creature gains banding until end of turn. (If any creatures with banding you control are blocking a creature, you divide that creature's combat damage, not its controller, among any of the creatures it's being blocked by.)";

/** The creatures blocking the creature this one blocked (rule 509.1h), read
 * as the trigger fires and again as it resolves (rule 603.4). */
const blockingIt = { type: "creature", blockingRelation: { relation: "blocking", of: "trigger-object" } } as const;

export default defineCard({
  name: "Wall of Caltrops",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 2,
  toughness: 1,
  keywords: ["defender"],
  text: `Defender (This creature can't attack.)\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      condition: {
        kind: "all",
        of: [
          {
            kind: "amounts",
            left: { countOf: { ...blockingIt, subtype: "Wall", isSource: false } },
            op: "gte",
            right: 1,
          },
          { kind: "amounts", left: { countOf: { ...blockingIt, not: { subtype: "Wall" } } }, op: "eq", right: 0 },
        ],
      },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "banding", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
