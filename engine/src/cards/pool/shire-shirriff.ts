import { defineCard } from "../define.js";

const ENTER_TEXT =
  "When this creature enters, you may sacrifice a token. When you do, exile target creature an opponent controls until this creature leaves the battlefield.";

// Rulings: "when you do" is a reflexive ability (rule 603.12), its target
// chosen once the token is sacrificed; with Shire Shirriff gone by then — or
// by the time that ability resolves — nothing is exiled (rule 610.3a, the
// `untilSourceLeaves` check), though the token can still be sacrificed.
export default defineCard({
  name: "Shire Shirriff",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Halfling", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "you",
        options: [{ sacrifice: { token: true }, text: "Sacrifice a token" }],
        ifDid: {
          kind: "reflexive-trigger",
          targets: ["creature-an-opponent-controls"],
          effect: { kind: "exile", target: 0, untilSourceLeaves: true },
          text: "When you do, exile target creature an opponent controls until this creature leaves the battlefield.",
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
