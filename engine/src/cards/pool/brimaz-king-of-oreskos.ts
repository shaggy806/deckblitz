import { defineCard } from "../define.js";

const ATTACK_TEXT = "Whenever Brimaz attacks, create a 1/1 white Cat Soldier creature token with vigilance that's attacking.";
const BLOCK_TEXT = "Whenever Brimaz blocks a creature, create a 1/1 white Cat Soldier creature token with vigilance that's blocking that creature.";

export default defineCard({
  name: "Brimaz, King of Oreskos",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Cat", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: "Vigilance\n" + ATTACK_TEXT + "\n" + BLOCK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Cat Soldier Token (Vigilance)", count: 1, attacking: "choose" },
      resolve: null,
      text: ATTACK_TEXT,
    },
    {
      trigger: { on: "blocks", who: "self", object: "blocked" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Cat Soldier Token (Vigilance)", count: 1, separate: true },
          { kind: "enter-blocking", blocker: "created", attacker: "trigger-object" },
        ],
      },
      resolve: null,
      text: BLOCK_TEXT,
    },
  ],
});
