import { defineCard } from "../define.js";

// EDHREC rank 12080. Chapter II's vigilance counter goes on a creature you
// control chosen as it resolves — not a target — after the Cat Warrior is
// made, so the new token may be the one.
export default defineCard({
  name: "Ajani Fells the Godsire",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI — Exile target creature an opponent controls with power 3 or greater.\nII — Create a 2/1 white Cat Warrior creature token, then put a vigilance counter on a creature you control.\nIII — Target creature you control gains double strike until end of turn.",
  chapters: [
    {
      at: [1],
      targets: [{ kind: "permanent", whose: "opponent", filter: { type: "creature", power: { op: "gte", n: 3 } } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: "I — Exile target creature an opponent controls with power 3 or greater.",
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Cat Warrior Token (Ajani Fells the Godsire)", count: 1 },
          {
            kind: "choose-permanents",
            filter: { type: "creature", controlledBy: "you" },
            min: 1,
            upTo: 1,
            then: { kind: "add-counter", target: 0, counter: "vigilance", amount: 1 },
            prompt: "Put a vigilance counter on a creature you control",
          },
        ],
      },
      resolve: null,
      text: "II — Create a 2/1 white Cat Warrior creature token, then put a vigilance counter on a creature you control.",
    },
    {
      at: [3],
      targets: ["creature-you-control"],
      effect: { kind: "grant-keyword", target: 0, keyword: "double-strike", duration: "end-of-turn" },
      resolve: null,
      text: "III — Target creature you control gains double strike until end of turn.",
    },
  ],
});
