import { defineCard } from "../define.js";

const DIES =
  "When Gerrard dies, exile it and return to the battlefield all artifact and creature cards in your graveyard that were put there from the battlefield this turn.";

export default defineCard({
  name: "Gerrard, Weatherlight Hero",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 3,
  toughness: 3,
  keywords: ["first-strike"],
  text: `First strike\n${DIES}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      // Gerrard is exiled first, so he isn't among the cards returned; the
      // return happens even if he has already left the graveyard (rulings).
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: "trigger-object" },
          {
            kind: "return-from-graveyard",
            filter: { typesAnyOf: ["artifact", "creature"], putIntoGraveyardThisTurn: { from: ["battlefield"] } },
            destination: "battlefield",
            count: "all",
          },
        ],
      },
      resolve: null,
      text: DIES,
    },
  ],
});
