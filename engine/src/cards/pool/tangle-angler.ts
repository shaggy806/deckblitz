import { defineCard } from "../define.js";

// EDHREC rank 20787. Rampant Elephant's lure.

const LURE = "{G}: Target creature blocks this creature this turn if able.";

export default defineCard({
  name: "Tangle Angler",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Horror"],
  power: 1,
  toughness: 5,
  keywords: ["infect"],
  text: `Infect (This creature deals damage to creatures in the form of -1/-1 counters and to players in the form of poison counters.)\n${LURE}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false },
      targets: ["creature"],
      effect: { kind: "block-if-able", target: 0, attacker: "source" },
      resolve: null,
      text: LURE,
    },
  ],
});
