import { defineCard } from "../define.js";

// EDHREC rank 20079. Bone Devourer's enters-with replacement, gated the way
// Cruel Administrator's raid is: one counter if any creature (anyone's) died
// this turn, none otherwise.
const ENTER_TEXT = "This creature enters with a +1/+1 counter on it if a creature died this turn.";

export default defineCard({
  name: "Cackling Slasher",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Assassin"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTER_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: { ifCondition: { kind: "creature-died-this-turn" }, then: 1, else: 0 },
        },
      },
      text: ENTER_TEXT,
    },
  ],
});
