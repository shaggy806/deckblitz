import { defineCard } from "../define.js";

// The type is kept as this enchantment's chosen creature type, hidden until the
// cost shows it. The sacrifice beside the reveal leaves the ability reading the
// choice as this enchantment last existed (rule 608.2h).

const ENTERS =
  "When this enchantment enters, create a 1/1 white Human creature token, a 1/1 blue Merfolk creature token, and a 1/1 red Goblin creature token. Then secretly choose Human, Merfolk, or Goblin.";
const REVEAL =
  "Sacrifice this enchantment, Reveal the creature type you chose: If target attacking creature token is the chosen type, put three +1/+1 counters on it and it gains deathtouch until end of turn.";

export default defineCard({
  name: "A Killer Among Us",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: `${ENTERS}\n${REVEAL}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "create-token", token: "Human Token", count: 1 },
          { kind: "create-token", token: "Merfolk Token", count: 1 },
          { kind: "create-token", token: "Goblin Token", count: 1 },
          {
            kind: "choose-creature-type",
            options: ["Human", "Merfolk", "Goblin"],
            prompt: "Secretly choose a creature type",
            remember: true,
            secret: true,
            then: { kind: "sequence", effects: [] },
          },
        ],
      },
      resolve: null,
      text: ENTERS,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self", revealChosen: true },
      targets: [{ kind: "permanent", filter: { type: "creature", attacking: true, token: true } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target", index: 0, filter: { ofChosenType: true } },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 },
            { kind: "grant-keyword", target: 0, keyword: "deathtouch", duration: "end-of-turn" },
          ],
        },
      },
      resolve: null,
      text: REVEAL,
    },
  ],
});
