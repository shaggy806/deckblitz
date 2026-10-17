import { defineCard } from "../define.js";

// Its power as the ability resolves; "excess" is beyond lethal for that
// creature (`excessToController`).

const ATTACK_TEXT =
  "Whenever this creature attacks, it deals damage equal to its power to up to one other target creature. Excess damage is dealt to that creature's controller instead.";

export default defineCard({
  name: "Ravenous Tyrannosaurus",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 6,
  toughness: 6,
  text: `Devour 3 (As this creature enters, you may sacrifice any number of creatures. It enters with three times that many +1/+1 counters on it.)\n${ATTACK_TEXT}`,
  devour: { multiplier: 3, filter: { type: "creature" } },
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "optional", of: { kind: "other", of: "creature" } }],
      effect: { kind: "damage", amount: { powerOf: "source" }, target: 0, excessToController: {} },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
