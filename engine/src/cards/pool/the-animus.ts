import { defineCard } from "../define.js";

// It copies what's printed on the exiled card and nothing else; with either target
// illegal as it resolves, nothing happens (the rulings).
const END_TEXT = "At the beginning of your end step, exile up to one target legendary creature card from a graveyard with a memory counter on it.";
const COPY_TEXT =
  "{T}: Until your next turn, target legendary creature you control becomes a copy of target creature card in exile with a memory counter on it. Activate only as a sorcery.";

export default defineCard({
  name: "The Animus",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${END_TEXT}\n${COPY_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "any", filter: { type: "creature", supertype: "legendary" } } }],
      effect: { kind: "exile", target: 0, withCounters: { kind: "memory", amount: 1 } },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [
        { kind: "permanent", filter: { type: "creature", supertype: "legendary", controlledBy: "you" } },
        { kind: "card-in-exile", filter: { type: "creature", counters: { kind: "memory", compare: { op: "gte", n: 1 } } } },
      ],
      effect: { kind: "become-copy", target: 0, of: 1, ofCard: true, until: "until-your-next-turn" },
      sorcerySpeed: true,
      resolve: null,
      text: COPY_TEXT,
    },
  ],
});
