import { defineCard } from "../define.js";

// EDHREC rank 9530.
//
// Rulings:
//   - The delayed triggered ability will trigger if a creature dealt damage by Ghired's
//     Belligerence dies for any reason this turn, not just due to lethal damage.
//   - You choose how the damage will be divided as you cast Ghired's Belligerence. Each
//     target creature must be assigned at least 1 damage.
//   - If a target creature becomes an illegal target in response to Ghired's
//     Belligerence, the damage that would have been dealt to that creature is lost.
//   - If you control no creature tokens when you populate, nothing will happen.
//
// X divided as it's cast, at least 1 to each target (rule 601.2d — Rolling Thunder's shape). The
// delayed ability watches each creature actually dealt damage (none prevented: rule 615.1) for
// this stint of it, firing once for each that dies this turn.

const DIES_TEXT = "Whenever a creature dealt damage this way dies this turn, populate.";

export default defineCard({
  name: "Ghired's Belligerence",
  manaCost: "{X}{R}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `Ghired's Belligerence deals X damage divided as you choose among any number of target creatures. ${DIES_TEXT} (Create a token that's a copy of a creature token you control.)`,
  targets: [{ kind: "any-number", of: "creature", max: "x" }],
  divided: { total: 0, slot: 0, x: true },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-divided", from: 0 },
      {
        kind: "delayed-trigger",
        at: { whenever: { on: "dies", who: "self" }, watching: { thisWay: "dealt-damage" } },
        effect: { kind: "populate" },
        text: DIES_TEXT,
      },
    ],
  },
});
