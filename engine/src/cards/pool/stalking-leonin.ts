import { defineCard } from "../define.js";

// The secret is only the opponent: any creature attacking you can be targeted,
// and whether it's that player's is read as this resolves, the choice shown by
// then (the cost).

const CHOOSE = "When this creature enters, secretly choose an opponent.";
const REVEAL =
  "Reveal the player you chose: Exile target creature that's attacking you if it's controlled by the chosen player. Activate only once.";

export default defineCard({
  name: "Stalking Leonin",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Archer"],
  power: 3,
  toughness: 3,
  text: `${CHOOSE}\n${REVEAL}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "choose-opponent", remember: true, secret: true, then: { kind: "sequence", effects: [] } },
      resolve: null,
      text: CHOOSE,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, revealChosen: true },
      onlyOnce: true,
      targets: [{ kind: "permanent", filter: { type: "creature", attackingYou: true } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { controlledBy: "chosen-player" } },
        then: { kind: "exile", target: 0 },
      },
      resolve: null,
      text: REVEAL,
    },
  ],
});
