import { defineCard } from "../define.js";

// Legends (LEG). EDHREC rank 9132.
//
// Rulings:
//   [2004-10-04] The ability can be used on a creature without First Strike or Swampwalk but has
//     no effect.
//   [2009-10-01] Urborg's second ability affects only the first strike ability, not the part of
//     the double strike ability that acts like first strike.
//   [2009-10-01] You choose whether the targeted creature loses first strike or swampwalk as the
//     ability resolves. If the creature has both abilities, it will lose just one of them.
//
// "First strike or swampwalk" is a resolution-time `modal` (no `announced`),
// so the choice is made as the ability resolves (the ruling), over the one
// target. Double strike is its own keyword, untouched (the ruling).

const LOSE_TEXT = "{T}: Target creature loses first strike or swampwalk until end of turn.";

export default defineCard({
  name: "Urborg",
  colors: [],
  supertypes: ["legendary"],
  types: ["land"],
  text: `{T}: Add {B}.\n${LOSE_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: null, tap: true },
      targets: ["creature"],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "First strike",
            effect: { kind: "lose-keywords", target: 0, keywords: ["first-strike"], duration: "end-of-turn" },
          },
          {
            text: "Swampwalk",
            effect: { kind: "lose-keywords", target: 0, keywords: ["swampwalk"], duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: LOSE_TEXT,
    },
  ],
});
