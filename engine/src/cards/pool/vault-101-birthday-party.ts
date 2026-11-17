import { defineCard } from "../define.js";

// EDHREC rank 11780.
//
// Rulings:
//   [2024-03-08] An Aura put onto the battlefield this way doesn't target anything (so it could be
//     attached to an opponent's permanent with hexproof, for example), but the Aura's enchant
//     ability restricts what it can be attached to. If the Aura can't legally be attached to
//     anything, you can't choose to put it onto the battlefield at all.
//
// I: the two tokens are created together. II, III: one choice over hand and graveyard together
// (`from: "hand-or-graveyard"`, up to one). An Aura's controller chooses what it enchants as it
// enters (rule 303.4f, the `choose-enchant` decision) — not targeted, so hexproof doesn't stop it;
// one with nothing it could enchant stays where it was (303.4g), the same as putting nothing.
// "You may attach it to a creature you control" is chosen as it resolves, none at all included,
// and only after an Equipment was put onto the battlefield this way (Armored Skyhunter's shape).

const I_TEXT =
  'I — Create a 1/1 white Human Soldier creature token and a Food token. (A Food token is an artifact with "{2}, {T}, Sacrifice this token: You gain 3 life.")';
const II_TEXT =
  "II, III — You may put an Aura or Equipment card from your hand or graveyard onto the battlefield. If an Equipment is put onto the battlefield this way, you may attach it to a creature you control.";

export default defineCard({
  name: "Vault 101: Birthday Party",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [],
      effect: {
        kind: "sequence",
        simultaneous: true,
        effects: [
          { kind: "create-token", token: "Human Soldier Token", count: 1 },
          { kind: "create-token", token: "Food Token", count: 1 },
        ],
      },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2, 3],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "return-from-graveyard",
            filter: { subtypes: ["Aura", "Equipment"] },
            destination: "battlefield",
            count: 1,
            upTo: true,
            from: "hand-or-graveyard",
          },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "put-onto-battlefield", filter: { subtype: "Equipment" }, atLeast: 1 },
            then: {
              kind: "choose-permanents",
              filter: { type: "creature", controlledBy: "you" },
              min: 0,
              upTo: 1,
              prompt: "Choose a creature you control to attach the Equipment to (or none)",
              then: {
                kind: "attach",
                target: 0,
                attachment: { all: { subtype: "Equipment", thisWay: "put-onto-battlefield" } },
              },
            },
          },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
  ],
});
