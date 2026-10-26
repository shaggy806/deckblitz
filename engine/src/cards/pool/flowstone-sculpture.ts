import { defineCard } from "../define.js";

// EDHREC rank 30325. The choice is made as the ability resolves (it isn't
// "choose one"), and a keyword gained lasts for as long as it stays on the
// battlefield.

const TEXT =
  "{2}, Discard a card: Put a +1/+1 counter on this creature or this creature gains flying, first strike, or trample. (This effect lasts indefinitely.)";

export default defineCard({
  name: "Flowstone Sculpture",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Shapeshifter"],
  power: 4,
  toughness: 4,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          { text: "Put a +1/+1 counter on it", effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 } },
          { text: "It gains flying", effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "permanent" } },
          { text: "It gains first strike", effect: { kind: "grant-keyword", target: "source", keyword: "first-strike", duration: "permanent" } },
          { text: "It gains trample", effect: { kind: "grant-keyword", target: "source", keyword: "trample", duration: "permanent" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
