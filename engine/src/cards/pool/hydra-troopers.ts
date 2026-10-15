import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "When this creature enters, create a tapped 2/1 black Villain creature token with menace if there are two or more creature cards in your graveyard. Otherwise, mill two cards.";

export default defineCard({
  name: "HYDRA Troopers",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Villain"],
  power: 3,
  toughness: 2,
  text: `${ENTERS_TEXT} (Put the top two cards of your library into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Not an intervening "if" (it isn't right after "When …"): the
      // graveyard is checked as the trigger resolves (rule 608.2c).
      effect: {
        kind: "conditional",
        condition: { kind: "cards-in-graveyard", atLeast: 2, filter: { type: "creature" } },
        then: { kind: "create-token", token: "Villain Token", count: 1, tapped: true },
        else: { kind: "mill", target: "you", amount: 2 },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
