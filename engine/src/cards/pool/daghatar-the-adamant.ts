import { defineCard } from "../define.js";

const MOVE = "{1}{B/G}{B/G}: Move a +1/+1 counter from target creature onto a second target creature.";

export default defineCard({
  name: "Daghatar the Adamant",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 0,
  toughness: 0,
  keywords: ["vigilance"],
  text: `Vigilance\nDaghatar enters with four +1/+1 counters on it.\n${MOVE}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 4 } },
      text: "Daghatar enters with four +1/+1 counters on it.",
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B/G}{B/G}", tap: false },
      targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 } }],
      effect: { kind: "move-counters", from: 0, to: 1, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: MOVE,
    },
  ],
});
