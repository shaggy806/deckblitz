import { defineCard } from "../define.js";

const TEXT =
  "Whenever one or more creatures you control that entered this turn attack a player, target creature that player controls can't block this turn.";

export default defineCard({
  name: "Whirlwind, Killer Cyclone",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Mutant", "Villain"],
  power: 2,
  toughness: 3,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "attacks-player",
        who: "you",
        defender: "any",
        filter: { type: "creature", enteredThisTurn: true },
      },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { type: "creature" } }],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-block"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
