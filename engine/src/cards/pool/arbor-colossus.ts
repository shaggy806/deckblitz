import { defineCard } from "../define.js";

// EDHREC rank 20380.
//
// Rulings:
//   [2013-09-15] An ability that triggers when a creature becomes monstrous won't trigger if that
//     creature isn't on the battlefield when its monstrosity ability resolves.
//   [2013-09-15] Once a creature becomes monstrous, it can't become monstrous again. If the
//     creature is already monstrous when the monstrosity ability resolves, nothing happens.
//   [2013-09-15] Monstrous isn't an ability that a creature has. It's just something true about
//     that creature. If the creature stops being a creature or loses its abilities, it will
//     continue to be monstrous.

const MONSTROSITY_TEXT =
  "{3}{G}{G}{G}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const DESTROY_TEXT = "When this creature becomes monstrous, destroy target creature with flying an opponent controls.";

export default defineCard({
  name: "Arbor Colossus",
  manaCost: "{2}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Giant"],
  power: 6,
  toughness: 6,
  keywords: ["reach"],
  text: `Reach\n${MONSTROSITY_TEXT}\n${DESTROY_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{G}{G}{G}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", keyword: "flying" } }],
      effect: { kind: "destroy", target: 0 },
      resolve: null,
      text: DESTROY_TEXT,
    },
  ],
});
