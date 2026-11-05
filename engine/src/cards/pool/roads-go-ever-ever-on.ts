import { defineCard } from "../define.js";

const I = "I — Search your library for up to two basic Plains cards, exile them, then shuffle. You gain 2 life.";
const II_III = "II, III — Put a card exiled with this Saga into its owner's hand.";
const IV =
  "IV — Whenever you attack this turn, target creature you control gets +1/+1 until end of turn for each Plains you control.";
const ATTACK = "Whenever you attack this turn, target creature you control gets +1/+1 until end of turn for each Plains you control.";
const PLAINS = { countOf: { subtype: "Plains", controlledBy: "you" } } as const;

// Chapter IV sets up a delayed ability for the rest of the turn, which goes on
// after the Saga is sacrificed; it targets as it triggers, each attack.
export default defineCard({
  name: "Roads Go Ever, Ever On",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)\n${I}\n${II_III}\n${IV}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "search-library",
            filter: { supertype: "basic", subtype: "Plains" },
            destination: "exile",
            linked: true,
            min: 0,
            max: 2,
          },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: I,
    },
    {
      at: [2, 3],
      targets: [],
      effect: { kind: "look-and-choose", zone: "exiled-with-source", min: 1, max: 1, destination: "hand", leftover: "stay" },
      resolve: null,
      text: II_III,
    },
    {
      at: [4],
      targets: [],
      effect: {
        kind: "delayed-trigger",
        at: {
          whenever: { on: "attack-with", who: "you", atLeast: 1 },
          targets: ["creature-you-control"],
        },
        effect: { kind: "modify-pt", target: 0, power: PLAINS, toughness: PLAINS, duration: "end-of-turn" },
        text: ATTACK,
      },
      resolve: null,
      text: IV,
    },
  ],
});
