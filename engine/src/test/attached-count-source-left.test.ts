/**
 * "For each Equipment attached to [this]", counted by an ability whose source has left before it
 * resolves: rule 608.2h reads the source as it last existed, so the count is what was attached
 * then. By now the Equipment is unattached (704.5n) and an Aura is in a graveyard (704.5m), so the
 * board alone says 0.
 */
import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";

import { A, B, ref, settle, spawn, table, tokensNamed, hand } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const TEXT = "At the beginning of your upkeep, draw a card for each Aura and Equipment attached to this creature.";
const counter = defineCard({
  name: "Test Attachment Counter",
  manaCost: "{1}",
  types: ["creature"],
  subtypes: ["Human"],
  power: 1,
  toughness: 1,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "draw", amount: { countOf: { subtypes: ["Aura", "Equipment"], attachedTo: { isSource: true } } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
const registry = createDefaultRegistry().register(counter);

/** Attached by hand: the test is about what's counted, not how it got there. */
const attach = (game: Game, what: ObjectId, to: ObjectId): void => {
  game.state.objects[what].attachedTo = to;
};
/** Runs to alice's next upkeep with the trigger on the stack. */
const toTrigger = (game: Game): void => {
  game.advanceUntil((s) => s.zones.shared.stack.length > 0);
};
const removeInResponse = (game: Game, id: ObjectId, kind: "destroy" | "exile" = "destroy"): void => {
  game.debugApplyEffect(B, { kind, target: 0 }, [ref(id)]);
};

describe("a count of what's attached to a source that has left (rule 608.2h)", () => {
  it("Kemba's upkeep trigger makes a Cat for each Equipment that was on her", () => {
    const { game } = table();
    const kemba = spawn(game, "Kemba, Kha Regent");
    attach(game, spawn(game, "Short Sword"), kemba);
    attach(game, spawn(game, "Bonesplitter"), kemba);
    toTrigger(game);
    removeInResponse(game, kemba);
    settle(game);
    expect(game.state.objects[kemba].zone).toBe("graveyard");
    expect(tokensNamed(game, "Cat Token", A)).toBe(2);
  });

  it("still counts as it is when she's there", () => {
    const { game } = table();
    const kemba = spawn(game, "Kemba, Kha Regent");
    attach(game, spawn(game, "Short Sword"), kemba);
    spawn(game, "Bonesplitter");
    toTrigger(game);
    settle(game);
    expect(tokensNamed(game, "Cat Token", A)).toBe(1);
  });

  it("counts an Aura that went to the graveyard with its host, and an Equipment that stayed", () => {
    const { game } = table({ registry });
    const source = spawn(game, "Test Attachment Counter");
    const aura = spawn(game, "Holy Strength");
    attach(game, aura, source);
    const sword = spawn(game, "Short Sword");
    attach(game, sword, source);
    toTrigger(game);
    const before = hand(game).length;
    removeInResponse(game, source, "exile");
    settle(game);
    expect(game.state.objects[aura].zone).toBe("graveyard");
    expect(game.state.objects[sword].zone).toBe("battlefield");
    expect(hand(game).length).toBe(before + 2);
  });
});
