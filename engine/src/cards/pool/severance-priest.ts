import { defineCard } from "../define.js";

// EDHREC rank 24391. The two abilities are linked (rule 607.2a): the chosen card
// is exiled with this stint, and Skyclave Apparition's leaves trigger reads it
// back. With nothing exiled, nobody creates a token (the ruling).
const ENTER_TEXT =
  "When this creature enters, target opponent reveals their hand. You may choose a nonland card from it. If you do, exile that card.";
const LEAVE_TEXT =
  "When this creature leaves the battlefield, the exiled card's owner creates an X/X white Spirit creature token, where X is the mana value of the exiled card.";
const X = { aggregate: "sum", of: "mana-value", filter: {}, in: "exiled-with-source" } as const;

export default defineCard({
  name: "Severance Priest",
  manaCost: "{W}{B}{G}",
  colors: ["W", "B", "G"],
  types: ["creature"],
  subtypes: ["Djinn", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["deathtouch"],
  text: `Deathtouch\n${ENTER_TEXT}\n${LEAVE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["opponent"],
      effect: {
        kind: "discard-chosen",
        target: 0,
        filter: { notTypes: ["land"] },
        optional: true,
        destination: "exile",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "owners-of-exiled-with-source",
        effect: {
          kind: "create-token",
          token: "Spirit Token (Abzan Monument)",
          count: 1,
          who: "that-player",
          basePt: { power: X, toughness: X },
        },
      },
      resolve: null,
      text: LEAVE_TEXT,
    },
  ],
});
