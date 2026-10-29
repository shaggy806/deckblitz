import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const setCounters = (game: Game, id: ObjectId, kind: string, n: number): void => {
  game.state.objects[id].counters[kind] = n;
};

const onBattlefield = (game: Game, name: string, player: PlayerId): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === name && game.state.objects[id].controller === player,
  );

const permanentsOf = (game: Game, player: PlayerId): number =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === player).length;

const canActivate = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === source);

describe("Iron Spider, Stark Upgrade", () => {
  it("counters each artifact creature and Vehicle; draws by removing two from among artifacts", () => {
    const { game, a } = table();
    const spider = spawn(game, "Iron Spider, Stark Upgrade");
    const thopter = spawn(game, "Ornithopter");
    const copter = spawn(game, "Smuggler's Copter");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, spider, 0);
    expect([counters(game, spider), counters(game, thopter), counters(game, copter), counters(game, bears)]).toEqual([
      1, 1, 1, 0,
    ]);
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    a.chooseCounterRemovalsFn = () => [
      { object: spider, kind: "+1/+1", count: 1 },
      { object: thopter, kind: "+1/+1", count: 1 },
    ];
    activate(game, spider, 1);
    expect(hand(game)).toHaveLength(before + 1);
    expect([counters(game, spider), counters(game, thopter), counters(game, copter)]).toEqual([0, 0, 1]);
  });
});

describe("Banquet Guests", () => {
  it("affinity for Foods reduces X's generic; enters with twice X counters", () => {
    const { game } = table();
    spawn(game, "Food Token");
    spawn(game, "Food Token");
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    const guests = toHand(game, "Banquet Guests");
    cast(game, guests, { x: 3 });
    expect(zone(game, guests)).toBe("battlefield");
    expect(counters(game, guests)).toBe(6);
  });
});

describe("Rush of Dread", () => {
  it("all three modes: half the creatures, half the hand, half the life, each rounded up", () => {
    const { game } = table({ life: 21 });
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 8);
    const cards = hand(game, B).length;
    cast(game, toHand(game, "Rush of Dread"), { modes: [0, 1, 2], targets: [ref(B), ref(B), ref(B)] });
    expect(onBattlefield(game, "Grizzly Bears", B)).toHaveLength(1);
    expect(hand(game, B)).toHaveLength(cards - Math.ceil(cards / 2));
    expect(life(game, B)).toBe(10);
  });

  it("each mode reads its own target opponent", () => {
    const { game } = table({ players: 3 });
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears", B);
    toHand(game, "Wastes", C);
    toHand(game, "Wastes", C);
    lands(game, "Swamp", 6);
    const bobs = hand(game, B).length;
    const carols = hand(game, C).length;
    expect(carols).toBe(bobs + 2);
    cast(game, toHand(game, "Rush of Dread"), { modes: [0, 1], targets: [ref(B), ref(C)] });
    expect(onBattlefield(game, "Grizzly Bears", B)).toHaveLength(1);
    expect(hand(game, B)).toHaveLength(bobs);
    expect(hand(game, C)).toHaveLength(carols - Math.ceil(carols / 2));
  });

  it("the life mode alone costs {1}{B}{B}{2}", () => {
    const { game } = table({ life: 21 });
    spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Rush of Dread"), { modes: [2], targets: [ref(B)] });
    expect(life(game, B)).toBe(10);
    expect(onBattlefield(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Fraying Omnipotence", () => {
  it("each player loses, discards and sacrifices half, rounded up", () => {
    const { game } = table({ life: 21 });
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    lands(game, "Swamp", 5);
    const fraying = toHand(game, "Fraying Omnipotence");
    const mine = hand(game).length - 1;
    const theirs = hand(game, B).length;
    cast(game, fraying);
    expect([life(game, A), life(game, B)]).toEqual([10, 10]);
    expect(hand(game)).toHaveLength(mine - Math.ceil(mine / 2));
    expect(hand(game, B)).toHaveLength(theirs - Math.ceil(theirs / 2));
    expect(onBattlefield(game, "Grizzly Bears", B)).toHaveLength(1);
    expect(onBattlefield(game, "Grizzly Bears", A)).toHaveLength(0);
  });
});

describe("Pox Plague", () => {
  it("each player loses, discards and sacrifices half of their permanents, rounded down", () => {
    const { game } = table({ life: 21 });
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2, B);
    lands(game, "Swamp", 5);
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Pox Plague"));
    expect([life(game, A), life(game, B)]).toEqual([11, 11]);
    expect(hand(game, B)).toHaveLength(theirs - Math.floor(theirs / 2));
    // 5 permanents each: 2 sacrificed.
    expect(permanentsOf(game, B)).toBe(3);
    expect(permanentsOf(game, A)).toBe(3);
  });
});

describe("Legate Lanius, Caesar's Ace", () => {
  it("decimate: eleven creatures sacrifice two, and each sacrifice grows Lanius", () => {
    const { game } = table();
    for (let i = 0; i < 11; i += 1) spawn(game, "Grizzly Bears", B);
    const lanius = enter(game, "Legate Lanius, Caesar's Ace");
    expect(onBattlefield(game, "Grizzly Bears", B)).toHaveLength(9);
    expect(counters(game, lanius)).toBe(2);
  });
});

describe("Rift Elemental", () => {
  it("removes a time counter from another permanent you control", () => {
    const { game } = table();
    const elemental = spawn(game, "Rift Elemental");
    const ring = spawn(game, "Sol Ring");
    setCounters(game, ring, "time", 2);
    lands(game, "Mountain", 2);
    activate(game, elemental, 0);
    expect(pt(game, elemental)).toEqual({ power: 3, toughness: 1 });
    expect(counters(game, ring, "time")).toBe(1);
  });
});

describe("Reaping Willow", () => {
  it("enters with two -1/-1 counters; removing them returns a small creature card", () => {
    const { game } = table();
    const willow = enter(game, "Reaping Willow");
    expect(pt(game, willow)).toEqual({ power: 1, toughness: 4 });
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    activate(game, willow, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, willow)).toEqual({ power: 3, toughness: 6 });
  });
});

describe("Shanna, Purifying Blade", () => {
  it("X can't be greater than the life gained this turn", () => {
    const { game, a } = table();
    const shanna = spawn(game, "Shanna, Purifying Blade");
    lands(game, "Forest", 4);
    attack(game, a, [shanna], B);
    expect(life(game)).toBe(23);
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    const before = hand(game).length;
    expect(game.canDispatch({ type: "choose-modes", player: A, modes: [0], xValue: 4 } as Action)).not.toBeNull();
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 3 } as Action);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(hand(game)).toHaveLength(before + 3);
  });
});

