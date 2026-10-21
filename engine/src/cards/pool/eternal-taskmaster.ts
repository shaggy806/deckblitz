import { defineCard } from "../define.js";

const ATTACK_TEXT =
  "Whenever this creature attacks, you may pay {2}{B}. If you do, return target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Eternal Taskmaster",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  text: `This creature enters tapped.\n${ATTACK_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", tapped: true },
      text: "This creature enters tapped.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} to return target creature card to your hand?",
        cost: "{2}{B}",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
