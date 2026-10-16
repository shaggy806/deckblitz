import { defineCard } from "../define.js";

// EDHREC rank 11615. Labyrinth Adversary's "whenever you attack, you may
// pay …. When you do" shape, paid in energy (`costEnergy`, offered only with
// {E}{E} to pay); the target is chosen as the reflexive ability goes on the
// stack (the ruling).
const ENTER_TEXT = "When this creature enters, you get {E}{E}{E} (three energy counters).";
const ATTACK_TEXT =
  "Whenever you attack, you may pay {E}{E}. When you do, target creature you control gains lifelink until end of turn.";

export default defineCard({
  name: "Riddle Gate Gargoyle",
  manaCost: "{W}{U}",
  colors: ["W", "U"],
  types: ["artifact", "creature"],
  subtypes: ["Gargoyle"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${ENTER_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "get-energy", amount: 3 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E} to have target creature you control gain lifelink until end of turn?",
        costEnergy: 2,
        effect: {
          kind: "reflexive-trigger",
          targets: ["creature-you-control"],
          effect: { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
          text: "When you do, target creature you control gains lifelink until end of turn.",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
