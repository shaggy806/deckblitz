import { defineCard } from "../define.js";

// EDHREC rank 9397.
const ATTACK = "Whenever this creature attacks, another target creature you control gains deathtouch until end of turn.";

export default defineCard({
  name: "Flesh Burrower",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ATTACK}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: ATTACK,
    },
  ],
});
