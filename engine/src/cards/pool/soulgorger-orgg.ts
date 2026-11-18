import { defineCard } from "../define.js";

// Judgment (JUD). EDHREC rank 16102.
//
// "All but 1 life" is life total minus 1, never below 0 (rule 107.1b: with
// 1 life or less you lose none). The life actually lost — after anything
// that changed the loss — is noted on this creature as its enters ability
// resolves (`note`), and its leaves ability gains that much, read off the
// creature as it last existed (rule 608.2h). If it leaves before its enters
// ability resolves, nothing was noted and the leaves ability gains nothing;
// the enters ability still takes the life when it resolves. A new object
// (rule 400.7) notes its own.
const ENTERS = "When this creature enters, you lose all but 1 life.";
const LEAVES = "When this creature leaves the battlefield, you gain life equal to the life you lost when it entered.";

export default defineCard({
  name: "Soulgorger Orgg",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Nightmare", "Orgg"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${ENTERS}\n${LEAVES}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: { difference: [{ lifeTotal: "you" }, 1] } },
          { kind: "note", amount: { lifeLostThisWay: true, who: "you" } },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { chosenNumber: true } },
      resolve: null,
      text: LEAVES,
    },
  ],
});
