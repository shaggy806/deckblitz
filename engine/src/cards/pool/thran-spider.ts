import { defineCard } from "../define.js";

// EDHREC rank 10523.
//
// Bloodroot Apothecary's "you and target opponent each create" (one
// instruction, the tokens made together), with tapped Powerstones. The {7}
// ability is Tony Stark's look at four for an artifact.

const ENTERS_TEXT = "When this creature enters, you and target opponent each create a tapped Powerstone token.";
const LOOK_TEXT =
  "{7}: Look at the top four cards of your library. You may reveal an artifact card from among them and put it into your hand. Put the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Thran Spider",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Spider"],
  power: 2,
  toughness: 4,
  keywords: ["reach"],
  text: `Reach\n${ENTERS_TEXT} (It's an artifact with "{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.")\n${LOOK_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
          { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true, who: "target-controller" },
        ],
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{7}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 4,
        reveal: "chosen",
        min: 0,
        max: 1,
        filter: { type: "artifact" },
        destination: "hand",
        leftover: "bottom-random",
      },
      resolve: null,
      text: LOOK_TEXT,
    },
  ],
});
