import { defineCard } from "../define.js";

// Mystery Booster Commander. The opponent creates the Angel; it's goaded by
// you, Balefang's controller (Life of the Party's `goadedForGame`).
const NO_GAIN = "Players can't gain life.";
const ANGEL =
  "When Balefang enters, target opponent creates a tapped Baneslayer Angel token. The token is goaded for the rest of the game. (It's a {3}{W}{W} 5/5 Angel creature with flying, first strike, lifelink, and protection from Demons and from Dragons.)";

export default defineCard({
  name: "Balefang the Unslayable",
  manaCost: "{3}{R}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Demon", "Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying", "trample"],
  text: `Flying, trample, protection from Angels and from Archons\n${NO_GAIN}\n${ANGEL}`,
  static: [
    {
      affects: { scope: "self" },
      protection: { filter: { anyOf: [{ subtype: "Angel" }, { subtype: "Archon" }] } },
      text: "Protection from Angels and from Archons",
    },
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "any-player", prevent: true },
      text: NO_GAIN,
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "create-token",
        token: "Baneslayer Angel Token",
        count: 1,
        tapped: true,
        who: "target-controller",
        goadedForGame: true,
      },
      resolve: null,
      text: ANGEL,
    },
  ],
});
