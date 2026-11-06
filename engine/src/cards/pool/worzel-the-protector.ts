import { defineCard } from "../define.js";

// Mystery Booster Commander.
const ZERO = "0: Create a 1/1 white Cat creature token with \"{T}: Put a loyalty counter on each planeswalker you control.\"";
const MINUS_ONE =
  "−1: Look at the top six cards of your library. You may reveal a planeswalker or basic Plains card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";
const MINUS_EIGHT = "−8: Create ten Scryb Sprites tokens. (They're {G} 1/1 Faerie creatures with flying.)";

export default defineCard({
  name: "Worzel, the Protector",
  manaCost: "{1}{W}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Worzel"],
  loyalty: 4,
  canBeCommander: true,
  text: `${ZERO}\n${MINUS_ONE}\n${MINUS_EIGHT}\nWorzel, the Protector can be your commander.`,
  activated: [
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Cat Token (Loyalty Counters)", count: 1 },
      resolve: null,
      text: ZERO,
    },
    {
      loyaltyCost: -1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 6,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { anyOf: [{ type: "planeswalker" }, { type: "land", supertype: "basic", subtype: "Plains" }] },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: MINUS_ONE,
    },
    {
      loyaltyCost: -8,
      cost: { mana: null, tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Scryb Sprites Token", count: 10 },
      resolve: null,
      text: MINUS_EIGHT,
    },
  ],
});
