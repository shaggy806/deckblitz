import { defineCard } from "../define.js";

// Final Fantasy Commander (FIC). Each chapter picks its mode as it goes on the stack, before its
// targets, among the modes it could have (rules 603.3c, 700.2b). "Up to one target" can always be
// chosen, so the fight is always among them.

const HEAD = "I, II, III — Choose one at random —";
const COMBINE = "Combine Powers! — Put three +1/+1 counters on target creature.";
const DEFENSE = "Defense! — Put a shield counter on target creature. You gain 3 life.";
const FIGHT = "Fight! — This creature fights up to one target creature an opponent controls.";

export default defineCard({
  name: "Summon: Magus Sisters",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment", "creature"],
  subtypes: ["Saga", "Faerie"],
  power: 5,
  toughness: 5,
  keywords: ["haste"],
  text:
    "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n" +
    `${HEAD}\n• ${COMBINE}\n• ${DEFENSE}\n• ${FIGHT}\nHaste`,
  chapters: [
    {
      at: [1, 2, 3],
      targets: [],
      effect: {
        kind: "modal",
        announced: true,
        random: true,
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: COMBINE,
            targets: ["creature"],
            effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
          },
          {
            text: DEFENSE,
            targets: ["creature"],
            effect: {
              kind: "sequence",
              effects: [
                { kind: "add-counter", target: 0, counter: "shield", amount: 1 },
                { kind: "gain-life", amount: 3 },
              ],
            },
          },
          {
            text: FIGHT,
            targets: [{ kind: "optional", of: "creature-an-opponent-controls" }],
            effect: { kind: "fight", a: "source", b: 0 },
          },
        ],
      },
      resolve: null,
      text: HEAD,
    },
  ],
});