describe("Disciple of the Ring", () => {
  it("exiles an instant to tap target creature", () => {
    const { game } = table();
    const disciple = spawn(game, "Disciple of the Ring");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 1);
    activate(game, disciple, 0, { modes: [2], targets: [ref(angel)] });
    expect(game.state.objects[angel].tapped).toBe(true);
    expect(zone(game, bolt)).toBe("exile");
  });
});

describe("Chisei, Heart of Oceans", () => {
  it("stays by removing a counter from a permanent you control, and is sacrificed with none", () => {
    const { game, a } = table();
    const chisei = spawn(game, "Chisei, Heart of Oceans");
    const ring = spawn(game, "Sol Ring");
    setCounters(game, ring, "charge", 1);
    a.chooseCounterRemovalsFn = (_view, offer) =>
      offer.eligible.length > 0 ? [{ object: ring, kind: "charge", count: 1 }] : [];
    toStep(game, "precombat-main");
    expect(zone(game, chisei)).toBe("battlefield");
    expect(counters(game, ring, "charge")).toBe(0);
    toStep(game, "precombat-main");
    expect(zone(game, chisei)).toBe("graveyard");
  });
});

describe("Encrust", () => {
  it("the enchanted permanent's abilities can't be activated and it doesn't untap", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    expect(canActivate(game, sorcerer)).toBe(true);
    lands(game, "Island", 3);
    const encrust = toHand(game, "Encrust");
    cast(game, encrust, { targets: [ref(sorcerer)] });
    expect(game.state.objects[encrust].attachedTo).toBe(sorcerer);
    expect(canActivate(game, sorcerer)).toBe(false);
    game.state.objects[sorcerer].tapped = true;
    toStep(game, "precombat-main");
    expect(game.state.objects[sorcerer].tapped).toBe(true);
  });
});

describe("Stasis Cocoon", () => {
  it("the enchanted artifact's activated abilities can't be activated", () => {
    const { game } = table();
    const egg = spawn(game, "Triassic Egg");
    lands(game, "Plains", 5);
    expect(canActivate(game, egg)).toBe(true);
    const cocoon = toHand(game, "Stasis Cocoon");
    cast(game, cocoon, { targets: [ref(egg)] });
    expect(game.state.objects[cocoon].attachedTo).toBe(egg);
    expect(canActivate(game, egg)).toBe(false);
  });
});

describe("Urborg Justice", () => {
  it("one sacrifice for each creature put into your graveyard from the battlefield this turn", () => {
    const { game } = table();
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears"));
    for (let i = 0; i < 3; i += 1) spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Urborg Justice"), { targets: [ref(B)] });
    expect(onBattlefield(game, "Grizzly Bears", B)).toHaveLength(1);
  });
});

describe("Triassic Egg", () => {
  it("sacrifices only with two hatchling counters, returning a creature card", () => {
    const { game } = table();
    const egg = spawn(game, "Triassic Egg");
    lands(game, "Wastes", 3);
    activate(game, egg, 0);
    expect(counters(game, egg, "hatchling")).toBe(1);
    const bears = toGraveyard(game, "Grizzly Bears");
    const sac = { type: "activate-ability", player: A, source: egg, abilityIndex: 1, modes: [1], targets: [ref(bears)] };
    expect(game.canDispatch(sac as Action)).not.toBeNull();
    setCounters(game, egg, "hatchling", 2);
    activate(game, egg, 1, { modes: [1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, egg)).toBe("graveyard");
  });
});

describe("Sage of Fables", () => {
  it("another Wizard enters with a counter; removing one draws", () => {
    const { game } = table();
    const sage = spawn(game, "Sage of Fables");
    const sorcerer = enter(game, "Prodigal Sorcerer");
    expect(counters(game, sorcerer)).toBe(1);
    lands(game, "Wastes", 2);
    const before = hand(game).length;
    activate(game, sage, 0);
    expect(hand(game)).toHaveLength(before + 1);
    expect(counters(game, sorcerer)).toBe(0);
  });
});
