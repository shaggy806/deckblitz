import { defineCard } from "../define.js";

const RAD_TEXT = "Whenever this creature deals combat damage to a player, they get four rad counters.";
// Once per nonland card milled, whoever milled it — four at once is four
// triggers (the card's ruling; rule 603.2c).
const MILL_TEXT = "Whenever a player mills a nonland card, you gain 1 life.";

export default defineCard({
  name: "Glowing One",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Zombie", "Mutant"],
  power: 2,
  toughness: 2,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${RAD_TEXT}\n${MILL_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: { kind: "add-player-counters", counter: "rad", amount: 4, who: "trigger-player" },
      resolve: null,
      text: RAD_TEXT,
    },
    {
      trigger: { on: "mills", who: "any", filter: { notTypes: ["land"] }, perCard: true },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
