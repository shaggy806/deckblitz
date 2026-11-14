import { atLevel, classLevel } from "../helpers.js";
import { defineCard } from "../define.js";

// EDHREC rank 10170. A Class (rule 716). "Whenever one or more of your
// opponents are attacked" fires once for a declaration with a creature
// attacking one or more of them (rule 508.3b; Jolene, the Plunder Queen's
// `attack-with` shape), whoever attacks, and not for a planeswalker or battle
// attacked; X is counted as it resolves (the ruling).
const ENTER = "When this Class enters, each player creates a Food token.";
const ARTIFACT = "Whenever an artifact an opponent controls is put into a graveyard from the battlefield, draw a card.";
const ATTACKED =
  "Whenever one or more of your opponents are attacked, up to one target attacking creature gets +X/+X until end of turn, where X is the number of cards in your hand.";

export default defineCard({
  name: "Party Dude",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `(Gain the next level as a sorcery to add its ability.)\n${ENTER}\n{1}{G}: Level 2\n${ARTIFACT}\n{4}{G}: Level 3\n${ATTACKED}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Food Token", count: 1, who: "each-player" },
      resolve: null,
      text: ENTER,
    },
    atLevel(2, {
      trigger: { on: "dies", who: "any", filter: { type: "artifact", controlledBy: "opponent" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: ARTIFACT,
    }),
    atLevel(3, {
      trigger: { on: "attack-with", who: "any", atLeast: 1, filter: { attackingOpponent: true } },
      targets: [{ kind: "optional", of: { kind: "permanent", whose: "any", filter: { type: "creature", attacking: true } } }],
      effect: {
        kind: "modify-pt",
        target: 0,
        power: { cardsInHand: "you" },
        toughness: { cardsInHand: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: ATTACKED,
    }),
  ],
  activated: [classLevel(2, "{1}{G}"), classLevel(3, "{4}{G}")],
});
