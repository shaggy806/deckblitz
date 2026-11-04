/**
 * "That token" and "those creatures" are the tokens this resolution made, never
 * an older identical one. A new token can fold into a stack of those older ones,
 * a representation only (see `GameObject.stackCount`), so the read has to come
 * out the same as if it hadn't.
 */
import { describe, expect, it } from "vitest";

import { ScriptedController } from "../controller.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, cast, keywords, lands, named, nextTurn, ref, spawn, table, toGraveyard, toHand, toLibrary, tokensNamed } from "./harness.js";

const ELF = "Elf Warrior Token";
const ROBOT = "Robot Warrior Token";

/** An older token (or `n`), made as any effect makes one. */
const older = (game: Game, token: string, n = 1): void =>
  game.debugApplyEffect(A, { kind: "create-token", token, count: n }, []);

/** How many tokens named `token` `has` says yes to, a stack as every token in it. */
const tokensWhere = (game: Game, token: string, has: (id: ObjectId) => boolean): number =>
  named(game, token, A)
    .filter(has)
    .reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);

/** Leave a clashed card on top. */
function answerClash(seat: ScriptedController): void {
  seat.chooseModesFn = (_view, min, _max, texts) => {
    const at = texts.findIndex((t) => t.startsWith("Leave it on top"));
    return at >= 0 ? [at] : Array.from({ length: Math.max(min, 1) }, (_u, i) => i);
  };
}

describe("an effect reading the tokens made this way, with an older identical token about", () => {
  it("Retrieve the Esper's counters go on the new token alone", () => {
    const { game } = table();
    older(game, ROBOT);
    lands(game, "Island", 6);
    const esper = toGraveyard(game, "Retrieve the Esper");
    cast(game, esper, { via: "flashback" });
    expect(tokensNamed(game, ROBOT, A)).toBe(2);
    expect(tokensWhere(game, ROBOT, (id) => (game.state.objects[id].counters["+1/+1"] ?? 0) === 2)).toBe(1);
    expect(tokensWhere(game, ROBOT, (id) => (game.state.objects[id].counters["+1/+1"] ?? 0) === 0)).toBe(1);
  });

  it("Gilt-Leaf Ambush's deathtouch reaches the two it made, not the older Elf", () => {
    const { game, a, b } = table();
    older(game, ELF);
    answerClash(a);
    answerClash(b);
    toLibrary(game, "Colossal Dreadmaw"); // Alice wins the clash: Wastes on top of Bob's
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Gilt-Leaf Ambush"));
    expect(tokensNamed(game, ELF, A)).toBe(3);
    expect(tokensWhere(game, ELF, (id) => keywords(game, id).has("deathtouch"))).toBe(2);
  });

  it("Case of the Stashed Skeleton suspects only what it made", () => {
    const { game } = table();
    older(game, "2/1 Black Skeleton Token");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Case of the Stashed Skeleton"));
    expect(tokensNamed(game, "2/1 Black Skeleton Token", A)).toBe(2);
    expect(tokensWhere(game, "2/1 Black Skeleton Token", (id) => game.state.objects[id].suspectedAt !== undefined)).toBe(1);
  });

  it("a batch big enough to be a stack of its own keeps every token, apart from the older stack", () => {
    const { game } = table();
    older(game, ROBOT, 3);
    const make: EffectSpec = {
      kind: "sequence",
      effects: [
        { kind: "create-token", token: ROBOT, count: 500 },
        { kind: "add-counter-all", filter: { thisWay: "created" }, counter: "+1/+1", amount: 1 },
      ],
    };
    game.debugApplyEffect(A, make, []);
    expect(tokensNamed(game, ROBOT, A)).toBe(503);
    expect(tokensWhere(game, ROBOT, (id) => (game.state.objects[id].counters["+1/+1"] ?? 0) === 1)).toBe(500);
    expect(tokensWhere(game, ROBOT, (id) => (game.state.objects[id].counters["+1/+1"] ?? 0) === 0)).toBe(3);
  });

  it("\"all other creatures\" spares the new ones, not the older ones they'd have joined", () => {
    const { game } = table();
    older(game, ROBOT, 2);
    const make: EffectSpec = {
      kind: "sequence",
      effects: [
        { kind: "create-token", token: ROBOT, count: 1 },
        { kind: "destroy-all", filter: { type: "creature", notThisWay: "created" } },
      ],
    };
    game.debugApplyEffect(A, make, []);
    expect(tokensNamed(game, ROBOT, A)).toBe(1);
  });

  it("a count of the tokens made this way is what was made", () => {
    const { game } = table();
    older(game, ROBOT, 2);
    const make: EffectSpec = {
      kind: "sequence",
      effects: [
        { kind: "create-token", token: ROBOT, count: 1 },
        { kind: "gain-life", amount: { countOf: { thisWay: "created" } } },
      ],
    };
    const before = game.state.players[A].life;
    game.debugApplyEffect(A, make, []);
    expect(game.state.players[A].life).toBe(before + 1);
  });

  it("the tokens fold together again at cleanup, when nothing tells them apart", () => {
    const { game } = table();
    older(game, ROBOT, 8);
    const make: EffectSpec = {
      kind: "sequence",
      effects: [
        { kind: "create-token", token: ROBOT, count: 2 },
        { kind: "gain-life", amount: { countOf: { thisWay: "created" } } },
      ],
    };
    game.debugApplyEffect(A, make, []);
    expect(named(game, ROBOT, A).length).toBeGreaterThan(1);
    expect(tokensNamed(game, ROBOT, A)).toBe(10);
    nextTurn(game);
    expect(tokensNamed(game, ROBOT, A)).toBe(10);
    expect(named(game, ROBOT, A)).toHaveLength(1);
  });
});

