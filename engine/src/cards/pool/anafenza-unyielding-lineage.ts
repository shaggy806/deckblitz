import { defineCard } from "../define.js";

// EDHREC rank 7704.
// Makes Spirit → "Spirit Token (Anafenza, Unyielding Lineage)" (a 2/2 white Spirit).
//
// Rulings:
//   [2025-04-04] If Anafenza dies at the same time as one or more other nontoken creatures you
//     control, Anafenza's last ability triggers for each of those other nontoken creatures.
//   [2025-04-04] You choose whether to put +1/+1 counters on the creature or create a Spirit token
//     as the ability that includes the endure instruction is resolving.
//   [2025-04-04] If you can't put +1/+1 counters on the creature for any reason as an endure
//     ability resolves (for example, if the creature is no longer on the battlefield), you'll just
//     create a Spirit token.

const SPIRIT = { kind: "create-token", token: "Spirit Token (Anafenza, Unyielding Lineage)", count: 1 } as const;

export default defineCard({
  name: "Anafenza, Unyielding Lineage",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["flash", "first-strike"],
  text: "Flash\nFirst strike\nWhenever another nontoken creature you control dies, Anafenza endures 2. (Put two +1/+1 counters on it or create a 2/2 white Spirit creature token.)",
  triggered: [
    {
      trigger: {
        on: "dies",
        who: "you-control",
        filter: { token: false, type: "creature" },
        otherOnly: true,
      },
      targets: [],
      // Endure 2 (rule 701.63): fabricate's shape — the choice only while
      // Anafenza is still on the battlefield, otherwise just the Spirit.
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "modal",
          minModes: 1,
          maxModes: 1,
          modes: [
            {
              text: "Put two +1/+1 counters on Anafenza.",
              effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 2 },
            },
            { text: "Create a 2/2 white Spirit creature token.", effect: SPIRIT },
          ],
        },
        else: SPIRIT,
      },
      resolve: null,
      text: "Whenever another nontoken creature you control dies, Anafenza endures 2.",
    },
  ],
});
