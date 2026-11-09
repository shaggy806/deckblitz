/**
 * A target that an earlier step of the same resolution moved under another
 * name is a new object, no longer the one targeted (rule 400.7): Celestial
 * Gatekeeper's "exile it, then return up to two target … cards", targeting
 * itself, leaves it in exile. A step that named the slot first ("exile target
 * creature, then return it") still follows the object.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import type { ObjectRef } from "../effects.js";
import { A, activate, destroy, ref, settle, spawn, table, toGraveyard } from "./harness.js";

const TEXT = "When this creature dies, exile it, then return up to one target creature card from your graveyard to the battlefield.";
const gatekeeper = (name: string, exiled: ObjectRef) =>
  defineCard({
    name,
    manaCost: "{3}{W}{W}",
    types: ["creature"],
    subtypes: ["Bird", "Cleric"],
    power: 2,
    toughness: 2,
    text: TEXT,
    triggered: [
      {
        trigger: { on: "dies", who: "self" },
        targets: [{ kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "exile", target: exiled },
            { kind: "put-onto-battlefield", target: 0 },
          ],
        },
        resolve: null,
        text: TEXT,
      },
    ],
  });

const selfBlink = defineCard({
  name: "Test Self Blink",
  manaCost: "{1}",
  types: ["creature"],
  subtypes: ["Bird"],
  power: 1,
  toughness: 1,
  text: "{0}: Exile target creature, then return it to the battlefield.",
  activated: [
    {
      cost: { tap: false },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "exile", target: 0 },
          { kind: "put-onto-battlefield", target: 0 },
        ],
      },
      resolve: null,
      text: "{0}: Exile target creature, then return it to the battlefield.",
    },
  ],
});

const registry = () =>
  createDefaultRegistry()
    .register(gatekeeper("Test Gatekeeper Source", "source"))
    .register(gatekeeper("Test Gatekeeper Trigger", "trigger-object"))
    .register(selfBlink);

describe("a target moved earlier in the resolution (400.7)", () => {
  for (const name of ["Test Gatekeeper Source", "Test Gatekeeper Trigger"]) {
    it(`${name}: targeting itself, it's exiled and stays exiled`, () => {
      const { game, a } = table({ registry: registry() });
      const bird = spawn(game, name);
      a.chooseTargetsFn = () => [{ kind: "object", object: bird }];
      destroy(game, bird);
      settle(game);
      expect(game.state.objects[bird].zone).toBe("exile");
    });

    it(`${name}: targeting another card, that one comes back`, () => {
      const { game, a } = table({ registry: registry() });
      const bird = spawn(game, name);
      const bears = toGraveyard(game, "Grizzly Bears");
      a.chooseTargetsFn = () => [{ kind: "object", object: bears }];
      destroy(game, bird);
      settle(game);
      expect(game.state.objects[bird].zone).toBe("exile");
      expect(game.state.objects[bears].zone).toBe("battlefield");
    });
  }

  it("a step that names the slot first keeps following it, even when it's the source", () => {
    const { game } = table({ registry: registry() });
    const bird = spawn(game, "Test Self Blink");
    activate(game, bird, 0, { targets: [ref(bird)] });
    settle(game);
    expect(game.state.objects[bird].zone).toBe("battlefield");
    expect(game.state.objects[bird].owner).toBe(A);
  });
});