describe("a delayed trigger about the tokens made this way", () => {
  it("Force of Rage's sacrifice takes both it made, not one target for the stack they joined", () => {
    const { game } = table();
    older(game, "3/1 Red Elemental Token");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Force of Rage"));
    expect(tokensNamed(game, "3/1 Red Elemental Token", A)).toBe(3);
    nextTurn(game);
    nextTurn(game, "draw");
    expect(tokensNamed(game, "3/1 Red Elemental Token", A)).toBe(1);
  });
});

describe("token copies", () => {
  /** Alice's tokens `has` says yes to, a stack as every token in it. */
  const copiesWhere = (game: Game, has: (id: ObjectId) => boolean): number =>
    game.battlefield
      .filter((id) => game.state.objects[id].isToken && game.state.objects[id].controller === A && has(id))
      .reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
  /** Applied Geometry's copy, with nothing read after it. */
  const fractal = (bears: ObjectId): [EffectSpec, TargetRef[]] => [
    { kind: "create-token-copy", of: 0, count: 1, who: "you", exceptions: { basePt: [0, 0], addTypes: ["creature"], addSubtypes: ["Fractal"] } },
    [ref(bears)],
  ];

  it("folds an older identical copy with a new one when nothing reads the new one", () => {
    // What the next test stands on: without it, that one passes for nothing.
    const { game } = table();
    spawn(game, "Glorious Anthem");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, ...fractal(bears));
    game.debugApplyEffect(A, ...fractal(bears));
    expect(game.battlefield.filter((id) => game.state.objects[id].isToken)).toHaveLength(1);
    expect(copiesWhere(game, () => true)).toBe(2);
  });

  it("Applied Geometry's counters go on the copy it made, not an older identical one", () => {
    const { game } = table();
    spawn(game, "Glorious Anthem"); // keeps the older 0/0 alive
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, ...fractal(bears));
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Applied Geometry"), { targets: [ref(bears)] });
    expect(copiesWhere(game, () => true)).toBe(2);
    expect(copiesWhere(game, (id) => (game.state.objects[id].counters["+1/+1"] ?? 0) === 6)).toBe(1);
    expect(copiesWhere(game, (id) => (game.state.objects[id].counters["+1/+1"] ?? 0) === 0)).toBe(1);
  });

  it("Hate Mirage's haste reaches the copy it made: an end-step copy never folds", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you", exileAtEndStep: true }, [ref(bears)]);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Hate Mirage"), { targets: [ref(bears), null] });
    expect(copiesWhere(game, () => true)).toBe(2);
    expect(copiesWhere(game, (id) => keywords(game, id).has("haste"))).toBe(1);
  });
});

describe("a token from an earlier turn", () => {
  it("never folds with a new one: the turn it entered is part of the fold key", () => {
    const { game } = table();
    older(game, ROBOT);
    nextTurn(game);
    nextTurn(game);
    older(game, ROBOT);
    expect(named(game, ROBOT, A)).toHaveLength(2);
    nextTurn(game);
    nextTurn(game);
    expect(named(game, ROBOT, A)).toHaveLength(2);
  });
});

describe("what singles a token out, which was right already", () => {
  it("living weapon attaches to one Germ, not to a stack the new one joined", () => {
    const { game } = table();
    spawn(game, "Glorious Anthem");
    older(game, "Phyrexian Germ Token", 2);
    lands(game, "Swamp", 5);
    const skull = toHand(game, "Batterskull");
    cast(game, skull);
    expect(tokensNamed(game, "Phyrexian Germ Token", A)).toBe(3);
    const host = game.state.objects[skull].attachedTo;
    expect(host).not.toBeNull();
    expect(game.state.objects[host as ObjectId].stackCount ?? 1).toBe(1);
  });
});
