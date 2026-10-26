import { defineCard } from "../define.js";

// The target is chosen as it triggers, the {2} paid (or not) as it resolves
// (its ruling); a creature that died alongside it may be the target.
const TEXT =
  "When this creature dies, you may pay {2}. If you do, return another target creature card from your graveyard to your hand.";

export default defineCard({
  name: "Carrion Thrash",
  manaCost: "{2}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["creature"],
  subtypes: ["Lizard", "Warrior"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "other", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }, than: "source" }],
      effect: {
        kind: "may",
        prompt: "Pay {2} to return another target creature card to your hand?",
        cost: "{2}",
        effect: { kind: "return-to-hand", target: 0, from: "graveyard" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
