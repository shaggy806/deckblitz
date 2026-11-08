import { defineCard } from "../define.js";

// "Can't attack Jaces you control": planeswalkers matching a filter from this
// effect's controller's side, for the creatures that opponent controls. The
// opponent can still attack you, or another planeswalker of yours.

const TAX =
  "At the beginning of combat on each opponent's turn, they may pay {2}. If they don't, creatures they control can't attack Jaces you control this turn.";
const PLUS = "+1: Draw two cards, then put a card from your hand on the bottom of your library.";
const MINUS =
  "−3: Exile another target planeswalker or creature you control. Reveal cards from the top of your library until you reveal a creature or planeswalker card. Put that card onto the battlefield and the rest on the bottom of your library in a random order.";

export default defineCard({
  name: "Jace, Multiverse Architect",
  manaCost: "{1}{W}{U}{B}{R}",
  colors: ["W", "U", "B", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Jace"],
  loyalty: 4,
  canBeCommander: true,
  text: `${TAX}\n${PLUS}\n${MINUS}\nJace, Multiverse Architect can be your commander.`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "opponent" },
      targets: [],
      effect: {
        kind: "unless",
        chooser: "active-player",
        options: [{ pay: "{2}", text: "Pay {2}" }],
        otherwise: {
          kind: "restrict",
          filter: { type: "creature", controlledBy: "you" },
          sideOf: "active-player",
          restrictions: [{ kind: "cant-attack", at: { planeswalkers: { type: "planeswalker", subtype: "Jace", controlledBy: "you" } } }],
          duration: "end-of-turn",
        },
      },
      resolve: null,
      text: TAX,
    },
  ],
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 2 },
          { kind: "look-and-choose", zone: "hand", min: 1, max: 1, destination: "library-bottom", leftover: "stay" },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      loyaltyCost: -3,
      cost: { mana: null, tap: false },
      targets: [{ kind: "other", of: { kind: "permanent", whose: "you", filter: { typesAnyOf: ["planeswalker", "creature"] } } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          { kind: "reveal-until", filter: { typesAnyOf: ["creature", "planeswalker"] }, put: "battlefield", rest: "bottom-random" },
        ],
      },
      resolve: null,
      text: MINUS,
    },
  ],
});
