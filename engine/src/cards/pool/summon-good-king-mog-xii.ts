import { defineCard } from "../define.js";

// EDHREC rank 4784. Chapters II, III set up a this-turn "whenever", not tied to
// the Saga (it may be gone by then); the token copied is chosen as it resolves.

const CHAPTER_ONE = "I — Create two 1/2 white Moogle creature tokens with lifelink.";
const CHAPTER_TWO_THREE = "II, III — Whenever you cast a noncreature spell this turn, create a token that's a copy of a non-Saga token you control.";
const CHAPTER_FOUR = "IV — Put two +1/+1 counters on each other Moogle you control.";

export default defineCard({
  name: "Summon: Good King Mog XII",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Moogle"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "lifelink"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${CHAPTER_ONE}\n${CHAPTER_TWO_THREE}\n${CHAPTER_FOUR}\nFlying, lifelink`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: { kind: "create-token", token: "Moogle Token", count: 2 },
      resolve: null,
      text: CHAPTER_ONE,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: { whenever: { on: "cast-spell", who: "you", filter: { notTypes: ["creature"] } } },
        effect: {
          kind: "choose-permanents",
          filter: { token: true, notSubtypes: ["Saga"], controlledBy: "you" },
          upTo: 1,
          min: 1,
          prompt: "Create a token that's a copy of a non-Saga token you control.",
          then: { kind: "create-token-copy", of: 0, count: 1, who: "you" },
        },
        text: "Create a token that's a copy of a non-Saga token you control.",
      },
      resolve: null,
      text: CHAPTER_TWO_THREE,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { subtype: "Moogle", controlledBy: "you" },
        counter: "+1/+1",
        amount: 2,
        exceptSource: true,
      },
      resolve: null,
      text: CHAPTER_FOUR,
    },
  ],
});
