import { defineCard } from "../define.js";

// EDHREC rank 9940.

const ENTER_TEXT =
  "When Spiders-Man enters, if they were cast using web-slinging, you gain 3 life and create two 2/1 green Spider creature tokens with reach.";

export default defineCard({
  name: "Spiders-Man, Heroic Horde",
  manaCost: "{1}{G}",
  colors: ["G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spider", "Hero"],
  power: 2,
  toughness: 3,
  webSlinging: { cost: "{4}{G}{G}" },
  text: `Web-slinging {4}{G}{G} (You may cast this spell for {4}{G}{G} if you also return a tapped creature you control to its owner's hand.)\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // How the spell it was cast as was cast (rule 702.188a): `castVia`,
      // kept by the permanent — an intervening if (603.4).
      condition: { kind: "source", filter: { castVia: "web-slinging" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 3 },
          { kind: "create-token", token: "2/1 Green Spider Token (Reach)", count: 2 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
