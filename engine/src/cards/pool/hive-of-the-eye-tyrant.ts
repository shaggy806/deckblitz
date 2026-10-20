import { defineCard } from "../define.js";

// EDHREC rank 7936.
//
// Den of the Bugbear's shape: the entry check doesn't count a land entering
// alongside (the ruling), and the granted attack trigger rides on the land's
// own modifiers until end of turn — activating twice grants it twice, each
// instance with its own target (the ruling).
const ENTRY_TEXT = "If you control two or more other lands, this land enters tapped.";
const ATTACK_TEXT = "Whenever this creature attacks, exile target card from defending player's graveyard.";
const ANIMATE_TEXT =
  "{3}{B}: Until end of turn, this land becomes a 3/3 black Beholder creature with menace and \"Whenever this creature attacks, exile target card from defending player's graveyard.\" It's still a land.";

export default defineCard({
  name: "Hive of the Eye Tyrant",
  colors: [],
  types: ["land"],
  text: `${ENTRY_TEXT}\n{T}: Add {B}.\n${ANIMATE_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        tappedUnless: { kind: "not", of: { kind: "controls", filter: { type: "land" }, atLeast: 2 } },
      },
      text: ENTRY_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "B", amount: 1 },
      resolve: null,
      text: "{T}: Add {B}.",
    },
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            kind: "animate",
            target: "source",
            power: 3,
            toughness: 3,
            addTypes: ["creature"],
            addSubtypes: ["Beholder"],
            setColors: ["B"],
            keywords: ["menace"],
            duration: "end-of-turn",
          },
          {
            kind: "grant-triggered",
            target: "source",
            duration: "end-of-turn",
            ability: {
              trigger: { on: "attacks", who: "self" },
              targets: [{ kind: "card-in-graveyard", whose: "defending-player" }],
              effect: { kind: "exile", target: 0 },
              resolve: null,
              text: ATTACK_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: ANIMATE_TEXT,
    },
  ],
});
