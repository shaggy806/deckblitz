import { defineCard } from "../define.js";

// EDHREC rank 5214. The land is mandatory when one is revealed (min 1); the
// dies trigger targets "another" card — the Cavalier's own card in the
// graveyard isn't a legal target (Dutiful Attendant's shape) — and moves it
// only if the Cavalier was exiled (Greenwarden of Murasa's shape).

const ENTER_TEXT =
  "When this creature enters, reveal the top five cards of your library. Put a land card from among them onto the battlefield and the rest into your graveyard.";
const DIES_TEXT =
  "When this creature dies, you may exile it. If you do, put another target card from your graveyard on top of your library.";

export default defineCard({
  name: "Cavalier of Thorns",
  manaCost: "{2}{G}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental", "Knight"],
  power: 5,
  toughness: 6,
  keywords: ["reach"],
  text: `Reach\n${ENTER_TEXT}\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "library",
        count: 5,
        reveal: true,
        min: 1,
        max: 1,
        filter: { type: "land" },
        destination: "battlefield",
        leftover: "graveyard",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "dies", who: "self" },
      targets: [{ kind: "other", of: { kind: "card-in-graveyard", whose: "you" }, than: "source" }],
      effect: {
        kind: "may",
        prompt: "Exile Cavalier of Thorns to put the target card on top of your library?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: "trigger-object" },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled" },
              then: { kind: "put-on-library", target: 0, position: "top" },
            },
          ],
        },
      },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
