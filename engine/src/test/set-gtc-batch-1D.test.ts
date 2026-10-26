/**
 * Gatecrash (GTC; B176), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

type BlockOffer = Extract<LegalAction, { kind: "declare-blockers" }>;

describe("Experiment One", () => {
  it("removes two +1/+1 counters to regenerate itself", () => {
    const { game } = table();
    const one = spawn(game, "Experiment One");
    game.state.objects[one].counters["+1/+1"] = 2;
    activate(game, one, 0);
    expect(counters(game, one)).toBe(0);
    destroy(game, one);
    expect(zone(game, one)).toBe("battlefield");
    expect(game.state.objects[one].tapped).toBe(true);
  });
});

describe("Hindervines", () => {
  it("prevents combat damage only from creatures with no +1/+1 counters", () => {
    const { game, a } = table();
    const plain = spawn(game, "Grizzly Bears");
    const grown = spawn(game, "Grizzly Bears");
    game.state.objects[grown].counters["+1/+1"] = 1;
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Hindervines"));
    attack(game, a, [plain, grown]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Spire Tracer", () => {
  it("can be blocked only by creatures with flying or reach", () => {
    const { game, a } = table();
    const tracer = spawn(game, "Spire Tracer");
    const bears = spawn(game, "Grizzly Bears", B);
    const spider = spawn(game, "Giant Spider", B);
    const drake = spawn(game, "Wind Drake", B);
    a.declareAttackersFn = () => [{ attacker: tracer, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    const offer = game.legalActions(B).find((o): o is BlockOffer => o.kind === "declare-blockers");
    const canBlock = (blocker: ObjectId): readonly ObjectId[] =>
      offer?.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];
    expect(canBlock(bears)).toEqual([]);
    expect(canBlock(spider)).toEqual([tracer]);
    expect(canBlock(drake)).toEqual([tracer]);
  });
});

describe("Coerced Confession", () => {
  it("draws one card per creature card milled", () => {
    const { game } = table();
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Forest", B);
    toLibrary(game, "Hill Giant", B);
    lands(game, "Island", 5);
    const before = hand(game).length;
    cast(game, toHand(game, "Coerced Confession"), { targets: [ref(B)] });
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Leyline Phantom", () => {
  it("returns to its owner's hand after dealing combat damage", () => {
    const { game, a } = table();
    const phantom = spawn(game, "Leyline Phantom");
    attack(game, a, [phantom]);
    expect(life(game, B)).toBe(15);
    expect(zone(game, phantom)).not.toBe("battlefield");
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Leyline Phantom")).toBe(true);
  });
});

describe("Hellraiser Goblin", () => {
  it("gives your creatures haste, not the opponent's", () => {
    const { game } = table();
    spawn(game, "Hellraiser Goblin");
    const mine = spawn(game, "Grizzly Bears", A, { sick: true });
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, mine).has("haste")).toBe(true);
    expect(keywords(game, theirs).has("haste")).toBe(false);
  });
});

describe("Nimbus Swimmer", () => {
  it("enters with X +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const card = toHand(game, "Nimbus Swimmer");
    cast(game, card, { x: 2 });
    expect(zone(game, card)).toBe("battlefield");
    expect(counters(game, card)).toBe(2);
  });
});
