import { defineCard } from "../define.js";

// EDHREC rank 23249. Battlebond.
//
// Rulings:
//   [2018-06-08] If you activate Brightling's last ability, you don't choose whether Brightling
//     gets +1/-1 or -1/+1 until that ability resolves.
// The last ability's choice is a `modal` effect, chosen as it resolves (Endling's shape).

const VIGILANCE = "{W}: This creature gains vigilance until end of turn.";
const LIFELINK = "{W}: This creature gains lifelink until end of turn.";
const BOUNCE = "{W}: Return this creature to its owner's hand.";
const SWAP = "{1}: This creature gets +1/-1 or -1/+1 until end of turn.";

export default defineCard({
  name: "Brightling",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  text: `${VIGILANCE}\n${LIFELINK}\n${BOUNCE}\n${SWAP}`,
  activated: [
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "vigilance", duration: "end-of-turn" },
      resolve: null,
      text: VIGILANCE,
    },
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "lifelink", duration: "end-of-turn" },
      resolve: null,
      text: LIFELINK,
    },
    {
      cost: { mana: "{W}", tap: false },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: BOUNCE,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: [],
      effect: {
        kind: "modal",
        minModes: 1,
        maxModes: 1,
        modes: [
          {
            text: "This creature gets +1/-1 until end of turn.",
            effect: { kind: "modify-pt", target: "source", power: 1, toughness: -1, duration: "end-of-turn" },
          },
          {
            text: "This creature gets -1/+1 until end of turn.",
            effect: { kind: "modify-pt", target: "source", power: -1, toughness: 1, duration: "end-of-turn" },
          },
        ],
      },
      resolve: null,
      text: SWAP,
    },
  ],
});
