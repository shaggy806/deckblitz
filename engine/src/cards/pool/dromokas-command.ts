import { defineCard } from "../define.js";

// The first mode prevents only what the spell itself deals (the ruling): the
// spell is the source, as Hallow's.
const PREVENT = "Prevent all damage target instant or sorcery spell would deal this turn.";
const SACRIFICE = "Target player sacrifices an enchantment of their choice.";
const COUNTER = "Put a +1/+1 counter on target creature.";
const FIGHT = "Target creature you control fights target creature you don't control.";

export default defineCard({
  name: "Dromoka's Command",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["instant"],
  text: `Choose two —\n• ${PREVENT}\n• ${SACRIFICE}\n• ${COUNTER}\n• ${FIGHT}`,
  targets: [],
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: PREVENT,
        targets: ["instant-or-sorcery-spell"],
        effect: { kind: "damage-rule", by: { target: 0 } },
      },
      {
        text: SACRIFICE,
        targets: ["player"],
        effect: { kind: "sacrifice", who: "target", filter: { type: "enchantment" }, count: 1 },
      },
      {
        text: COUNTER,
        targets: ["creature"],
        effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      },
      {
        text: FIGHT,
        targets: ["creature-you-control", "creature-an-opponent-controls"],
        effect: { kind: "fight", a: 0, b: 1 },
      },
    ],
  },
});
