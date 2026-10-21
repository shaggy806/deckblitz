import { defineCard } from "../define.js";

// EDHREC rank 17155. Battlebond. "Your team" is "you" outside a team game
// (rule 102.4).
//
// "This creature or another Warrior" is one ability with two events: this
// creature entering (whatever its types then), and another Warrior you
// control entering — two entries, counted as one (`sameAbilityAs`).
const TEXT =
  "Whenever this creature or another Warrior your team controls enters, target opponent loses 1 life and you gain 1 life.";
const DRAIN = {
  kind: "sequence",
  effects: [
    { kind: "lose-life", amount: 1, target: 0 },
    { kind: "gain-life", amount: 1 },
  ],
} as const;

export default defineCard({
  name: "Thrasher Brute",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Orc", "Warrior"],
  power: 4,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      sameAbilityAs: 1,
      targets: ["opponent"],
      effect: DRAIN,
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Warrior" }, otherOnly: true },
      sameAbilityAs: 0,
      targets: ["opponent"],
      effect: DRAIN,
      resolve: null,
      text: TEXT,
    },
  ],
});
