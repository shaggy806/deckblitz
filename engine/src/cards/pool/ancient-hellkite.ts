import { defineCard } from "../define.js";

// EDHREC rank 20162. Magic 2011. Ruling: activatable from its declaration as
// an attacker through end of combat — the source's "attacking" condition.
const PING = "{R}: This creature deals 1 damage to target creature defending player controls. Activate only if this creature is attacking.";

export default defineCard({
  name: "Ancient Hellkite",
  manaCost: "{4}{R}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 6,
  toughness: 6,
  keywords: ["flying"],
  text: `Flying\n${PING}`,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      condition: { kind: "source", filter: { attacking: true } },
      targets: ["creature-defending-player-controls"],
      effect: { kind: "damage", amount: 1, target: 0 },
      resolve: null,
      text: PING,
    },
  ],
});
