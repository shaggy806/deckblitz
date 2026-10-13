import { defineCard } from "../define.js";
import { GIFT_KICKER } from "../helpers.js";

// EDHREC rank 2405. Makes "2/2 Blue Bird Token".
//
// Gift an extra turn (rule 702.174): promised, the chosen opponent takes an
// extra turn after this one, given first as it resolves (702.174j). Then the
// four Birds — and, with the gift promised, every permanent you control phases
// out, the Birds too (rule 702.26b), and Teferi's Protection's "your life
// total can't change and you gain protection from everything" lasts until
// your next turn. Exiled as it resolves.
const TEXT =
  "Gift an extra turn (You may promise an opponent a gift as you cast this spell. If you do, they take an extra turn after this one.)\nCreate four 2/2 blue Bird creature tokens with flying. If the gift was promised, all permanents you control phase out, and until your next turn, your life total can't change and you gain protection from everything.\nExile Perch Protection.";

const BIRDS = { kind: "create-token", token: "2/2 Blue Bird Token", count: 4 } as const;

export default defineCard({
  name: "Perch Protection",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["instant"],
  text: TEXT,
  effect: BIRDS,
  kicker: {
    ...GIFT_KICKER,
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gift", gift: "extra-turn" },
        BIRDS,
        { kind: "phase-out", filter: { controlledBy: "you" } },
        {
          kind: "player-effect",
          duration: "until-your-next-turn",
          lifeCantChange: "you",
          protectionFromEverything: "you",
        },
      ],
    },
  },
  exileOnResolve: true,
});
