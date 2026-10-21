import { defineCard } from "../define.js";
import { mentor } from "../helpers.js";

// EDHREC rank 12785. Guilds of Ravnica. Spiteful Sliver's damage echo, at a
// target player: it triggers even on lethal damage (the ruling).

const ECHO_TEXT = "Whenever this creature is dealt damage, it deals that much damage to target player.";

export default defineCard({
  name: "Truefire Captain",
  manaCost: "{R}{R}{W}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 4,
  toughness: 3,
  text: `Mentor (Whenever this creature attacks, put a +1/+1 counter on target attacking creature with lesser power.)\n${ECHO_TEXT}`,
  triggered: [
    mentor(),
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: ["player"],
      effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
      resolve: null,
      text: ECHO_TEXT,
    },
  ],
});
