import { defineCard } from "../define.js";

// EDHREC rank 11691. The counters and tokens come as the reflexive ability
// resolves (its ruling).
const ZOMBIE_TEXT =
  "When you pay this cost one or more times, put that many +1/+1 counters on this creature, then create twice that many 2/2 black Zombie creature tokens with decayed.";
const ETB_TEXT = `When this creature enters, you may pay {2}{B} any number of times. ${ZOMBIE_TEXT}`;

export default defineCard({
  name: "Tainted Adversary",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ETB_TEXT} (A creature with decayed can't block. When it attacks, sacrifice it at end of combat.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {2}{B} any number of times for that many counters and twice that many Zombies?",
        cost: "{2}{B}",
        costTimes: true,
        effect: {
          kind: "reflexive-trigger",
          targets: [],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "add-counter", target: "source", counter: "+1/+1", amount: "x" },
              { kind: "create-token", token: "Zombie Token (Crowded Crypt)", count: { product: [2, "x"] } },
            ],
          },
          text: ZOMBIE_TEXT,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
