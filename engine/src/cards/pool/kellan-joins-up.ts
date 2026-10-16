import { defineCard } from "../define.js";

const PLOT_TEXT =
  "When Kellan Joins Up enters, you may exile a nonland card with mana value 3 or less from your hand. If you do, it becomes plotted.";
const LEGEND_TEXT =
  "Whenever a legendary creature you control enters, put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Kellan Joins Up",
  manaCost: "{G}{W}{U}",
  colors: ["W", "U", "G"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  text: `${PLOT_TEXT} (You may cast it as a sorcery on a later turn without paying its mana cost.)\n${LEGEND_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "exile",
        leftover: "stay",
        filter: { notTypes: ["land"], manaValue: { op: "lte", n: 3 } },
        then: { kind: "become-plotted", target: 0 },
      },
      resolve: null,
      text: PLOT_TEXT,
    },
    {
      trigger: {
        on: "enters-battlefield",
        who: "you-control",
        filter: { supertype: "legendary", type: "creature" },
      },
      targets: [],
      effect: {
        kind: "add-counter-all",
        filter: { type: "creature", controlledBy: "you" },
        counter: "+1/+1",
        amount: 1,
      },
      resolve: null,
      text: LEGEND_TEXT,
    },
  ],
});
