import { defineCard } from "../define.js";

const COUNTER_TEXT = "{1}{G}: Move a +1/+1 counter from target creature onto another target creature with the same controller.";
const AURA_TEXT = "{1}{U}: Attach target Aura attached to a permanent to another permanent with the same controller.";

// The second ability targets only the Aura; the permanent it moves to is
// chosen as this resolves, under the controller of what it's on now, and
// not that one (the rulings).
export default defineCard({
  name: "Simic Guildmage",
  manaCost: "{G/U}{G/U}",
  colors: ["G", "U"],
  types: ["creature"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 2,
  text: `({G/U} can be paid with either {G} or {U}.)\n${COUNTER_TEXT}\n${AURA_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: ["creature", { kind: "other", of: "creature", than: { slot: 0 }, sameController: true }],
      effect: { kind: "move-counters", from: 0, to: 1, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      cost: { mana: "{1}{U}", tap: false },
      targets: [{ kind: "permanent", filter: { subtype: "Aura", attachedTo: {} } }],
      effect: {
        kind: "attach",
        attachment: 0,
        target: {
          among: { controlledByRef: { controllerOf: { hostOf: 0 } } },
          prompt: "Attach that Aura to another permanent with the same controller",
          another: true,
        },
      },
      resolve: null,
      text: AURA_TEXT,
    },
  ],
});
