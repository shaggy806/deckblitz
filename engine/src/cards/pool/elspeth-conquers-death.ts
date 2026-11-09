import { defineCard } from "../define.js";

// EDHREC rank 3152. Chapter II's tax is a timed static, lasting past the Saga
// (the ruling). Chapter III's counter is chosen after it has entered (the
// ruling): a +1/+1 counter or a loyalty counter on either card type.
const I_TEXT = "I — Exile target permanent an opponent controls with mana value 3 or greater.";
const II_TEXT = "II — Noncreature spells your opponents cast cost {2} more to cast until your next turn.";
const III_TEXT = "III — Return target creature or planeswalker card from your graveyard to the battlefield. Put a +1/+1 counter or a loyalty counter on it.";

export default defineCard({
  name: "Elspeth Conquers Death",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: `(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\n${I_TEXT}\n${II_TEXT}\n${III_TEXT}`,
  chapters: [
    {
      at: [1],
      targets: [{ kind: "permanent", whose: "opponent", filter: { manaValue: { op: "gte", n: 3 } } }],
      effect: { kind: "exile", target: 0 },
      resolve: null,
      text: I_TEXT,
    },
    {
      at: [2],
      targets: [],
      effect: {
        kind: "timed-static",
        duration: "until-your-next-turn",
        text: "Noncreature spells your opponents cast cost {2} more to cast until your next turn.",
        static: [
          {
            affects: { scope: "self" },
            costModification: { applies: { notTypes: ["creature"] }, increaseGeneric: 2, when: { caster: "opponent" } },
            text: "Noncreature spells your opponents cast cost {2} more to cast.",
          },
        ],
      },
      resolve: null,
      text: II_TEXT,
    },
    {
      at: [3],
      targets: [{ kind: "card-in-graveyard", whose: "you", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "put-onto-battlefield", target: 0 },
          {
            kind: "modal",
            minModes: 1,
            maxModes: 1,
            modes: [
              { text: "Put a +1/+1 counter on it.", effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 } },
              { text: "Put a loyalty counter on it.", effect: { kind: "add-counter", target: 0, counter: "loyalty", amount: 1 } },
            ],
          },
        ],
      },
      resolve: null,
      text: III_TEXT,
    },
  ],
});
