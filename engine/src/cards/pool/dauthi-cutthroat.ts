import { defineCard } from "../define.js";

// EDHREC rank 17492.
//
// Rulings:
//   [2021-03-19] Once a creature has been blocked, that creature remains blocked and will deal and
//     be dealt combat damage even if it gains or loses shadow or if the blocking creature gains or
//     loses shadow.
//   [2021-03-19] Multiple instances of shadow on the same creature are redundant.
//   [2021-03-19] If an attacking creature has multiple evasion abilities, such as shadow and
//     flying, a creature can block it only if that creature satisfies all of the appropriate
//     evasion abilities.
const ABILITY_TEXT = "{1}{B}, {T}: Destroy target creature with shadow.";

export default defineCard({
  name: "Dauthi Cutthroat",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Dauthi", "Minion"],
  power: 1,
  toughness: 1,
  keywords: ["shadow"],
  text: `Shadow (This creature can block or be blocked by only creatures with shadow.)\n${ABILITY_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "shadow" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: ABILITY_TEXT,
    },
  ],
});
