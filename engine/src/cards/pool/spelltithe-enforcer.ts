import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 8691.
//
// Isolation Cell's punisher: "that player" is the caster — the
// trigger-controller of a cast-spell trigger — who chooses whether to pay
// {1}, and otherwise sacrifices a permanent of their choice.

const TEXT =
  "Whenever an opponent casts a spell, that player sacrifices a permanent of their choice unless they pay {1}.";

export default defineCard({
  name: "Spelltithe Enforcer",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Elephant", "Wizard"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "opponent" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "trigger-controller",
        options: [{ pay: "{1}", text: "Pay {1}" }],
        otherwise: { kind: "sacrifice", who: "trigger-controller", filter: {}, count: 1 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
