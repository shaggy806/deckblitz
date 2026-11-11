import { defineCard } from "../define.js";

const STATIC_TEXT = "Each creature you control assigns combat damage equal to its toughness rather than its power.";
const ATTACK_TEXT =
  "Whenever Rasaad yn Bashir attacks, if you have the initiative, double the toughness of each creature you control until end of turn.";

export default defineCard({
  name: "Rasaad yn Bashir",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 0,
  toughness: 3,
  pairing: { kind: "choose-a-background" },
  text: `${STATIC_TEXT}\n${ATTACK_TEXT}\nChoose a Background (You can have a Background as a second commander.)`,
  static: [{ affects: { scope: "creatures-you-control" }, combatDamageByToughness: "always", text: STATIC_TEXT }],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "initiative", who: "you" },
      targets: [],
      // Each gets +0/+X, X its own toughness as this resolves (its ruling).
      effect: {
        kind: "for-each-permanent",
        filter: { type: "creature", controlledBy: "you" },
        as: 0,
        effect: {
          kind: "modify-pt",
          target: 0,
          power: 0,
          toughness: { toughnessOf: 0, doubling: true },
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
