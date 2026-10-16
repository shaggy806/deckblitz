import { defineCard } from "../define.js";
import { squadTrigger } from "../helpers.js";

// Squad on an enchantment: each token copy is an Endless Foot Assault with
// its own attack trigger. The Ninjas come for each opponent, attacked or not
// (the ruling), each attacking that player; they were never declared as
// attackers, so "whenever a creature attacks" doesn't see them.
const SQUAD_TEXT =
  "Squad {1}{W} (As an additional cost to cast this spell, you may pay {1}{W} any number of times. When this enchantment enters, create that many tokens that are copies of it.)";
const ATTACK_TEXT =
  "Whenever you attack, for each opponent, create a 1/1 black Ninja creature token that's tapped and attacking that player.";

export default defineCard({
  name: "Endless Foot Assault",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["enchantment"],
  kicker: { cost: "{1}{W}", multi: true, keyword: "squad" },
  text: `${SQUAD_TEXT}\n${ATTACK_TEXT}`,
  triggered: [
    {
      ...squadTrigger(),
      text: "When this enchantment enters, if its squad cost was paid, create a token that's a copy of it for each time its squad cost was paid.",
    },
    {
      trigger: { on: "attack-with", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "create-token",
          token: "Ninja Token (Dark Leo & Shredder)",
          count: 1,
          tapped: true,
          attacking: { player: "that-player" },
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
