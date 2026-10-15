import { defineCard } from "../define.js";

// EDHREC rank 14749. Shredder, Unrelenting's enters half.

const ENTER_TEXT = "When this creature enters, another target creature you control gains deathtouch until end of turn.";

export default defineCard({
  name: "Blooming Stinger",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Plant", "Scorpion"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
