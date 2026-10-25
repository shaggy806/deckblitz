import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// Zendikar (ZEN). EDHREC rank 19659. Murasa Pyromancer's shape, at a
// creature with flying.

const TEXT =
  "Whenever this creature or another Ally you control enters, you may have this creature deal damage to target creature with flying equal to the number of Allies you control.";

export default defineCard({
  name: "Tajuru Archer",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elf", "Archer", "Ally"],
  power: 1,
  toughness: 2,
  text: TEXT,
  triggered: [
    ...thisOrAnother({
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
      targets: [{ kind: "permanent", filter: { type: "creature", keyword: "flying" } }],
      effect: {
        kind: "may",
        prompt: "Have Tajuru Archer deal damage to the target creature equal to the number of Allies you control?",
        effect: { kind: "damage", amount: { countOf: { subtype: "Ally", controlledBy: "you" } }, target: 0 },
      },
      resolve: null,
      text: TEXT,
    }),
  ],
});
