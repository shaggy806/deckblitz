import { defineCard } from "../define.js";

// EDHREC rank 25723. Hexgold Slith's "you may pay … If you do, it gains …",
// paid in mana.

const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {1}. If you do, it gains indestructible until end of turn.";

export default defineCard({
  name: "Estwald Shieldbasher",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 4,
  toughness: 2,
  text: `${ATTACK_TEXT} (Damage and effects that say "destroy" don't destroy it.)`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1} to give this creature indestructible until end of turn?",
        cost: "{1}",
        effect: { kind: "grant-keyword", target: "source", keyword: "indestructible", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
