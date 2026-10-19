import { defineCard } from "../define.js";

// EDHREC rank 24836. Streets of New Capenna.
//
// Rulings:
//   [2022-04-29] You make the choice of first strike or lifelink only once, as Ballroom
//     Brawlers's triggered ability resolves. Both creatures gain the chosen ability.
//
// One choice on resolution (a `modal` effect, not modes chosen as it
// triggers), each mode granting the keyword to both creatures.
const TEXT =
  "Whenever this creature attacks, this creature and up to one other target creature you control both gain your choice of first strike or lifelink until end of turn.";

const both = (keyword: "first-strike" | "lifelink") =>
  ({
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: "source", keyword, duration: "end-of-turn" },
      { kind: "grant-keyword", target: 0, keyword, duration: "end-of-turn" },
    ],
  }) as const;

export default defineCard({
  name: "Ballroom Brawlers",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature-you-control" } }],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "First strike", effect: both("first-strike") },
          { text: "Lifelink", effect: both("lifelink") },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
