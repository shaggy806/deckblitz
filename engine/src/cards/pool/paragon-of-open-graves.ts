import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 15089.

const ANTHEM = "Other black creatures you control get +1/+1.";
const ACTIVATED = "{2}{B}, {T}: Another target black creature you control gains deathtouch until end of turn.";

export default defineCard({
  name: "Paragon of Open Graves",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Skeleton", "Warrior"],
  power: 2,
  toughness: 2,
  text: `${ANTHEM}\n${ACTIVATED} (Any amount of damage it deals to a creature is enough to destroy it.)`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", colors: ["B"], controlledBy: "you" }, excludeSelf: true },
      grantPt: [1, 1],
      text: ANTHEM,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}{B}", tap: true },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { type: "creature", colors: ["B"] } } }],
      effect: { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
      resolve: null,
      text: ACTIVATED,
    },
  ],
});
