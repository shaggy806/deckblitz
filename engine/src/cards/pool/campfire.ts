import { defineCard } from "../define.js";

// Commander Masters. Campfire is exiled as a cost, so it isn't in the
// graveyard it shuffles. The commanders come from both zones at once, each
// one's owner free to put it in the command zone instead (rule 903.9b);
// then what's left of the graveyard is shuffled into the library.
const LIFE = "{1}, {T}: You gain 2 life.";
const GATHER =
  "{2}, {T}, Exile this artifact: Put all commanders you own from the command zone and from your graveyard into your hand. Then shuffle your graveyard into your library.";

export default defineCard({
  name: "Campfire",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: `${LIFE}\n${GATHER}`,
  activated: [
    {
      cost: { mana: "{1}", tap: true },
      targets: [],
      effect: { kind: "gain-life", amount: 2 },
      resolve: null,
      text: LIFE,
    },
    {
      cost: { mana: "{2}", tap: true, do: { kind: "exile", target: "source" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "return-from-graveyard",
            filter: { isCommander: true },
            destination: "hand",
            count: "all",
            from: "command-zone-and-graveyard",
          },
          { kind: "shuffle-graveyard-into-library", target: "you" },
        ],
      },
      resolve: null,
      text: GATHER,
    },
  ],
});
