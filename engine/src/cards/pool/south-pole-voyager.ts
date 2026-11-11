import { defineCard } from "../define.js";
import { thisOrAnother } from "../helpers.js";

// EDHREC rank 5271. "This creature or another Ally" is the helper's two
// triggers, counted as the one ability they are for "the second time this
// ability has resolved this turn" (`sameAbilityAs`).
const TEXT =
  "Whenever this creature or another Ally you control enters, you gain 1 life. If this is the second time this ability has resolved this turn, draw a card.";

export default defineCard({
  name: "South Pole Voyager",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Scout", "Ally"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: thisOrAnother({
    trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Ally" } },
    targets: [],
    effect: {
      kind: "sequence",
      effects: [
        { kind: "gain-life", amount: 1 },
        {
          kind: "conditional",
          condition: { kind: "resolved-this-turn", n: 2 },
          then: { kind: "draw", amount: 1 },
        },
      ],
    },
    resolve: null,
    text: TEXT,
  }).map((ability, i) => (i === 0 ? ability : { ...ability, sameAbilityAs: 0 })),
});
