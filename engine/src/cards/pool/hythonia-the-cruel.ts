import { defineCard } from "../define.js";

// EDHREC rank 17849.
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
  "{6}{B}{B}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const WRATH_TEXT = "When Hythonia becomes monstrous, destroy all non-Gorgon creatures.";

export default defineCard({
  name: "Hythonia the Cruel",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Gorgon"],
  power: 4,
  toughness: 6,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${MONSTROSITY_TEXT}\n${WRATH_TEXT}`,
  activated: [
    {
      cost: { mana: "{6}{B}{B}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", notSubtypes: ["Gorgon"] } },
      resolve: null,
      text: WRATH_TEXT,
    },
  ],
});
