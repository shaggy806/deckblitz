import { defineCard } from "../define.js";

// Prophecy. EDHREC rank 28429. The defending player (the attack trigger's
// player) chooses whether to pay as the trigger resolves.

const TEXT =
  "Whenever this creature attacks, defending player may pay {4}. If that player doesn't, this creature can't be blocked this turn.";

export default defineCard({
  name: "Shrouded Serpent",
  manaCost: "{4}{U}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-player",
        options: [{ pay: "{4}", text: "Pay {4}" }],
        otherwise: { kind: "restrict", target: "source", restrictions: ["cant-be-blocked"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
