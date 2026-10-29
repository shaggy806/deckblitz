import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  grant,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Meathook Massacre II", () => {
  it("makes each player sacrifice X creatures as it enters", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 6);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", B);
    // Neither dead creature comes back: alice declines her 3 life, bob pays his.
    a.chooseModesFn = () => [];
    b.chooseModesFn = () => [0];
    cast(game, toHand(game, "Meathook Massacre II"), { x: 1 });
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(named(game, "Grizzly Bears", B).length + named(game, "Hill Giant", B).length).toBe(1);
    expect(life(game, B)).toBe(17);
  });

  it("steals an opponent's dead creature unless they pay 3 life", () => {
    const { game } = table();
    spawn(game, "Meathook Massacre II");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears, A);
    const back = named(game, "Grizzly Bears", A);
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "finality")).toBe(1);
    expect(life(game, B)).toBe(20);
  });

  it("leaves it in the graveyard when its controller pays", () => {
    const { game, b } = table();
    spawn(game, "Meathook Massacre II");
    const bears = spawn(game, "Grizzly Bears", B);
    b.chooseModesFn = () => [0];
    destroy(game, bears, A);
    expect(named(game, "Grizzly Bears")).toHaveLength(0);
    expect(life(game, B)).toBe(17);
  });
});

describe("Mortarion, Daemon Primarch", () => {
  it("caps X at the life you lost this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    spawn(game, "Mortarion, Daemon Primarch");
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    settle(game);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes" && s.awaiting.player === A);
    const pay = (x: number) => ({ type: "choose-modes", player: A, modes: [0], xValue: x }) as const;
    expect(game.canDispatch(pay(4))).toMatch(/can't be greater than 3/);
    game.dispatch(pay(3));
    settle(game);
    expect(tokensNamed(game, "Astartes Warrior Token (Mortarion, Daemon Primarch)", A)).toBe(3);
  });
});

describe("Krasis Incubation", () => {
  it("returns itself to hand and counters the creature it enchanted", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const krasis = spawn(game, "Krasis Incubation");
    game.state.objects[krasis].attachedTo = bears;
    const before = hand(game).length;
    activate(game, krasis, 0);
    expect(hand(game).length).toBe(before + 1);
    expect(counters(game, bears)).toBe(2);
  });
});

describe("Hexavus", () => {
  it("takes a counter of any kind from another creature you control", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const hexavus = enter(game, "Hexavus");
    expect(counters(game, hexavus)).toBe(6);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["charge"] = 1;
    activate(game, hexavus, 1);
    expect(counters(game, bears, "charge")).toBe(0);
    expect(counters(game, hexavus)).toBe(7);
  });
});

describe("Arachnus Web", () => {
  it("is destroyed at an opponent's end step when the creature's power is 4 or more", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const big = spawn(game, "Arachnus Web");
    const small = spawn(game, "Arachnus Web");
    game.state.objects[big].attachedTo = wurm;
    game.state.objects[small].attachedTo = bears;
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, big)).toBe("graveyard");
    expect(zone(game, small)).toBe("battlefield");
  });
});

describe("Trapped in the Tower", () => {
  it("falls off a creature that gains flying", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const tower = spawn(game, "Trapped in the Tower");
    game.state.objects[tower].attachedTo = bears;
    grant(game, bears, "flying");
    toStep(game, "postcombat-main");
    expect(zone(game, tower)).toBe("graveyard");
  });
});

describe("Lost Jitte", () => {
  it("puts a +1/+1 counter on the equipped creature", () => {
    const { game } = table();
    const jitte = spawn(game, "Lost Jitte");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[jitte].attachedTo = bears;
    game.state.objects[jitte].counters["charge"] = 1;
    activate(game, jitte, 0, { modes: [2] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(counters(game, jitte, "charge")).toBe(0);
  });
});

describe("Breya, Etherium Shaper", () => {
  it("can sacrifice itself as one of the two artifacts", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const breya = spawn(game, "Breya, Etherium Shaper");
    const thopter = spawn(game, "Ornithopter");
    activate(game, breya, 0, { modes: [2] });
    expect(zone(game, breya)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("graveyard");
    expect(life(game)).toBe(25);
  });
});

describe("Insidious Fungus", () => {
  it("draws, then puts a land from hand onto the battlefield tapped", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const fungus = spawn(game, "Insidious Fungus");
    const forest = toHand(game, "Forest");
    pickFromZone(a, forest);
    a.choosePermanentsFn = (_view, eligible) => (eligible.includes(forest) ? [forest] : []);
    const before = hand(game).length;
    activate(game, fungus, 0, { modes: [2] });
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(controller(game, forest)).toBe(A);
    expect(hand(game).length).toBe(before);
  });
});
