/**
 * Khans of Tarkir and Commander 2014 (KTK, C14; B157), group A. One test per
 * card whose behaviour is more than a stat line, on the clause most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";

import {
  A,
  B,
  attack,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Breaching Leviathan", () => {
  it("cast from hand, taps every nonblue creature and they skip their next untap", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    const blue = spawn(game, "Jeskai Elder", B);
    lands(game, "Island", 9);
    const leviathan = toHand(game, "Breaching Leviathan");
    cast(game, leviathan);
    expect(zone(game, leviathan)).toBe("battlefield");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(true);
    expect(game.state.objects[blue].tapped).toBe(false);
    expect(game.state.objects[leviathan].tapped).toBe(false);
    nextTurn(game); // bob's turn: his bears stay tapped
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("does nothing when it enters without being cast", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Breaching Leviathan");
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Spoils of Blood", () => {
  it("makes an X/X Horror counting every creature that died this turn", () => {
    const { game } = table();
    destroy(game, spawn(game, "Grizzly Bears", A));
    destroy(game, spawn(game, "Grizzly Bears", B));
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Spoils of Blood"));
    const [horror] = named(game, "Horror Token (Black 0/0)", A);
    expect(horror).toBeDefined();
    expect(pt(game, horror)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Raving Dead", () => {
  it("makes the damaged player lose half their life, rounded down, after the damage", () => {
    const { game, a } = table();
    const dead = spawn(game, "Raving Dead");
    game.state.players[B].life = 21;
    attack(game, a, [dead]);
    // 21 - 2 = 19, then half of 19 rounded down (9) is lost.
    expect(life(game, B)).toBe(10);
  });
});

describe("Secret Plans", () => {
  it("gives face-down creatures +0/+1 and draws when one is turned face up", () => {
    const { game } = table();
    spawn(game, "Secret Plans");
    lands(game, "Wastes", 3);
    const aven = toHand(game, "Icefeather Aven");
    cast(game, aven, { via: "face-down" });
    expect(pt(game, aven)).toEqual({ power: 2, toughness: 3 });
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    const before = hand(game).length;
    game.dispatch({ type: "turn-face-up", player: A, permanent: aven, morph: true } as Action);
    settle(game);
    expect(game.state.objects[aven].faceDown).toBeUndefined();
    expect(pt(game, aven)).toEqual({ power: 2, toughness: 2 });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Icefeather Aven", () => {
  it("turned face up, may bounce another creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 3);
    const aven = toHand(game, "Icefeather Aven");
    cast(game, aven, { via: "face-down" });
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 1);
    a.chooseTargetsFn = () => [ref(bears)];
    pickModes(a, 0);
    game.dispatch({ type: "turn-face-up", player: A, permanent: aven, morph: true } as Action);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Raiders' Spoils", () => {
  it("pumps your creatures and lets a Warrior that hits a player draw for 1 life", () => {
    const { game, a } = table();
    spawn(game, "Raiders' Spoils");
    const heir = spawn(game, "Heir of the Wilds");
    expect(pt(game, heir)).toEqual({ power: 3, toughness: 2 });
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [heir]);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Heir of the Wilds", () => {
  it("gets +1/+1 attacking only while you control a creature with power 4 or greater", () => {
    const small = table();
    const lone = spawn(small.game, "Heir of the Wilds");
    attack(small.game, small.a, [lone]);
    expect(life(small.game, B)).toBe(18);

    const { game, a } = table();
    const heir = spawn(game, "Heir of the Wilds");
    spawn(game, "Kheru Dreadmaw");
    attack(game, a, [heir]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Mardu Charm", () => {
  it("makes two Warriors with first strike until end of turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Mardu Charm"), { modes: [1] });
    const warriors = named(game, "Warrior Token", A);
    expect(warriors.length).toBeGreaterThan(0);
    const total = warriors.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0);
    expect(total).toBe(2);
    expect(keywords(game, warriors[0]).has("first-strike")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(keywords(game, named(game, "Warrior Token", A)[0]).has("first-strike")).toBe(false);
  });
});

describe("Bring Low", () => {
  it("deals 5 to a creature with a +1/+1 counter, 3 otherwise", () => {
    const { game } = table();
    const plain = spawn(game, "Kheru Dreadmaw", B);
    const grown = spawn(game, "Kheru Dreadmaw", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(grown)]);
    settle(game);
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Bring Low"), { targets: [ref(plain)] });
    cast(game, toHand(game, "Bring Low"), { targets: [ref(grown)] });
    expect(zone(game, plain)).toBe("battlefield");
    expect(zone(game, grown)).toBe("graveyard");
  });
});

describe("Suspension Field", () => {
  it("may exile a toughness-3+ creature until it leaves", () => {
    const { game, a } = table();
    const dreadmaw = spawn(game, "Kheru Dreadmaw", B);
    a.chooseTargetsFn = () => [ref(dreadmaw)];
    pickModes(a, 0);
    const field = enter(game, "Suspension Field");
    expect(zone(game, dreadmaw)).toBe("exile");
    destroy(game, field);
    expect(named(game, "Kheru Dreadmaw", B).length).toBe(1);
  });
});

describe("Armament Corps", () => {
  it("can put both counters on itself", () => {
    const { game, a } = table();
    a.chooseTargetsFn = (_view, _source, _specs, legal) => [legal[0]?.[0] ?? null];
    const corps = enter(game, "Armament Corps");
    expect(game.state.objects[corps].counters["+1/+1"]).toBe(2);
  });
});
