import { defineCard } from "../define.js";

const TEXT =
  "Whenever one or more Villains you control deal combat damage to a player, gain control of target noncreature, nonland permanent that player controls until the end of your next turn. It gains \"This permanent can't be sacrificed\" until the end of your next turn.";

export default defineCard({
  name: "Stilt-Man, Towering Terror",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Rogue", "Villain"],
  power: 4,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "you-control", filter: { subtype: "Villain" }, combat: true },
      targets: [{ kind: "permanent", whose: "trigger-player", filter: { notTypes: ["creature", "land"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-control", target: 0, untilEndOfTurn: false, until: "until-end-of-your-next-turn" },
          { kind: "cant-be-sacrificed", target: 0, duration: "until-end-of-your-next-turn" },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
